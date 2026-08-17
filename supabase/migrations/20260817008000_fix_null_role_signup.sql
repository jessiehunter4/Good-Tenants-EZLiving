-- ===========================================================================
-- Signup fails when no role is supplied
-- ===========================================================================
-- Found by creating an account with no `role` in its metadata — which is what
-- an admin-created account, an OAuth signup, or any caller that simply omits
-- the field looks like. Signup returned:
--
--   null value in column "role" of relation "user_roles" violates not-null
--
-- The guard was:
--
--   IF requested NOT IN ('tenant', 'landlord', 'realtor') THEN RETURN NEW;
--
-- With `requested` NULL that comparison is NULL, not true, so the early return
-- never fired and execution fell through to an INSERT of NULL::app_role. Three
-- valued logic: NULL NOT IN (...) is unknown, and an unknown IF does nothing.
--
-- Every prior test passed a role — including the junk-input one, which passed
-- 'lots' and correctly returned early — so the hole survived until an account
-- was created with the field absent rather than wrong.
--
-- The fix is the explicit NULL check. The behaviour is unchanged for every
-- other input: an account with no recognised role is created with no role.
-- ===========================================================================

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

  IF requested = 'agent' THEN
    requested := 'realtor';
  END IF;

  -- IS NULL first: without it a missing role reaches the INSERT below.
  IF requested IS NULL OR requested NOT IN ('tenant', 'landlord', 'realtor') THEN
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
