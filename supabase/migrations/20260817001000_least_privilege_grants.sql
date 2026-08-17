-- ===========================================================================
-- Least-privilege table grants
-- ===========================================================================
-- Discovered while verifying the baseline: Supabase ships ALTER DEFAULT
-- PRIVILEGES rules that grant anon and authenticated *every* privilege on every
-- new table in public. So the carefully scoped GRANTs in the baseline were
-- additive no-ops, and row-level security was the only thing standing between
-- an anonymous visitor and public.user_roles.
--
-- RLS did hold — the probes returned nothing. But "one policy is all that
-- separates a stranger from the roles table" is precisely the arrangement that
-- produced the live exposure in the rentals database, where a permissive policy
-- met a blanket grant. With four apps merging into one database, the grant layer
-- has to mean something on its own.
--
-- After this migration:
--   * anon holds SELECT on published content and INSERT on the public inbox.
--     Nothing else. Not even SELECT on profiles or user_roles.
--   * authenticated holds what the app actually uses; RLS still gates rows.
--   * service_role keeps full access, as the server paths require.
--   * Future tables in public grant nothing by default. A new table is
--     unreachable until its migration says otherwise — which is the rule the
--     build plan states and this makes true.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. Stop the blanket defaults for future tables
-- ---------------------------------------------------------------------------
-- Default privileges are recorded per creating role. postgres is the role that
-- runs migrations here; supabase_admin is included because the dashboard's
-- table editor creates objects as that role. Either ALTER may be refused
-- depending on the connection's rights, so each is attempted independently and
-- a refusal is reported rather than failing the migration.

DO $$
BEGIN
  ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    REVOKE ALL ON TABLES FROM anon, authenticated;
  RAISE NOTICE 'default privileges tightened for role postgres';
EXCEPTION WHEN insufficient_privilege THEN
  RAISE WARNING 'could not alter default privileges for postgres - do this from the dashboard';
END $$;

DO $$
BEGIN
  ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
    REVOKE ALL ON TABLES FROM anon, authenticated;
  RAISE NOTICE 'default privileges tightened for role supabase_admin';
EXCEPTION WHEN insufficient_privilege THEN
  RAISE WARNING 'could not alter default privileges for supabase_admin - expected on a pooled connection';
END $$;

DO $$
BEGIN
  ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    REVOKE ALL ON SEQUENCES FROM anon, authenticated;
EXCEPTION WHEN insufficient_privilege THEN
  RAISE WARNING 'could not alter default sequence privileges';
END $$;


-- ---------------------------------------------------------------------------
-- 2. Reset what the baseline already created
-- ---------------------------------------------------------------------------

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;

-- Schema usage is still required to reach anything at all.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;


-- ---------------------------------------------------------------------------
-- 3. Grant back, explicitly
-- ---------------------------------------------------------------------------

-- --- anonymous visitors ---------------------------------------------------
-- Read published content. Submit a question. That is the entire public surface.
GRANT SELECT ON
  public.topics,
  public.articles,
  public.ask_qa,
  public.case_studies,
  public.property_posts,
  public.sidebar_promos
TO anon;

GRANT INSERT ON public.question_submissions TO anon;

-- --- signed-in accounts ---------------------------------------------------
-- Content: read, plus write privileges that RLS narrows to admin and editor.
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.topics,
  public.articles,
  public.ask_qa,
  public.case_studies,
  public.property_posts,
  public.sidebar_promos
TO authenticated;

-- Identity: read only, and RLS narrows that to your own row or an admin's view.
-- No INSERT or DELETE on user_roles for anyone but the service role — role
-- assignment is a server path, not a client one.
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (display_name) ON public.profiles TO authenticated;

-- Funnel sessions: readable only through the owning account's policy. Writes
-- belong to the server function that owns the signed cookie.
GRANT SELECT ON public.funnel_sessions TO authenticated;

-- The public inbox: submit, and — for admins, via RLS — triage.
GRANT INSERT, SELECT, UPDATE, DELETE ON public.question_submissions TO authenticated;

-- --- server paths ---------------------------------------------------------
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;


-- ---------------------------------------------------------------------------
-- 4. Note for every later migration
-- ---------------------------------------------------------------------------
-- Tables added from here on receive no privileges automatically. Each new table
-- must grant what it needs in its own migration, next to its RLS policies.
-- A table whose migration forgets is unreachable rather than wide open, which is
-- the failure direction to prefer.
