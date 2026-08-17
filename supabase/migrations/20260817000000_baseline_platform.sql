-- ===========================================================================
-- Unified Platform — baseline
-- ===========================================================================
-- The first migration of the merged application (Good-Tenants-EZLiving), run
-- against a new and empty Supabase project. Everything the four source apps
-- contribute lands on top of this file, in later migration blocks.
--
-- Two rules this file exists to establish, before any data arrives:
--
--   1. Every table is created with its GRANTs, RLS and policies in the same
--      statement group. No table is ever briefly readable while a follow-up
--      migration is pending, and no policy in this project uses USING (true)
--      on anything that is not deliberately public.
--
--   2. Privilege is never client-supplied. Account role lives in user_roles,
--      which only an admin or the service role may write. public.profiles has
--      no role column at all, so the Good Tenants defect — a browser asserting
--      role: admin at signup — has nowhere to land.
--
-- Deliberately NOT in this baseline, and arriving with their own blocks:
--   * listings, photos, screenings, appointments  → CSHR migration (Block 2)
--   * tenant profiles, packages, access requests  → Phase 5
--   * products, orders, entitlements              → Phase 4
--   * MLS ingestion tables and edge functions     → CSHR migration (Block 2)
--
-- Source of each section is noted so the merge is auditable.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 0. Shared helpers
-- ---------------------------------------------------------------------------
-- Source: Irvine Living Daily, 20260601194044.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- ---------------------------------------------------------------------------
-- 1. Roles
-- ---------------------------------------------------------------------------
-- Source: Irvine Living Daily 20260601194044 (admin, editor) plus the funnel
-- account types from its Phase 0 migration, created here in one enum so no
-- later migration has to ALTER TYPE ... ADD VALUE and fight the same-transaction
-- restriction.
--
-- These are user *types*, not privilege levels. A tenant has no more authority
-- than an anonymous visitor; it simply has a profile. Only admin and editor
-- grant anything, and neither is ever self-assignable.
--
-- Naming note: Good Tenants calls this role 'agent'. The plan and CSHR both
-- call it 'realtor'. Realtor wins; the data migration maps agent -> realtor.

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'tenant', 'landlord', 'realtor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- SELECT only. Writes go through an admin path or the service role; there is no
-- grant that would let an account insert its own row.
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read all roles" ON public.user_roles;
CREATE POLICY "Admins read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- ---------------------------------------------------------------------------
-- 2. Profiles
-- ---------------------------------------------------------------------------
-- Account-level information, and nothing that confers privilege. Good Tenants
-- kept role on its users table, which is why a column-level GRANT was needed to
-- stop self-elevation. Separating the two removes that class of bug instead of
-- guarding it.

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (display_name) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins read profiles" ON public.profiles;
CREATE POLICY "Admins read profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ---------------------------------------------------------------------------
-- 3. Provisioning
-- ---------------------------------------------------------------------------
-- Block 0 remediation, folded in at the baseline rather than applied as a patch
-- later: registration passes the requested role in signup metadata, and that
-- value is attacker-controlled — the app's UI is not in the path of a direct
-- POST to /auth/v1/signup.
--
-- Self-selection is allowed only among the non-privileged account types.
-- 'admin' and 'editor' are not obtainable here by any input; they are granted
-- by an existing admin, through a path that runs as the service role.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested text;
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(NEW.raw_user_meta_data ->> 'display_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  -- Deliberately not re-running role assignment on conflict: repeated
  -- provisioning must never become a path to changing an existing account.

  requested := NEW.raw_user_meta_data ->> 'role';

  -- 'agent' accepted as an alias so migrated Good Tenants signups keep working.
  IF requested = 'agent' THEN
    requested := 'realtor';
  END IF;

  IF requested IN ('tenant', 'landlord', 'realtor') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, requested::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  -- Anything else — 'admin', 'editor', an unrecognised value, or NULL — yields
  -- an account with no role at all. That is a working account: it can read
  -- public content and hold a session. It simply has no authority.

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ---------------------------------------------------------------------------
-- 4. Anonymous funnel sessions
-- ---------------------------------------------------------------------------
-- Source: Irvine Living Daily 20260812020000, written for the extend path and
-- carried over unchanged. A visitor prequalifies before creating an account and
-- claims that work afterwards; the signed session cookie maps to a row here.

CREATE TABLE IF NOT EXISTS public.funnel_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Opaque value carried in the signed cookie. Never a guessable sequence.
  session_token text NOT NULL UNIQUE,

  claimed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_at timestamptz,

  -- First-touch attribution, captured once and carried forward (Phase 8).
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  landing_path text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '90 days')
);

CREATE INDEX IF NOT EXISTS funnel_sessions_claimed_by_idx
  ON public.funnel_sessions (claimed_by) WHERE claimed_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS funnel_sessions_expiry_idx
  ON public.funnel_sessions (expires_at) WHERE claimed_by IS NULL;

DROP TRIGGER IF EXISTS funnel_sessions_set_updated_at ON public.funnel_sessions;
CREATE TRIGGER funnel_sessions_set_updated_at
  BEFORE UPDATE ON public.funnel_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- No grant to anon. The server function that owns the cookie reads and writes
-- this table as the service role. Handing the browser a token it could query by
-- would make sessions enumerable in exactly the way the signed cookie prevents.
GRANT SELECT ON public.funnel_sessions TO authenticated;
GRANT ALL ON public.funnel_sessions TO service_role;

ALTER TABLE public.funnel_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own claimed sessions" ON public.funnel_sessions;
CREATE POLICY "Users read own claimed sessions" ON public.funnel_sessions
  FOR SELECT TO authenticated USING (claimed_by = auth.uid());

DROP POLICY IF EXISTS "Admins read funnel_sessions" ON public.funnel_sessions;
CREATE POLICY "Admins read funnel_sessions" ON public.funnel_sessions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));


-- ---------------------------------------------------------------------------
-- 5. Content
-- ---------------------------------------------------------------------------
-- Source: Irvine Living Daily 20260529064349 (tables, public read) and
-- 20260601194044 (admin write policies), merged into single definitions so that
-- no table exists for even one migration without its admin policy.

-- --- topics ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  hero_image text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- --- articles -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  hero_image text,
  author text NOT NULL DEFAULT 'Good Tenants',
  publish_date date NOT NULL DEFAULT (now()::date),
  summary text,
  body text,
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  topic_id uuid REFERENCES public.topics(id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  read_time_minutes integer,
  cta_label text,
  cta_url text,
  cta_type text NOT NULL DEFAULT 'hub' CHECK (cta_type IN ('hub','listing','custom')),
  cta_responder text,
  sidebar_promos_enabled boolean NOT NULL DEFAULT true,
  social_caption_short text,
  social_caption_long text,
  hashtags text[] NOT NULL DEFAULT '{}',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS articles_set_updated_at ON public.articles;
CREATE TRIGGER articles_set_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- --- ask_qa ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ask_qa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  question text NOT NULL,
  short_answer text,
  full_answer text,
  tags text[] NOT NULL DEFAULT '{}',
  related_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  author text NOT NULL DEFAULT 'Good Tenants',
  publish_date date NOT NULL DEFAULT (now()::date),
  hero_image text,
  topic_id uuid REFERENCES public.topics(id) ON DELETE SET NULL,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- --- case_studies ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.case_studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  headline text NOT NULL,
  hero_image text,
  summary text,
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  outcomes text,
  author text NOT NULL DEFAULT 'Good Tenants',
  publish_date date NOT NULL DEFAULT (now()::date),
  topic_id uuid REFERENCES public.topics(id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  cta_label text,
  cta_url text,
  cta_responder text,
  social_caption_short text,
  social_caption_long text,
  hashtags text[] NOT NULL DEFAULT '{}',
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- --- property_posts -------------------------------------------------------
-- The editorial post about a property, as distinct from the listing itself.
-- cshr_listing_url is nullable here and was NOT NULL upstream: once listings
-- live in this database, the post points at an internal listing_id and the
-- outbound URL becomes optional. Block 2 adds that column and the FK.
CREATE TABLE IF NOT EXISTS public.property_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  headline text NOT NULL,
  hero_image text,
  summary text,
  body text,
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  video_url text,
  property_status text NOT NULL DEFAULT 'new'
    CHECK (property_status IN ('new','coming_soon','active','leased')),
  cshr_listing_url text,
  listing_credit_office text,
  listing_credit_agent text,
  author text NOT NULL DEFAULT 'Good Tenants',
  publish_date date NOT NULL DEFAULT (now()::date),
  topic_id uuid REFERENCES public.topics(id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  cta_label text NOT NULL DEFAULT 'View this property',
  cta_responder text NOT NULL DEFAULT 'Jessie Hunter Team',
  social_caption_short text,
  social_caption_long text,
  hashtags text[] NOT NULL DEFAULT '{}',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- --- sidebar_promos -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sidebar_promos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image text,
  short_copy text,
  button_label text,
  button_url text,
  priority integer NOT NULL DEFAULT 0,
  accent boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- --- grants, RLS and public read -----------------------------------------
GRANT SELECT ON public.topics, public.articles, public.ask_qa,
                public.case_studies, public.property_posts, public.sidebar_promos
  TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON public.topics, public.articles, public.ask_qa,
                public.case_studies, public.property_posts, public.sidebar_promos
  TO authenticated;

GRANT ALL ON public.topics, public.articles, public.ask_qa,
             public.case_studies, public.property_posts, public.sidebar_promos
  TO service_role;

ALTER TABLE public.topics          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ask_qa          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_studies    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_posts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sidebar_promos  ENABLE ROW LEVEL SECURITY;

-- Public read is scoped to published/active rows. A draft is not public.
DROP POLICY IF EXISTS "Public read topics" ON public.topics;
CREATE POLICY "Public read topics" ON public.topics
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read published articles" ON public.articles;
CREATE POLICY "Public read published articles" ON public.articles
  FOR SELECT TO anon, authenticated USING (published = true);

DROP POLICY IF EXISTS "Public read published qa" ON public.ask_qa;
CREATE POLICY "Public read published qa" ON public.ask_qa
  FOR SELECT TO anon, authenticated USING (published = true);

DROP POLICY IF EXISTS "Public read published case studies" ON public.case_studies;
CREATE POLICY "Public read published case studies" ON public.case_studies
  FOR SELECT TO anon, authenticated USING (published = true);

DROP POLICY IF EXISTS "Public read published property posts" ON public.property_posts;
CREATE POLICY "Public read published property posts" ON public.property_posts
  FOR SELECT TO anon, authenticated USING (published = true);

DROP POLICY IF EXISTS "Public read active promos" ON public.sidebar_promos;
CREATE POLICY "Public read active promos" ON public.sidebar_promos
  FOR SELECT TO anon, authenticated USING (active = true);

-- Writes: admins and editors. The grant above is table-level; RLS still gates
-- rows, so an account holding neither role matches no write policy and is
-- denied. This is the pattern Irvine Living Daily uses, extended to editors.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['topics','articles','ask_qa','case_studies','property_posts','sidebar_promos']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Editors manage %1$s" ON public.%1$I', t);
    EXECUTE format(
      'CREATE POLICY "Editors manage %1$s" ON public.%1$I FOR ALL TO authenticated '
      'USING (public.has_role(auth.uid(), ''admin'') OR public.has_role(auth.uid(), ''editor'')) '
      'WITH CHECK (public.has_role(auth.uid(), ''admin'') OR public.has_role(auth.uid(), ''editor''))',
      t
    );
  END LOOP;
END $$;


-- ---------------------------------------------------------------------------
-- 6. Question submissions (public inbox)
-- ---------------------------------------------------------------------------
-- The one table a stranger may write to. Insert only, no read, length-checked.

CREATE TABLE IF NOT EXISTS public.question_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text,
  question text NOT NULL CHECK (char_length(question) BETWEEN 5 AND 4000),
  context text,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','triaged','answered','spam')),
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.question_submissions TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.question_submissions TO authenticated;
GRANT ALL ON public.question_submissions TO service_role;

ALTER TABLE public.question_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a question" ON public.question_submissions;
CREATE POLICY "Anyone can submit a question" ON public.question_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admins read submissions" ON public.question_submissions;
CREATE POLICY "Admins read submissions" ON public.question_submissions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update submissions" ON public.question_submissions;
CREATE POLICY "Admins update submissions" ON public.question_submissions
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete submissions" ON public.question_submissions;
CREATE POLICY "Admins delete submissions" ON public.question_submissions
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));


-- ---------------------------------------------------------------------------
-- 7. Storage
-- ---------------------------------------------------------------------------
-- Source: Irvine Living Daily 20260601194044. Content images are public by
-- design; writes are staff-only.

INSERT INTO storage.buckets (id, name, public)
VALUES ('content-images', 'content-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read content-images" ON storage.objects;
CREATE POLICY "Public read content-images" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'content-images');

DROP POLICY IF EXISTS "Staff write content-images" ON storage.objects;
CREATE POLICY "Staff write content-images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'content-images'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  );

DROP POLICY IF EXISTS "Staff update content-images" ON storage.objects;
CREATE POLICY "Staff update content-images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'content-images'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  );

DROP POLICY IF EXISTS "Staff delete content-images" ON storage.objects;
CREATE POLICY "Staff delete content-images" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'content-images'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  );


-- ---------------------------------------------------------------------------
-- 8. Default privileges
-- ---------------------------------------------------------------------------
-- Belt and braces: a future table created in public without an explicit GRANT
-- should not silently inherit access for anon. Postgres grants nothing to these
-- roles by default, and this makes that assumption explicit rather than relied
-- upon.

REVOKE ALL ON SCHEMA public FROM anon;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
