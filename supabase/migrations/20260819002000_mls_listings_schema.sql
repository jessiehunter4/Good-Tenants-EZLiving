-- ===========================================================================
-- Phase 02 — the listings move in: schema
-- ===========================================================================
-- Coming Soon Home Rentals' core tables, replayed as one baseline rather than
-- 77 migrations. Shapes come from that repo's generated types, which describe
-- the schema as it actually stands after all 77.
--
-- THE NAMING COLLISION, RESOLVED TWO DIFFERENT WAYS
--
-- `listings`: both apps have one, and they are not the same thing. This
-- platform's holds properties a landlord or agent entered about their own
-- rental, with an `owner_id`. The rentals site's holds MLS-syndicated
-- inventory: nobody here owns those rows, they arrive from a feed, and they
-- carry display permissions that make re-syndication and editing a compliance
-- question rather than a product decision. Merging them would mean losing the
-- distinction that governs what may be done with each. The MLS side becomes
-- `mls_listings`, which also says where a row came from — the thing that
-- matters most when deciding what may be shown.
--
-- `tenant_profiles`: also in both, but here the collision dissolves on
-- inspection. The rentals site's is full_name, phone, email_verified and a
-- GoHighLevel contact id — an account record, not a rental profile. This
-- platform's `profiles` already is that table. So it does not come across at
-- all; only `ghl_contact_id` does, as a column on `profiles`. One table fewer,
-- and this is the merge actually happening rather than being deferred.
--
-- SECURITY CORRECTIONS, FOLDED IN
--
-- The rentals site bootstrapped with `USING (true)` policies on listings and
-- photos for every verb — anonymous insert, update and delete — and several
-- tenant tables carried `FOR ALL USING (true)` over income, credit tier and
-- contact details. A remediation was written for that repo
-- (20260812000000_block0_rls_remediation.sql) and never applied. Its policies
-- are the ones below: the tables are created correct rather than created wrong
-- and patched. Where that file left a note about what it could not fix, this
-- migration fixes it instead — see realtor_accounts.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. The GoHighLevel linkage, onto the profile that already exists
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ghl_contact_id text;

COMMENT ON COLUMN public.profiles.ghl_contact_id IS
  'GoHighLevel contact id. Carried from the rentals site''s tenant_profiles, '
  'which was an account record rather than a rental profile.';


-- ---------------------------------------------------------------------------
-- 2. mls_listings
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.mls_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity and provenance
  mls_number text,
  source_mls text DEFAULT 'CRMLS',
  source_updated_at timestamptz,
  slug text,
  realtor_account_id uuid,

  -- Address and location
  address text NOT NULL,
  neighborhood text,
  county text,
  subdivision text,
  latitude numeric,
  longitude numeric,

  -- The rental
  rent numeric,
  security_deposit numeric,
  application_fee numeric,
  bedrooms integer,
  bathrooms numeric,
  sqft integer,
  lot_size numeric,
  year_built integer,
  property_type text,
  property_sub_type text,
  architectural_style text,
  description text,

  -- Availability and status
  status text DEFAULT 'coming_soon',
  computed_status text DEFAULT 'coming_soon',
  date_available date,
  list_date date,
  start_showing_date date,
  lease_expiration_date date,
  lease_terms text,
  tenant_occupied boolean,
  -- The authoritative MLS field: the sole trigger for coming soon → active.
  contract_status_change_date date,

  -- Terms a renter is screened against
  pets_allowed boolean,
  min_credit_score integer,
  income_requirement_multiplier numeric,
  occupancy_limits text,
  special_conditions text,
  utilities_included text[],

  -- Features
  appliances text[],
  exterior_features text[],
  cooling_type text,
  heating_type text,
  flooring_type text,
  roof_type text,
  construction_materials text,
  fencing text,
  fireplace_features text,
  landscaping text,
  pool_features text,
  garage_spaces integer,
  covered_parking_spaces integer,
  total_parking_spaces integer,
  parking_spaces integer,

  -- Costs beyond rent
  hoa_fee numeric,
  hoa_frequency text,
  mello_roos numeric,
  property_taxes numeric,
  tax_year integer,

  -- Neighbourhood
  school_district text,
  elementary_school text,
  middle_school text,
  high_school text,
  walk_score integer,
  transit_score integer,
  bike_score integer,

  -- Media
  video_url text,
  virtual_tour_url text,
  floor_plan_url text,
  disclosure_documents text[],

  -- Attribution. Required when a listing is displayed: it is not optional
  -- decoration, it is the condition on which the feed may be shown at all.
  agent_name text,
  agent_phone text,
  agent_license text,
  brokerage text,
  listing_agent_name text,
  listing_agent_phone text,
  listing_agent_email text,
  listing_agent_license text,
  listing_office_name text,
  listing_office_license text,
  listing_office_phone text,
  co_listing_agent_name text,
  co_listing_office_name text,

  -- Display permissions. The feed says what may be shown; these are that
  -- answer, and the read policy below enforces the first of them.
  internet_display_allowed boolean NOT NULL DEFAULT true,
  address_display_allowed boolean NOT NULL DEFAULT true,
  media_display_allowed boolean NOT NULL DEFAULT true,
  showing_allowed boolean NOT NULL DEFAULT true,
  open_house_allowed boolean NOT NULL DEFAULT true,
  suppressed_reason text,

  showing_instructions text,
  bac text,
  uploaded_by text,
  csv_row jsonb,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT mls_listings_address_unique UNIQUE (address)
);

CREATE INDEX IF NOT EXISTS mls_listings_address_idx ON public.mls_listings (address);
CREATE INDEX IF NOT EXISTS mls_listings_rent_idx ON public.mls_listings (rent);
CREATE INDEX IF NOT EXISTS mls_listings_bedrooms_idx ON public.mls_listings (bedrooms);
CREATE INDEX IF NOT EXISTS mls_listings_bathrooms_idx ON public.mls_listings (bathrooms);
CREATE INDEX IF NOT EXISTS mls_listings_status_idx ON public.mls_listings (status);
CREATE INDEX IF NOT EXISTS mls_listings_property_type_idx ON public.mls_listings (property_type);
CREATE INDEX IF NOT EXISTS mls_listings_slug_lookup_idx ON public.mls_listings (slug);
CREATE UNIQUE INDEX IF NOT EXISTS mls_listings_slug_idx
  ON public.mls_listings (slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS mls_listings_mls_number_idx
  ON public.mls_listings (mls_number) WHERE mls_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS mls_listings_description_fts_idx
  ON public.mls_listings USING gin (to_tsvector('english', coalesce(description, '')));


-- ---------------------------------------------------------------------------
-- 3. realtor_accounts
-- ---------------------------------------------------------------------------
-- The source table had no owning user, so its remediation could only make it
-- admin-only, with a note saying to add an owner column before widening it.
-- Doing that now is cheaper than doing it later: a realtor who cannot see
-- their own account record is a support ticket waiting to happen.

CREATE TABLE IF NOT EXISTS public.realtor_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  business_name text NOT NULL,
  contact_email text,
  contact_phone text,
  is_active boolean NOT NULL DEFAULT true,
  subscription_tier text NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS realtor_accounts_user_idx ON public.realtor_accounts (user_id);

ALTER TABLE public.mls_listings
  DROP CONSTRAINT IF EXISTS mls_listings_realtor_account_id_fkey;
ALTER TABLE public.mls_listings
  ADD CONSTRAINT mls_listings_realtor_account_id_fkey
  FOREIGN KEY (realtor_account_id) REFERENCES public.realtor_accounts(id) ON DELETE SET NULL;


-- ---------------------------------------------------------------------------
-- 4. mls_listing_photos
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.mls_listing_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.mls_listings(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  ordering integer,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mls_listing_photos_listing_idx
  ON public.mls_listing_photos (listing_id, ordering);


-- ---------------------------------------------------------------------------
-- 5. The funnel: contact, prequalification, screening, booking
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.tenant_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.mls_listings(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  mobile_number text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tenant_contacts_listing_idx ON public.tenant_contacts (listing_id);
CREATE INDEX IF NOT EXISTS tenant_contacts_user_idx ON public.tenant_contacts (user_id);

CREATE TABLE IF NOT EXISTS public.tenant_prequalification_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  tenant_contact_id uuid REFERENCES public.tenant_contacts(id) ON DELETE SET NULL,

  household_income numeric NOT NULL,
  num_adults integer DEFAULT 1,
  num_children integer DEFAULT 0,
  has_pets boolean DEFAULT false,
  num_pets integer DEFAULT 0,
  pet_sizes text[],
  credit_score_estimate text NOT NULL,

  earliest_move_date date NOT NULL,
  latest_move_date date,

  max_rent numeric,
  min_bedrooms integer,
  preferred_locations text[],

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tenant_prequal_user_idx
  ON public.tenant_prequalification_profiles (user_id);

CREATE TABLE IF NOT EXISTS public.tenant_screenings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_contact_id uuid REFERENCES public.tenant_contacts(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES public.mls_listings(id) ON DELETE CASCADE,
  num_tenants_over_18 integer NOT NULL,
  has_pets boolean NOT NULL,
  num_pets integer DEFAULT 0,
  pet_sizes text[],
  credit_score_estimate text NOT NULL
    CHECK (credit_score_estimate IN ('excellent', 'good', 'fair', 'poor', 'not_sure')),
  earliest_move_date date NOT NULL,
  latest_move_date date NOT NULL,
  total_household_income numeric NOT NULL,
  qualification_result text,
  qualification_reasons text[],
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tenant_screenings_listing_idx ON public.tenant_screenings (listing_id);

CREATE TABLE IF NOT EXISTS public.showing_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.mls_listings(id) ON DELETE CASCADE,
  prequalification_profile_id uuid
    REFERENCES public.tenant_prequalification_profiles(id) ON DELETE SET NULL,
  tenant_contact_id uuid REFERENCES public.tenant_contacts(id) ON DELETE SET NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,

  session_id text NOT NULL,

  property_active_date date,
  listing_address text NOT NULL,

  ghl_calendar_id text NOT NULL,
  ghl_appointment_id text NOT NULL,
  ghl_contact_id text,
  ghl_staff_id text,

  booked_datetime timestamptz NOT NULL,
  booking_timestamp timestamptz DEFAULT now(),
  status text DEFAULT 'booked',

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS showing_appointments_listing_idx
  ON public.showing_appointments (listing_id, booked_datetime);
CREATE INDEX IF NOT EXISTS showing_appointments_user_idx
  ON public.showing_appointments (user_id);

CREATE TABLE IF NOT EXISTS public.tenant_property_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES public.mls_listings(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  is_favourite boolean DEFAULT false,
  is_bookmarked boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, listing_id)
);


-- ---------------------------------------------------------------------------
-- 6. Ingestion and operations
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.rental_import_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text NOT NULL,
  target_zips text[] NOT NULL DEFAULT '{}',
  bedrooms_min integer,
  bedrooms_max integer,
  rent_min numeric,
  rent_max numeric,
  statuses text[] NOT NULL DEFAULT ARRAY['coming_soon', 'active', 'pending']::text[],
  active_max_days_on_market integer,
  schedule_type text NOT NULL CHECK (schedule_type IN ('once', 'daily', 'weekly', 'interval')),
  schedule_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  enabled boolean NOT NULL DEFAULT true,
  next_sync_at timestamptz,
  last_sync_at timestamptz,
  last_sync_status text,
  last_sync_error text,
  last_imported_count integer,
  run_once_completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.listing_image_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.mls_listings(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_type text NOT NULL DEFAULT 'unknown',
  room_type text,
  topics text[] DEFAULT ARRAY[]::text[],
  detected_features jsonb,
  style_assessment text,
  quality_score numeric,
  is_hero_candidate boolean DEFAULT false,
  taxonomy_version integer DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS listing_image_analysis_listing_idx
  ON public.listing_image_analysis (listing_id);

CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);


-- ---------------------------------------------------------------------------
-- 7. updated_at
-- ---------------------------------------------------------------------------

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'mls_listings', 'realtor_accounts', 'tenant_prequalification_profiles',
    'showing_appointments', 'tenant_property_views', 'rental_import_jobs',
    'site_settings'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %1$s_updated_at ON public.%1$I', t);
    EXECUTE format(
      'CREATE TRIGGER %1$s_updated_at BEFORE UPDATE ON public.%1$I '
      'FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t);
  END LOOP;
END $$;


-- ---------------------------------------------------------------------------
-- 8. Row level security
-- ---------------------------------------------------------------------------

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'mls_listings', 'mls_listing_photos', 'realtor_accounts', 'tenant_contacts',
    'tenant_prequalification_profiles', 'tenant_screenings', 'showing_appointments',
    'tenant_property_views', 'rental_import_jobs', 'listing_image_analysis',
    'site_settings'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- mls_listings: a visitor reads only what the feed permits to be displayed.
-- The rentals site filtered this in the browser, after transmitting the rows;
-- here the database will not send them at all.
CREATE POLICY "Public read displayable listings" ON public.mls_listings
  FOR SELECT TO anon, authenticated
  USING (internet_display_allowed IS NOT FALSE);

CREATE POLICY "Admins manage mls_listings" ON public.mls_listings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Photos inherit the parent listing's permission — both its internet display
-- flag and its media flag, since a listing can allow itself but not its images.
CREATE POLICY "Public read displayable photos" ON public.mls_listing_photos
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.mls_listings l
      WHERE l.id = mls_listing_photos.listing_id
        AND l.internet_display_allowed IS NOT FALSE
        AND l.media_display_allowed IS NOT FALSE
    )
  );

CREATE POLICY "Admins manage mls_listing_photos" ON public.mls_listing_photos
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- realtor_accounts: admin-managed, and readable by the realtor it belongs to.
CREATE POLICY "Admins manage realtor_accounts" ON public.realtor_accounts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Realtors read own account" ON public.realtor_accounts
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- The funnel tables hold income, credit tier, contact details and addresses.
-- Anonymous traffic reaches them through service-role paths, which bypass RLS;
-- a signed-in person sees their own rows and nothing else.
CREATE POLICY "Admins manage tenant_contacts" ON public.tenant_contacts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users read own contact" ON public.tenant_contacts
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins manage prequalification" ON public.tenant_prequalification_profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users read own prequalification" ON public.tenant_prequalification_profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users update own prequalification" ON public.tenant_prequalification_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins manage tenant_screenings" ON public.tenant_screenings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- A screening has no owner column; ownership runs through the contact.
CREATE POLICY "Users read own screenings" ON public.tenant_screenings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tenant_contacts c
      WHERE c.id = tenant_screenings.tenant_contact_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage showing_appointments" ON public.showing_appointments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users read own appointments" ON public.showing_appointments
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- A person's own viewing history is theirs to read and to write.
CREATE POLICY "Users manage own property views" ON public.tenant_property_views
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins read property views" ON public.tenant_property_views
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Operational tables are staff-only.
CREATE POLICY "Admins manage rental_import_jobs" ON public.rental_import_jobs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage listing_image_analysis" ON public.listing_image_analysis
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage site_settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read site_settings" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);


-- ---------------------------------------------------------------------------
-- 9. Grants
-- ---------------------------------------------------------------------------
-- Default privileges are revoked in this project, so these are the only
-- privileges that exist. Note what anon gets: reads, and nothing else. The
-- source granted it every verb on listings and photos.

GRANT SELECT ON public.mls_listings, public.mls_listing_photos, public.site_settings TO anon;

GRANT SELECT ON
  public.mls_listings, public.mls_listing_photos, public.site_settings,
  public.realtor_accounts, public.tenant_contacts, public.tenant_screenings,
  public.showing_appointments
TO authenticated;

GRANT SELECT, UPDATE ON public.tenant_prequalification_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_property_views TO authenticated;

-- Admin write paths. RLS still decides; the grant only makes the attempt legal.
GRANT INSERT, UPDATE, DELETE ON
  public.mls_listings, public.mls_listing_photos, public.realtor_accounts,
  public.tenant_contacts, public.tenant_screenings, public.showing_appointments,
  public.rental_import_jobs, public.listing_image_analysis, public.site_settings
TO authenticated;

GRANT SELECT ON public.rental_import_jobs, public.listing_image_analysis TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
