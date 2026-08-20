-- ===========================================================================
-- The rest of the tables, from all three source projects
-- ===========================================================================
-- A sweep rather than a phase. Comparing every table declared in the three
-- source repos against this database left 24 unaccounted for:
--
--   the daily          0 — complete since phase 01
--   Good Tenants Hub   1 — referrals
--   the rentals site  23 — the whole social and campaign automation stack
--
-- The 23 are what phase 05 was going to bring across: social accounts, posts,
-- content, campaigns, analytics, templates, the posting queue, commission
-- tracking, image analysis queues and the AI prompt library. Their shapes come
-- from that repo's generated types, which describe the schema as it stands
-- after all 77 of its migrations.
--
-- NOTHING HERE HAS A PUBLIC POLICY, AND THAT IS DELIBERATE.
--
-- Every one of these is operational: a queue, an audit trail, an API token
-- record, a rendering job. None of it is content a visitor should read, and
-- several hold third-party credentials or the history of who changed what.
-- They are admin-only, and the edge functions that drive them run under
-- service_role, which bypasses row-level security and is unaffected.
--
-- The tables arrive before the functions that fill them. That is the right
-- order: a table with no writer is inert, whereas a function with no table
-- fails at the moment it is first needed.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.admin_campaign_actions (
  action_type text NOT NULL,
  admin_user_id uuid NOT NULL,
  campaign_id uuid NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  new_state jsonb NOT NULL,
  previous_state jsonb NOT NULL,
  reason text,
  target_post_id uuid
);

CREATE TABLE IF NOT EXISTS public.admin_settings_audit (
  admin_user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  new_value text NOT NULL,
  previous_value text,
  setting_key text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ai_prompt_templates (
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  description text,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active boolean,
  name text NOT NULL,
  platform text,
  prompt_type text NOT NULL,
  updated_at timestamptz DEFAULT now(),
  version integer
);

CREATE TABLE IF NOT EXISTS public.ayrshare_usage_tracking (
  created_at timestamptz DEFAULT now(),
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  last_reset_date date,
  month_year text NOT NULL,
  plan_type text,
  posts_limit numeric,
  posts_used numeric,
  quota_alerts_sent jsonb,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.elevenlabs_voices (
  created_at timestamptz DEFAULT now() NOT NULL,
  default_speed numeric,
  default_style numeric,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active boolean NOT NULL,
  model_id uuid NOT NULL,
  name text NOT NULL,
  similarity_boost numeric,
  stability numeric,
  voice_id uuid NOT NULL,
  weight numeric NOT NULL
);

CREATE TABLE IF NOT EXISTS public.hashtag_sets (
  created_at timestamptz DEFAULT now() NOT NULL,
  hashtags text NOT NULL,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.listing_analysis_queue (
  attempts integer NOT NULL,
  enqueued_at timestamptz DEFAULT now() NOT NULL,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  last_error text,
  listing_id uuid NOT NULL,
  status text NOT NULL,
  taxonomy_version numeric NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.listing_campaign_platform_videos (
  created_at timestamptz DEFAULT now() NOT NULL,
  creatomate_template_id uuid,
  error_message text,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_campaign_id uuid NOT NULL,
  platform text NOT NULL,
  render_id uuid,
  render_status text NOT NULL,
  template_id uuid,
  template_version numeric,
  updated_at timestamptz DEFAULT now() NOT NULL,
  variable_mapping jsonb,
  video_url text
);

CREATE TABLE IF NOT EXISTS public.listing_campaigns (
  campaign_id uuid,
  campaign_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intended_platforms jsonb,
  is_disabled boolean,
  listing_id uuid NOT NULL,
  listing_index numeric,
  override_by_admin_id uuid,
  override_reason text,
  photo_threshold_override boolean,
  updated_at timestamptz DEFAULT now(),
  video_render_id uuid,
  video_status text,
  video_url text,
  voiceover_enabled boolean,
  voiceover_provider text,
  voiceover_script text
);

CREATE TABLE IF NOT EXISTS public.listing_commission_audit (
  action text NOT NULL,
  created_at timestamptz DEFAULT now(),
  error_message text,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL,
  new_state jsonb,
  previous_state jsonb,
  source text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.listing_commissions (
  commission_available boolean,
  commission_notes text,
  commission_type text,
  commission_value numeric,
  created_at timestamptz DEFAULT now(),
  everycatch_response_at timestamptz,
  everycatch_sync_status text,
  everycatch_webhook_sent_at timestamptz,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.listing_post_schedule (
  approved_by_admin text,
  ayrshare_post_id uuid,
  campaign_id uuid,
  compliance_error text,
  compliance_status text NOT NULL,
  content_id uuid,
  created_at timestamptz DEFAULT now(),
  error_message text,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  includes_cta_disclosure boolean NOT NULL,
  includes_listing_agent boolean NOT NULL,
  includes_listing_office boolean NOT NULL,
  includes_mls_number boolean NOT NULL,
  includes_source_mls boolean NOT NULL,
  includes_status_label boolean NOT NULL,
  listing_campaign_id uuid,
  listing_id uuid,
  platforms text[],
  post_sequence numeric NOT NULL,
  posted_at timestamptz,
  retry_count integer,
  scheduled_for text NOT NULL,
  showing_language_detected boolean NOT NULL,
  status text,
  updated_at timestamptz DEFAULT now(),
  uses_primary_photo_only boolean NOT NULL
);

CREATE TABLE IF NOT EXISTS public.listing_visual_summary (
  conversational_highlights jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  dominant_style text,
  exterior_count integer,
  interior_count integer,
  listing_id uuid NOT NULL,
  neighbourhood_count integer,
  tone_hint text
);

CREATE TABLE IF NOT EXISTS public.oauth_states (
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  realtor_account_id uuid,
  redirect_url text,
  state_token text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.platform_configurations (
  ai_caption_enabled boolean NOT NULL,
  ai_enhancement_enabled boolean NOT NULL,
  caption_template text,
  created_at timestamptz DEFAULT now() NOT NULL,
  creatomate_template_id uuid,
  custom_hashtags text,
  extract_features_enabled boolean NOT NULL,
  hashtag_set_id uuid,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inter_listing_delay_minutes numeric,
  is_active boolean NOT NULL,
  is_available boolean NOT NULL,
  last_availability_check text,
  platform text NOT NULL,
  post_interval_hours numeric,
  posting_time_window_end text,
  posting_time_window_start text,
  spin_tax_enabled boolean NOT NULL,
  title_template text,
  updated_at timestamptz DEFAULT now() NOT NULL,
  variable_mapping jsonb,
  variation_strength text NOT NULL,
  voice_override_id uuid,
  voiceover_template text,
  voiceover_variants numeric NOT NULL
);

CREATE TABLE IF NOT EXISTS public.platform_posting_queue (
  content_id uuid,
  created_at timestamptz DEFAULT now(),
  error_message text,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid,
  platform text NOT NULL,
  post_number numeric NOT NULL,
  posted_at timestamptz,
  scheduled_for text NOT NULL,
  status text
);

CREATE TABLE IF NOT EXISTS public.social_media_accounts (
  access_token text,
  account_id uuid,
  account_info jsonb,
  account_name text NOT NULL,
  ayrshare_connected boolean,
  connection_health text,
  connection_method text,
  created_at timestamptz DEFAULT now() NOT NULL,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active boolean,
  last_sync_at timestamptz,
  platform text NOT NULL,
  platform_user_id uuid,
  platform_username text,
  realtor_account_id uuid,
  refresh_token text,
  scope text,
  token_expires_at timestamptz,
  token_type text,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.social_media_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text NOT NULL,
  metric_value numeric NOT NULL,
  platform text NOT NULL,
  post_id uuid,
  recorded_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.social_media_campaigns (
  budget_spent numeric,
  budget_total numeric,
  created_at timestamptz DEFAULT now() NOT NULL,
  description text,
  end_date date,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  realtor_account_id uuid,
  start_date date,
  status text NOT NULL,
  target_platforms text[] NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.social_media_content (
  ai_prompt text,
  campaign_id uuid,
  content_type text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  description text,
  generated_text text,
  generation_status text NOT NULL,
  hashtags text[],
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid,
  media_urls text[],
  platform text NOT NULL,
  title text,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.social_media_posts (
  content_id uuid,
  created_at timestamptz DEFAULT now() NOT NULL,
  engagement_metrics jsonb,
  error_message text,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  platform_post_id uuid,
  platform_post_url text,
  post_url text,
  published_at timestamptz,
  scheduled_at timestamptz,
  status text NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.social_media_template_logs (
  campaign_id uuid,
  created_at timestamptz DEFAULT now() NOT NULL,
  details jsonb NOT NULL,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  listing_id uuid,
  message text,
  platform text,
  status text NOT NULL,
  template_id uuid,
  version integer
);

CREATE TABLE IF NOT EXISTS public.social_media_templates (
  created_at timestamptz DEFAULT now() NOT NULL,
  created_by text,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_default boolean NOT NULL,
  last_preview_at timestamptz,
  last_preview_status text,
  last_preview_version numeric,
  last_used_at timestamptz,
  note text,
  preview_url text,
  status text NOT NULL,
  template_key text NOT NULL,
  template_payload jsonb NOT NULL,
  title text NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  updated_by text,
  version integer NOT NULL
);

-- ---------------------------------------------------------------------------
-- Good Tenants Hub: referrals
-- ---------------------------------------------------------------------------
-- The one hub table still outstanding. The programme itself is not launched —
-- /referral-program says as much — but the record of who referred whom is what
-- the Realtor dashboard will read when it is.

CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_email text,
  referred_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  source text,
  status text NOT NULL DEFAULT 'invited'
    CHECK (status IN ('invited', 'signed_up', 'converted', 'closed')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS referrals_referrer_idx ON public.referrals (referrer_id);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- A referrer sees their own referrals and nobody else's.
CREATE POLICY "Referrers read own referrals" ON public.referrals
  FOR SELECT TO authenticated USING (referrer_id = auth.uid());

CREATE POLICY "Referrers create own referrals" ON public.referrals
  FOR INSERT TO authenticated WITH CHECK (referrer_id = auth.uid());

CREATE POLICY "Admins manage referrals" ON public.referrals
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT ON public.referrals TO authenticated;


-- ---------------------------------------------------------------------------
-- Row level security and grants for the automation tables
-- ---------------------------------------------------------------------------

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'admin_campaign_actions', 'admin_settings_audit', 'ai_prompt_templates',
    'ayrshare_usage_tracking', 'elevenlabs_voices', 'hashtag_sets',
    'listing_analysis_queue', 'listing_campaign_platform_videos',
    'listing_campaigns', 'listing_commission_audit', 'listing_commissions',
    'listing_post_schedule', 'listing_visual_summary', 'oauth_states',
    'platform_configurations', 'platform_posting_queue',
    'social_media_accounts', 'social_media_analytics', 'social_media_campaigns',
    'social_media_content', 'social_media_posts', 'social_media_template_logs',
    'social_media_templates'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admins manage %1$s" ON public.%1$I', t);
    EXECUTE format(
      'CREATE POLICY "Admins manage %1$s" ON public.%1$I FOR ALL TO authenticated '
      'USING (public.has_role(auth.uid(), ''admin'')) '
      'WITH CHECK (public.has_role(auth.uid(), ''admin''))', t);
    EXECUTE format(
      'GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
  END LOOP;
END $$;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
