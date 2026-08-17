-- ===========================================================================
-- Carry registration details into the profile rows
-- ===========================================================================
-- Registration now asks for more than an email and a password: a name, an
-- optional phone, and two or three facts that depend on the account type.
--
-- None of it can be written by the client at that moment. Email confirmation is
-- on, so there is no session between "Create account" and the confirmation
-- link — the browser has nothing to authenticate a write with. The details ride
-- in the signup metadata instead, and this trigger copies them into the right
-- row as the account is created.
--
-- These are facts people state about themselves, so trusting them for their own
-- profile is no different from trusting the onboarding form. Nothing here
-- confers privilege: `role` is still clamped, and admin remains unreachable
-- from any metadata value.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. Phone
-- ---------------------------------------------------------------------------
-- Asked for at registration, optional, and useful to whoever follows up.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text;


-- ---------------------------------------------------------------------------
-- 2. Casting that cannot fail the signup
-- ---------------------------------------------------------------------------
-- A number field arriving as "3,200" or "" must not abort account creation. A
-- signup that 500s because someone typed a comma is a worse outcome than a
-- profile with one empty column, so bad input becomes NULL and the account is
-- still created.

CREATE OR REPLACE FUNCTION public.safe_numeric(_value text)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  RETURN NULLIF(regexp_replace(coalesce(_value, ''), '[^0-9.\-]', '', 'g'), '')::numeric;
EXCEPTION WHEN others THEN
  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.safe_numeric(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.safe_numeric(text) TO service_role;


-- ---------------------------------------------------------------------------
-- 3. Provisioning, with the details
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta jsonb := coalesce(NEW.raw_user_meta_data, '{}'::jsonb);
  requested text;
  city text;
  mgmt text;
BEGIN
  INSERT INTO public.profiles (id, email, display_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(meta ->> 'display_name', ''),
    NULLIF(meta ->> 'phone', '')
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

  requested := meta ->> 'role';

  -- 'agent' accepted as an alias so migrated Good Tenants signups keep working.
  IF requested = 'agent' THEN
    requested := 'realtor';
  END IF;

  -- Only non-privileged account types are self-selectable. 'admin', 'editor',
  -- an unrecognised value or NULL all yield an account with no role.
  IF requested NOT IN ('tenant', 'landlord', 'realtor') THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, requested::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  IF requested = 'tenant' THEN
    city := NULLIF(meta ->> 'desired_city', '');
    INSERT INTO public.tenant_profiles (
      id, desired_cities, max_monthly_rent, move_date_flexibility
    )
    VALUES (
      NEW.id,
      CASE WHEN city IS NULL THEN NULL ELSE ARRAY[city] END,
      public.safe_numeric(meta ->> 'max_monthly_rent'),
      NULLIF(meta ->> 'move_date_flexibility', '')
    )
    ON CONFLICT (id) DO NOTHING;

  ELSIF requested = 'landlord' THEN
    -- Validated against the enum rather than cast blindly: an unexpected value
    -- would raise, and raising here would fail the whole signup.
    mgmt := NULLIF(meta ->> 'management_type', '');
    IF mgmt IS NOT NULL AND mgmt NOT IN ('self', 'company', 'hybrid') THEN
      mgmt := NULL;
    END IF;

    INSERT INTO public.landlord_profiles (id, property_count, management_type)
    VALUES (
      NEW.id,
      public.safe_numeric(meta ->> 'property_count')::integer,
      mgmt::public.management_type
    )
    ON CONFLICT (id) DO NOTHING;

  ELSIF requested = 'realtor' THEN
    INSERT INTO public.realtor_profiles (id, agency, license_number, years_experience)
    VALUES (
      NEW.id,
      NULLIF(meta ->> 'agency', ''),
      NULLIF(meta ->> 'license_number', ''),
      public.safe_numeric(meta ->> 'years_experience')::integer
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
