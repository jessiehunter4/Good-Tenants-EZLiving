-- Block 0 remediation: stop trusting the browser for the account role.
--
-- PROPOSAL — NOT YET RUN. This directory had no migration history, so the
-- statements below are written against the schema inferred from
-- src/integrations/supabase/types.ts. Capture a baseline dump first (see
-- README.md), confirm the object names, then apply on a branch database.
--
-- ---------------------------------------------------------------------------
-- The problem
-- ---------------------------------------------------------------------------
-- Registration called:
--
--   supabase.auth.signUp({ email, password, options: { data: { role } } })
--
-- so the role landed in raw_user_meta_data straight from the client. Whatever
-- copies that into public.users.role therefore trusts a value the caller chose.
-- Anyone can POST to /auth/v1/signup directly with {"data":{"role":"admin"}} —
-- the app's UI is not in that path.
--
-- The client-side guard did not work either: it compared a SHA-256 hash held
-- as a constant in the shipped bundle, using `createHash` imported as a named
-- export from crypto-js/sha256 — which exports the hash function as the module
-- itself, so the identifier was undefined and the call threw into a catch.
--
-- The client fix (already applied) removes the dead gate and stops offering
-- `admin` at registration. That is a usability guard only. This migration is
-- the actual control.

-- ---------------------------------------------------------------------------
-- 1. Clamp the role that new-user provisioning will accept
-- ---------------------------------------------------------------------------
-- Adjust the function name/body to match the trigger that currently exists on
-- auth.users. Inspect it first:
--
--   SELECT tgname, pg_get_triggerdef(oid)
--   FROM pg_trigger WHERE tgrelid = 'auth.users'::regclass AND NOT tgisinternal;
--
-- If the existing function is named differently, edit the name below rather
-- than creating a second trigger — two triggers writing public.users.role will
-- fight, and the losing one will fail silently.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role text;
  effective_role text;
BEGIN
  requested_role := NEW.raw_user_meta_data ->> 'role';

  -- Only non-privileged account types may be self-selected. Anything else --
  -- including 'admin', an unrecognised value, or NULL -- becomes 'tenant'.
  IF requested_role IN ('tenant', 'agent', 'landlord') THEN
    effective_role := requested_role;
  ELSE
    effective_role := 'tenant';
  END IF;

  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, effective_role)
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
    -- Deliberately NOT updating role on conflict: re-running provisioning must
    -- never be a path to changing an existing account's role.

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

-- Recreate the trigger only if one does not already exist under another name.
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 2. Prevent self-elevation after the fact
-- ---------------------------------------------------------------------------
-- Even with provisioning clamped, a user who can UPDATE their own row in
-- public.users could set role='admin' themselves. Confirm whether such a policy
-- exists, and if so, exclude the role column from it:
--
--   SELECT policyname, cmd, qual, with_check
--   FROM pg_policies WHERE schemaname='public' AND tablename='users';
--
-- Column-level privileges are the reliable control here, because RLS cannot
-- express "any column except this one":

REVOKE UPDATE ON public.users FROM authenticated;
GRANT UPDATE (email) ON public.users TO authenticated;

-- Role changes now require service_role — i.e. an admin-only server path.

-- ---------------------------------------------------------------------------
-- 3. Audit what already exists
-- ---------------------------------------------------------------------------
-- This migration does not demote anyone; that is a judgement call, not a
-- mechanical one. Review the current admins before deciding:
--
--   SELECT u.id, u.email, u.role, au.created_at
--   FROM public.users u
--   JOIN auth.users au ON au.id = u.id
--   WHERE u.role = 'admin'
--   ORDER BY au.created_at;
--
-- Any admin account you do not recognise was self-registered. Treat that as an
-- incident rather than a cleanup task.
