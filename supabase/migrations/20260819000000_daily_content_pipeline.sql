-- ===========================================================================
-- Phase 01 — the daily moves in: schema
-- ===========================================================================
-- EZ Living Irvine's publishing machinery, carried across from
-- `Irvine Living Daily/supabase/migrations`. The content tables themselves
-- (articles, topics, ask_qa, case_studies, property_posts, sidebar_promos,
-- question_submissions) already landed in the platform baseline; this is
-- everything that surrounds them:
--
--   the SEO and CTA fields the CMS writes
--   the AI article pipeline: seeds, batches, drafts
--   the CTA library those drafts point at
--   the feed queue and daily selection
--   lead capture, admin invites, ask notifications
--
-- Shapes, constraints and defaults are the source's, so the CMS and the server
-- functions can be moved without rewriting their queries. Two departures, both
-- deliberate and marked DEPARTURE.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. Fields the CMS expects on the content it already has
-- ---------------------------------------------------------------------------
-- The platform baseline took the content tables from the daily's first
-- migration, which predates its SEO and CTA work. Without these the editor
-- screens have nowhere to write.

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS focus_keyword text,
  ADD COLUMN IF NOT EXISTS keywords text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS og_image text,
  ADD COLUMN IF NOT EXISTS og_title text,
  ADD COLUMN IF NOT EXISTS og_description text,
  ADD COLUMN IF NOT EXISTS twitter_card text NOT NULL DEFAULT 'summary_large_image',
  ADD COLUMN IF NOT EXISTS canonical_url text,
  ADD COLUMN IF NOT EXISTS noindex boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS schema_jsonld jsonb,
  ADD COLUMN IF NOT EXISTS internal_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS cta_destination_id uuid,
  ADD COLUMN IF NOT EXISTS citation text,
  ADD COLUMN IF NOT EXISTS social_cta_phrase text,
  ADD COLUMN IF NOT EXISTS link_in_bio_url text;

ALTER TABLE public.ask_qa
  ADD COLUMN IF NOT EXISTS cta_destination_id uuid,
  ADD COLUMN IF NOT EXISTS cta_label text,
  ADD COLUMN IF NOT EXISTS cta_url text,
  ADD COLUMN IF NOT EXISTS cta_responder text,
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS emotion text,
  ADD COLUMN IF NOT EXISTS image_prompt text;

ALTER TABLE public.question_submissions
  ADD COLUMN IF NOT EXISTS answered_qa_id uuid;


-- ---------------------------------------------------------------------------
-- 2. The CTA library
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.cta_destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('hub','listing','lead_form','opt_in','external','sms','calendar')),
  url text NOT NULL,
  responder text NOT NULL DEFAULT 'Jessie Hunter Team / Good Tenants',
  description text,
  button_text text,
  default_for_slot text CHECK (default_for_slot IS NULL OR default_for_slot IN ('market','listing','tip','community')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.cta_destinations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cta_destinations TO authenticated;
GRANT ALL ON public.cta_destinations TO service_role;
ALTER TABLE public.cta_destinations ENABLE ROW LEVEL SECURITY;

-- DEPARTURE 1. The source had no public read policy, because its CTA labels
-- were rendered server-side. This app renders them in the browser, so an active
-- CTA must be readable by a visitor — and only an active one.
DROP POLICY IF EXISTS "Public read active CTAs" ON public.cta_destinations;
CREATE POLICY "Public read active CTAs" ON public.cta_destinations
  FOR SELECT TO anon, authenticated USING (active = true);

DROP POLICY IF EXISTS "Admins manage cta_destinations" ON public.cta_destinations;
CREATE POLICY "Admins manage cta_destinations" ON public.cta_destinations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS cta_destinations_updated_at ON public.cta_destinations;
CREATE TRIGGER cta_destinations_updated_at BEFORE UPDATE ON public.cta_destinations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- The daily's own CTA set, carried across as seeded.
INSERT INTO public.cta_destinations (slug, label, kind, url, button_text, default_for_slot, description) VALUES
  ('hub', 'Good Tenants Hub', 'hub', 'https://goodtenants.com/go', 'Talk to Good Tenants', NULL, 'Universal hub fallback for general posts'),
  ('lead_renter_profile', 'Build Your Good Tenant Profile', 'lead_form', '/start?intent=renter-profile', 'Start my profile', 'tip', 'Captures renter contact + intake to build Good Tenant resume'),
  ('lead_strategy_call', 'Book an Irvine Rental Strategy Call', 'lead_form', '/start?intent=strategy-call', 'Book my call', 'community', 'Captures contact for a Jessie Hunter Team consult'),
  ('opt_in_rent_report', 'Get the Full Irvine Rent Report', 'opt_in', '/start?intent=rent-report', 'Send me the report', 'market', 'Email gate to download the latest market report'),
  ('opt_in_full_article', 'Read the Full Breakdown', 'opt_in', '/start?intent=full-article', 'Send me the full article', NULL, 'Email gate teaser used in short social posts'),
  ('listing_default', 'View This Property', 'listing', '/rentals', 'See the listing', 'listing', 'Per-post listing URL — replaced per draft')
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE public.articles
  DROP CONSTRAINT IF EXISTS articles_cta_destination_id_fkey;
ALTER TABLE public.articles
  ADD CONSTRAINT articles_cta_destination_id_fkey
  FOREIGN KEY (cta_destination_id) REFERENCES public.cta_destinations(id) ON DELETE SET NULL;


-- ---------------------------------------------------------------------------
-- 3. The AI article pipeline
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.article_seeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot text NOT NULL CHECK (slot IN ('market','listing','tip','community')),
  title_angle text NOT NULL,
  visual_description text,
  citation text,
  reference_urls text[] NOT NULL DEFAULT '{}',
  notes text,
  source_week integer,
  last_used_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS article_seeds_slot_active_idx
  ON public.article_seeds (slot, active, last_used_at NULLS FIRST);

CREATE TABLE IF NOT EXISTS public.ai_article_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start date NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','partial','approved','published','mixed')),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_article_batches_week_idx ON public.ai_article_batches (week_start DESC);

CREATE TABLE IF NOT EXISTS public.ai_article_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid REFERENCES public.ai_article_batches(id) ON DELETE CASCADE,
  slot text NOT NULL CHECK (slot IN ('market','listing','tip','community')),
  source_seed_id uuid REFERENCES public.article_seeds(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review','approved','rejected','published','generating','failed')),
  generated_article jsonb NOT NULL DEFAULT '{}'::jsonb,
  hero_image_url text,
  cta_destination_id uuid REFERENCES public.cta_destinations(id) ON DELETE SET NULL,
  cta_custom_url text,
  cta_custom_label text,
  scheduled_for timestamptz,
  model_used text,
  generation_log jsonb NOT NULL DEFAULT '[]'::jsonb,
  regeneration_count integer NOT NULL DEFAULT 0,
  reject_reason text,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  published_article_id uuid REFERENCES public.articles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_article_drafts_batch_idx ON public.ai_article_drafts (batch_id);
CREATE INDEX IF NOT EXISTS ai_article_drafts_status_sched_idx
  ON public.ai_article_drafts (status, scheduled_for);


-- ---------------------------------------------------------------------------
-- 4. Lead capture, invites, ask notifications
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.lead_captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intent text NOT NULL,
  source text NOT NULL DEFAULT 'direct' CHECK (source IN ('article','social','direct','email','other')),
  source_slug text,
  name text,
  email text,
  phone text,
  message text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','converted','archived')),
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lead_captures_created_idx ON public.lead_captures (created_at DESC);
CREATE INDEX IF NOT EXISTS lead_captures_intent_idx ON public.lead_captures (intent);

CREATE TABLE IF NOT EXISTS public.admin_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  invited_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_invites_email_lower_idx ON public.admin_invites (lower(email));
CREATE INDEX IF NOT EXISTS admin_invites_open_idx ON public.admin_invites (lower(email))
  WHERE accepted_at IS NULL AND revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS public.ask_notification_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- ---------------------------------------------------------------------------
-- 5. The feed queue and daily selection
-- ---------------------------------------------------------------------------
-- The daily's own pull of rental drops. Phase 02 replaces the ingestion behind
-- it with the MLS pipeline; these tables are what the publishing loop reads, so
-- they come with the CMS rather than with the listings.

CREATE TABLE IF NOT EXISTS public.cshr_drops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_url text NOT NULL UNIQUE,
  external_id text,
  address text,
  headline text,
  summary text,
  hero_image text,
  price numeric,
  beds numeric,
  baths numeric,
  sqft integer,
  available_at date,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','published','dismissed')),
  property_post_id uuid REFERENCES public.property_posts(id) ON DELETE SET NULL,
  selection_score smallint,
  selection_notes text,
  synced_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cshr_drops_status_idx ON public.cshr_drops (status, synced_at DESC);

CREATE TABLE IF NOT EXISTS public.cshr_sync_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  source text NOT NULL DEFAULT 'manual',
  inserted_count integer NOT NULL DEFAULT 0,
  updated_count integer NOT NULL DEFAULT 0,
  error text
);

CREATE TABLE IF NOT EXISTS public.cshr_selection_config (
  id text PRIMARY KEY DEFAULT 'default',
  auto_publish boolean NOT NULL DEFAULT false,
  score_threshold smallint NOT NULL DEFAULT 70,
  daily_cap smallint NOT NULL DEFAULT 3,
  community_weights jsonb DEFAULT '{}',
  price_min integer,
  price_max integer,
  require_hero_image boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.cshr_selection_config (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.featured_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  featured_date date NOT NULL UNIQUE,
  drop_id uuid REFERENCES public.cshr_drops(id) ON DELETE SET NULL,
  property_post_id uuid REFERENCES public.property_posts(id) ON DELETE SET NULL,
  community text,
  property_type text,
  ai_score smallint,
  ai_reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  diversity_passed boolean,
  was_override boolean NOT NULL DEFAULT false,
  state text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','approved','published','skipped')),
  slug text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS featured_history_date_idx ON public.featured_history (featured_date DESC);


-- ---------------------------------------------------------------------------
-- 6. updated_at
-- ---------------------------------------------------------------------------

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'article_seeds','ai_article_batches','ai_article_drafts','admin_invites','cshr_drops'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %1$s_updated_at ON public.%1$I', t);
    EXECUTE format(
      'CREATE TRIGGER %1$s_updated_at BEFORE UPDATE ON public.%1$I '
      'FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t);
  END LOOP;
END $$;


-- ---------------------------------------------------------------------------
-- 7. Row level security
-- ---------------------------------------------------------------------------
-- Editorial machinery is staff-only. The exception is lead_captures, which a
-- visitor must be able to write to and must never be able to read.

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'article_seeds','ai_article_batches','ai_article_drafts','lead_captures',
    'admin_invites','ask_notification_recipients','cshr_drops','cshr_sync_runs',
    'cshr_selection_config','featured_history'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- Staff-managed tables, one policy each.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'article_seeds','ai_article_batches','ai_article_drafts','admin_invites',
    'ask_notification_recipients','cshr_drops','featured_history'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Admins manage %1$s" ON public.%1$I', t);
    EXECUTE format(
      'CREATE POLICY "Admins manage %1$s" ON public.%1$I FOR ALL TO authenticated '
      'USING (public.has_role(auth.uid(), ''admin'')) '
      'WITH CHECK (public.has_role(auth.uid(), ''admin''))', t);
  END LOOP;
END $$;

-- DEPARTURE 2. The source shipped cshr_selection_config with
-- FOR ALL TO authenticated USING (true) — any signed-in account could flip
-- auto-publish on and drop the score threshold to zero. That is Block 0's
-- finding, and the corrected policy is what lands here. The table is created
-- right the first time rather than created wrong and patched.
DROP POLICY IF EXISTS "Admins manage selection config" ON public.cshr_selection_config;
CREATE POLICY "Admins manage selection config" ON public.cshr_selection_config
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins read sync runs" ON public.cshr_sync_runs;
CREATE POLICY "Admins read sync runs" ON public.cshr_sync_runs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Lead capture: anyone may submit, with the source's length limits kept so a
-- form cannot be used to write a novel into the table. Nobody but an admin reads.
DROP POLICY IF EXISTS "Public can submit leads" ON public.lead_captures;
CREATE POLICY "Public can submit leads" ON public.lead_captures
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(coalesce(intent, '')) BETWEEN 1 AND 80
    AND length(coalesce(name, '')) <= 200
    AND length(coalesce(email, '')) <= 320
    AND length(coalesce(phone, '')) <= 40
    AND length(coalesce(message, '')) <= 4000
    AND length(coalesce(source_slug, '')) <= 200
  );

DROP POLICY IF EXISTS "Admins manage leads" ON public.lead_captures;
CREATE POLICY "Admins manage leads" ON public.lead_captures
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- ---------------------------------------------------------------------------
-- 8. Grants
-- ---------------------------------------------------------------------------
-- Default privileges are revoked in this project, so unlike in the source these
-- are the only privileges that exist.

GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.article_seeds, public.ai_article_batches, public.ai_article_drafts,
  public.admin_invites, public.ask_notification_recipients, public.cshr_drops,
  public.featured_history, public.lead_captures
TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.cshr_selection_config TO authenticated;
GRANT SELECT ON public.cshr_sync_runs TO authenticated;

-- The only public write on this side of the merge.
GRANT INSERT ON public.lead_captures TO anon;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
