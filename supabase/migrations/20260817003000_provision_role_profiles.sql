-- ===========================================================================
-- Runtime corrections found by exercising the app against the database
-- ===========================================================================
-- Two defects, both found by replaying the app's own queries rather than by
-- reading the schema. Neither would have surfaced until a real user tried to
-- finish onboarding.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. A column the generated types did not know about
-- ---------------------------------------------------------------------------
-- useTenantOnboarding writes desired_property_types. It is absent from
-- src/integrations/supabase/types.ts, which is what the reconstruction was
-- built from — so the generated types are stale relative to the app, and the
-- reconstruction inherited the gap. Without this column the preferences step
-- fails outright.
--
-- Worth noting for the rest of the merge: types.ts is a lower bound on the old
-- schema, not a faithful copy. Other columns may be missing in the same way and
-- will only appear when a screen writes to them.

ALTER TABLE public.tenant_profiles
  ADD COLUMN IF NOT EXISTS desired_property_types text[];


-- ---------------------------------------------------------------------------
-- 2. The role profile row onboarding assumes already exists
-- ---------------------------------------------------------------------------
-- Onboarding calls .update() on tenant_profiles keyed by the user id — it never
-- inserts. The original schema must therefore have created that row at signup,
-- through a trigger that was never captured in any migration.
--
-- The baseline's handle_new_user created only profiles and the role grant, so
-- onboarding would have updated zero rows and reported success: the toast says
-- "preferences saved", the database keeps nothing, and nothing errors. A silent
-- write failure is the worst shape this bug could take, which is why it is
-- fixed here rather than left for the app to work around.
--
-- Each role gets its matching profile row, created empty at the moment the
-- account is created.

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

  requested := NEW.raw_user_meta_data ->> 'role';

  -- 'agent' accepted as an alias so migrated Good Tenants signups keep working.
  IF requested = 'agent' THEN
    requested := 'realtor';
  END IF;

  -- Only non-privileged account types are self-selectable. 'admin', 'editor',
  -- an unrecognised value or NULL all yield an account with no role.
  IF requested IN ('tenant', 'landlord', 'realtor') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, requested::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    -- The role's profile row, so that onboarding has something to update.
    IF requested = 'tenant' THEN
      INSERT INTO public.tenant_profiles (id) VALUES (NEW.id)
        ON CONFLICT (id) DO NOTHING;
    ELSIF requested = 'landlord' THEN
      INSERT INTO public.landlord_profiles (id) VALUES (NEW.id)
        ON CONFLICT (id) DO NOTHING;
    ELSIF requested = 'realtor' THEN
      INSERT INTO public.realtor_profiles (id) VALUES (NEW.id)
        ON CONFLICT (id) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
