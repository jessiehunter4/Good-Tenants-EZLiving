-- ===========================================================================
-- Phase 03 — the renter decides field by field
-- ===========================================================================
-- Good Tenants Hub answers the consent question better than this app does, so
-- its answer replaces ours rather than sitting beside it.
--
-- What we had: one `tenant_profiles` row and one all-or-nothing decision. A
-- landlord either saw a renter's whole profile or none of it, through a granted
-- `directory_access_requests` row.
--
-- What the hub had: a published public profile with a switch on each sensitive
-- band — rent range, credit band, income band — plus a separate
-- `tenant_private_packages` holding the things a landlord only ever sees with
-- permission: income and credit bands, eviction and background status, rental
-- history.
--
-- HOW THEY ARE RECONCILED
--
-- Not by copying the hub's three tables in. Phase 03 established that a renter
-- has one profile and it is `tenant_profiles`; adding a second profile table
-- would undo that a week later. So the hub's *control* comes across and lands
-- on the profile we already have:
--
--   * the share flags, the publication state and the display name become
--     columns on `tenant_profiles`
--   * `tenant_private_packages` is a genuinely different sensitivity tier and
--     does come across as its own table
--   * `access_requests` does not — `directory_access_requests` is the same
--     concept, already policied and already verified working
--
-- And the enforcement is a view, the same way listings work. A per-field switch
-- honoured only in React is not a consent model; it is a hope. `tenant_directory`
-- nulls a band the renter has not shared, so what is not shared is not sent.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. Publication and per-field sharing, on the profile that already exists
-- ---------------------------------------------------------------------------

ALTER TABLE public.tenant_profiles
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS household_type text
    CHECK (household_type IS NULL OR household_type IN
      ('individual', 'family', 'roommates', 'blended_family')),
  -- Each of these is a decision the renter makes, separately.
  ADD COLUMN IF NOT EXISTS share_rent_range boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS share_credit_band boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS share_income_band boolean NOT NULL DEFAULT false,
  -- Two gates, not one: the renter publishes, and staff approve. Either can
  -- withhold a profile from the directory on its own.
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS admin_approved_at timestamptz;

COMMENT ON COLUMN public.tenant_profiles.is_published IS
  'The renter has chosen to appear in the directory. Necessary, not sufficient '
  '— admin_approved_at must also be set.';

COMMENT ON COLUMN public.tenant_profiles.share_credit_band IS
  'Per-field consent, carried from Good Tenants Hub. A renter can show their '
  'rent range without showing their credit band. Enforced by the '
  'tenant_directory view, which nulls what is not shared.';


-- ---------------------------------------------------------------------------
-- 2. The private package
-- ---------------------------------------------------------------------------
-- Carried from the hub as its own table because it is a different tier: these
-- are the facts a landlord sees only with permission, and keeping them apart
-- makes "released only through a granted request" a property of the schema
-- rather than of a WHERE clause somebody has to remember.

CREATE TABLE IF NOT EXISTS public.tenant_private_packages (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  income_band text,
  credit_band text,
  eviction_status text,
  background_status text,
  rental_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.tenant_private_packages IS
  'The Good Tenant Application Package. Readable by the renter, by an admin, '
  'and by a partner holding a granted directory_access_request — nobody else.';

ALTER TABLE public.tenant_private_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Renters read own package" ON public.tenant_private_packages
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Renters write own package" ON public.tenant_private_packages
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Renters update own package" ON public.tenant_private_packages
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins manage packages" ON public.tenant_private_packages
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- The consent path. Mirrors the hub's tpp_select_granted, against the request
-- table this app already had.
CREATE POLICY "Consented partners read package" ON public.tenant_private_packages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.directory_access_requests r
      WHERE r.tenant_id = tenant_private_packages.user_id
        AND r.requester_id = auth.uid()
        AND r.consent_granted IS TRUE
        AND (r.expires_at IS NULL OR r.expires_at > now())
    )
  );

GRANT SELECT, INSERT, UPDATE ON public.tenant_private_packages TO authenticated;

DROP TRIGGER IF EXISTS tenant_private_packages_updated_at ON public.tenant_private_packages;
CREATE TRIGGER tenant_private_packages_updated_at
  BEFORE UPDATE ON public.tenant_private_packages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ---------------------------------------------------------------------------
-- 3. The directory, with the switches honoured in SQL
-- ---------------------------------------------------------------------------
-- Income is bucketed rather than exact. A landlord deciding whether to invite
-- someone to apply needs to know the range; the number itself is the private
-- package's business, and only with permission.

CREATE OR REPLACE FUNCTION public.income_band(monthly numeric)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN monthly IS NULL THEN NULL
    WHEN monthly < 4000  THEN 'Under $4k/mo'
    WHEN monthly < 6000  THEN '$4k–6k/mo'
    WHEN monthly < 9000  THEN '$6k–9k/mo'
    WHEN monthly < 13000 THEN '$9k–13k/mo'
    ELSE '$13k+/mo'
  END
$$;

DROP VIEW IF EXISTS public.tenant_directory;

CREATE VIEW public.tenant_directory
WITH (security_barrier = true) AS
SELECT
  t.id,
  coalesce(nullif(t.display_name, ''), 'Good Tenant') AS display_name,
  t.household_type,
  t.household_size,
  t.desired_cities,
  t.desired_state,
  t.min_bedrooms,
  t.min_bathrooms,
  t.pets,
  t.move_in_date,
  t.earliest_move_date,
  t.move_date_flexibility,
  t.bio,
  t.profile_image_url,
  t.is_pre_screened,
  t.screening_status,
  t.status,
  -- The three switches. What is not shared is not selected, so it never
  -- reaches the caller in any form.
  CASE WHEN t.share_rent_range THEN t.max_monthly_rent END AS max_monthly_rent,
  CASE WHEN t.share_credit_band THEN t.credit_score_estimate END AS credit_band,
  CASE WHEN t.share_income_band THEN public.income_band(t.household_income) END AS income_band,
  t.share_rent_range,
  t.share_credit_band,
  t.share_income_band,
  t.created_at,
  t.updated_at
FROM public.tenant_profiles t
-- Both gates. The renter published it and staff approved it.
WHERE t.is_published IS TRUE
  AND t.admin_approved_at IS NOT NULL;

COMMENT ON VIEW public.tenant_directory IS
  'Renters who chose to be listed and were approved. Exact income is never in '
  'it; the bands a renter did not share come back null. The full profile is '
  'still gated by directory_access_requests — this is what a partner may see '
  'before asking.';

GRANT SELECT ON public.tenant_directory TO authenticated;


-- ---------------------------------------------------------------------------
-- 4. Where a landlord says what they are looking for
-- ---------------------------------------------------------------------------
-- Carried from the hub's property_needs. The mirror image of a renter's
-- profile: a landlord describing the tenancy rather than the property.

CREATE TABLE IF NOT EXISTS public.property_needs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  city text,
  state text,
  beds_min integer CHECK (beds_min IS NULL OR (beds_min >= 0 AND beds_min <= 10)),
  baths_min numeric(3, 1) CHECK (baths_min IS NULL OR (baths_min >= 0 AND baths_min <= 10)),
  rent_min integer CHECK (rent_min IS NULL OR rent_min >= 0),
  rent_max integer CHECK (rent_max IS NULL OR rent_max >= 0),
  pets_ok boolean,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.property_needs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own needs" ON public.property_needs
  FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Admins manage property needs" ON public.property_needs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_needs TO authenticated;

DROP TRIGGER IF EXISTS property_needs_updated_at ON public.property_needs;
CREATE TRIGGER property_needs_updated_at BEFORE UPDATE ON public.property_needs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ---------------------------------------------------------------------------
-- 5. Contact messages
-- ---------------------------------------------------------------------------
-- The hub's contact form. Bounded the same way the other public writes here
-- are, rather than the source's `WITH CHECK (true)`.

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  role text,
  message text NOT NULL,
  source_path text,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can send a bounded message" ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(coalesce(name, '')) BETWEEN 1 AND 200
    AND length(coalesce(email, '')) BETWEEN 3 AND 320
    AND email LIKE '%_@_%'
    AND length(coalesce(message, '')) BETWEEN 1 AND 4000
    AND length(coalesce(phone, '')) <= 40
    AND length(coalesce(source_path, '')) <= 200
    AND status = 'new'
  );

CREATE POLICY "Admins manage contact messages" ON public.contact_messages
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;
