-- ===========================================================================
-- Good Tenants schema — reconstructed
-- ===========================================================================
-- RECONSTRUCTION, NOT A DUMP. Read this before trusting anything below.
--
-- The plan's Block 0 says to capture a baseline schema dump from the live Good
-- Tenants database before scoping Phase 5. That database has been deleted, so
-- there is nothing to dump. What follows is rebuilt from
-- src/integrations/supabase/types.ts, which is generated output and preserves
-- only part of the original.
--
--   Faithful:     table names, column names, column types, enum values,
--                 nullability.
--   Not recovered: policies, constraints, defaults, indexes, foreign keys,
--                 triggers, and the body of calculate_match_score().
--
-- Everything in the second list is written fresh here. Where the original is
-- unknowable, this file makes the restrictive choice and says so inline, rather
-- than guessing at what was there. Two deliberate departures from the original
-- schema are marked DEPARTURE and explained.
--
-- Depends on: 20260817000000 (profiles, user_roles, has_role)
--             20260817001000 (default privileges revoked — every grant here is
--                             therefore load-bearing rather than decorative)
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. Enums
-- ---------------------------------------------------------------------------
-- Values are exact, from the generated types.

DO $$ BEGIN
  CREATE TYPE public.listing_status AS ENUM ('active', 'coming_soon', 'rented', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.management_type AS ENUM ('self', 'company', 'hybrid');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.profile_status AS ENUM ('incomplete', 'basic', 'verified', 'premium');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.property_type AS ENUM ('house', 'townhouse_condo', 'apartment');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- NOTE: the original user_role enum ('tenant','agent','landlord','admin') is
-- deliberately NOT recreated. Role lives in user_roles, per the baseline. The
-- compatibility view at the end of this file keeps the old shape readable.


-- ---------------------------------------------------------------------------
-- 2. Role profiles
-- ---------------------------------------------------------------------------
-- In the original these tables key on the auth user id directly: there is no
-- user_id column, so `id` is the user. Preserved.

CREATE TABLE IF NOT EXISTS public.tenant_profiles (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  bio text,
  contact_preferences jsonb,
  desired_cities text[],
  desired_state text,
  desired_zip_code text,
  desired_move_date date,
  move_in_date date,
  move_date_flexibility text,
  household_income numeric,
  household_size integer,
  max_monthly_rent numeric,
  min_bedrooms integer,
  min_bathrooms numeric,
  preferred_locations text[],
  pets boolean,
  pets_allowed boolean,
  profile_image_url text,
  is_pre_screened boolean NOT NULL DEFAULT false,
  screening_status text,
  status public.profile_status NOT NULL DEFAULT 'incomplete',
  last_activity timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.landlord_profiles (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  bio text,
  management_type public.management_type,
  preferred_tenant_criteria text,
  property_count integer,
  years_experience integer,
  is_verified boolean NOT NULL DEFAULT false,
  verification_documents text[],
  status public.profile_status NOT NULL DEFAULT 'incomplete',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.realtor_profiles (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  agency text,
  bio text,
  license_number text,
  specialties text[],
  years_experience integer,
  is_verified boolean NOT NULL DEFAULT false,
  verification_documents text[],
  status public.profile_status NOT NULL DEFAULT 'incomplete',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);


-- ---------------------------------------------------------------------------
-- 3. Consent
-- ---------------------------------------------------------------------------
-- DEPARTURE 1. This table did not exist. The word "consent" appears nowhere in
-- the Good Tenants codebase: a tenant completed a profile, it became searchable,
-- and landlords read household income, household size and screening status
-- straight off the directory.
--
-- The plan schedules the request-and-approval flow for Phase 5.4. It is added
-- here instead, because the policies below need something to point at — and
-- because recreating a directory with no consent gate, in a database that will
-- also hold licensed MLS data and payment records, would be rebuilding the
-- defect on purpose. The UI for it is still Phase 5 work; this is the data model
-- and the enforcement.

CREATE TABLE IF NOT EXISTS public.directory_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenant_profiles(id) ON DELETE CASCADE,
  purpose text,
  listing_id uuid,
  consent_granted boolean,
  decided_at timestamptz,
  -- Access is time-boxed. An approval is not permanent, which is the difference
  -- between consent and a one-off click.
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (requester_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS directory_access_requests_tenant_idx
  ON public.directory_access_requests (tenant_id);

-- True only while a specific requester holds live, granted, unexpired access.
CREATE OR REPLACE FUNCTION public.has_directory_access(_requester uuid, _tenant uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.directory_access_requests
    WHERE requester_id = _requester
      AND tenant_id = _tenant
      AND consent_granted IS TRUE
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

REVOKE ALL ON FUNCTION public.has_directory_access(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_directory_access(uuid, uuid) TO authenticated, service_role;


-- ---------------------------------------------------------------------------
-- 4. Documents
-- ---------------------------------------------------------------------------
-- The most sensitive table in the schema: pay stubs, references, identity
-- documents. No landlord or realtor policy exists here at any consent level —
-- reviewing documents is an admin function, and sharing them is a decision the
-- plan has not made yet. Denied by default until it does.

CREATE TABLE IF NOT EXISTS public.application_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenant_profiles(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size integer,
  notes text,
  verification_status text NOT NULL DEFAULT 'pending',
  verified_at timestamptz,
  verified_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  upload_date timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS application_documents_tenant_idx
  ON public.application_documents (tenant_id);


-- ---------------------------------------------------------------------------
-- 5. Listings
-- ---------------------------------------------------------------------------
-- These are the Good Tenants app's own landlord-entered listings, and they are
-- NOT the MLS listing tables. The CSHR migration (Block 2) brings those in
-- separately, under their own names, with the display-permission columns the
-- licence requires. Do not merge the two without deciding which is the record.

CREATE TABLE IF NOT EXISTS public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  address text,
  city text,
  state text,
  zip text,
  description text,
  price numeric,
  bedrooms integer,
  bathrooms numeric,
  full_baths integer,
  half_baths integer,
  three_quarter_baths integer,
  total_baths numeric,
  square_feet integer,
  property_type public.property_type,
  listing_status public.listing_status DEFAULT 'coming_soon',
  available_date date,
  pets_allowed boolean,
  featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS listings_owner_idx ON public.listings (owner_id);
CREATE INDEX IF NOT EXISTS listings_active_idx ON public.listings (is_active, listing_status);

CREATE TABLE IF NOT EXISTS public.listing_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS listing_images_listing_idx ON public.listing_images (listing_id);


-- ---------------------------------------------------------------------------
-- 6. Showings, invites, matches
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.property_showings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  requested_date date,
  requested_time text,
  message text,
  status text NOT NULL DEFAULT 'requested',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  tenant_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES public.listings(id) ON DELETE SET NULL,
  message text,
  status text NOT NULL DEFAULT 'sent',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tenant_listing_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenant_profiles(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE,
  match_score numeric,
  criteria_met jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, listing_id)
);


-- ---------------------------------------------------------------------------
-- 7. Messaging
-- ---------------------------------------------------------------------------
-- Kept because retiring the old app must not silently drop conversations that
-- exist. Note that the plan lists tenant↔landlord messaging as a non-goal for
-- the MVP: this is the schema, not a commitment to ship the feature.

CREATE TABLE IF NOT EXISTS public.message_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  thread_type text NOT NULL DEFAULT 'direct',
  listing_id uuid REFERENCES public.listings(id) ON DELETE SET NULL,
  property_showing_id uuid REFERENCES public.property_showings(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.thread_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  is_muted boolean NOT NULL DEFAULT false,
  joined_at timestamptz NOT NULL DEFAULT now(),
  left_at timestamptz,
  UNIQUE (thread_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_thread_idx ON public.messages (thread_id, created_at);

-- Membership test, used by the policies below. SECURITY DEFINER so that reading
-- a thread's participant list to authorise a message does not itself require a
-- policy that would expose the list.
CREATE OR REPLACE FUNCTION public.is_thread_participant(_thread uuid, _user uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.thread_participants
    WHERE thread_id = _thread AND user_id = _user AND left_at IS NULL
  )
$$;

REVOKE ALL ON FUNCTION public.is_thread_participant(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_thread_participant(uuid, uuid) TO authenticated, service_role;


-- ---------------------------------------------------------------------------
-- 8. Integrations (admin-only subsystem)
-- ---------------------------------------------------------------------------
-- Newly visible during the codebase review and absent from the plan. Carried
-- across so the decision to keep or drop it is made deliberately. Every table
-- here is admin-only; config may hold third-party credentials.

CREATE TABLE IF NOT EXISTS public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provider text NOT NULL,
  integration_type text NOT NULL,
  description text,
  api_endpoint text,
  config jsonb,
  requires_api_key boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'inactive',
  test_result text,
  last_tested_at timestamptz,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.integration_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_name text NOT NULL,
  provider_name text NOT NULL,
  business_justification text NOT NULL,
  priority text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'new',
  admin_notes text,
  estimated_completion date,
  requested_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.integration_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  action text NOT NULL,
  details jsonb,
  performed_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.integration_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  date date NOT NULL DEFAULT (now()::date),
  endpoint text,
  request_count integer NOT NULL DEFAULT 0,
  success_count integer NOT NULL DEFAULT 0,
  error_count integer NOT NULL DEFAULT 0,
  avg_response_time numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- ---------------------------------------------------------------------------
-- 9. updated_at triggers
-- ---------------------------------------------------------------------------

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'tenant_profiles','landlord_profiles','realtor_profiles','listings',
    'property_showings','invites','message_threads','integrations',
    'integration_requests'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %1$s_set_updated_at ON public.%1$I', t);
    EXECUTE format(
      'CREATE TRIGGER %1$s_set_updated_at BEFORE UPDATE ON public.%1$I '
      'FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t);
  END LOOP;
END $$;


-- ---------------------------------------------------------------------------
-- 10. Row level security
-- ---------------------------------------------------------------------------

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'tenant_profiles','landlord_profiles','realtor_profiles',
    'directory_access_requests','application_documents','listings',
    'listing_images','property_showings','invites','tenant_listing_matches',
    'message_threads','thread_participants','messages','integrations',
    'integration_requests','integration_audit_log','integration_usage'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- --- tenant_profiles ------------------------------------------------------
-- The table the original app exposed. Public read is gone.
DROP POLICY IF EXISTS "Tenants manage own profile" ON public.tenant_profiles;
CREATE POLICY "Tenants manage own profile" ON public.tenant_profiles
  FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Admins manage tenant profiles" ON public.tenant_profiles;
CREATE POLICY "Admins manage tenant profiles" ON public.tenant_profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- DEPARTURE 2. Landlords and realtors read a tenant profile only while that
-- tenant has granted them access. There is no "verified tenants are browsable"
-- policy, because that is exactly what the old directory did.
DROP POLICY IF EXISTS "Consented partners read tenant profiles" ON public.tenant_profiles;
CREATE POLICY "Consented partners read tenant profiles" ON public.tenant_profiles
  FOR SELECT TO authenticated
  USING (
    (public.has_role(auth.uid(), 'landlord') OR public.has_role(auth.uid(), 'realtor'))
    AND public.has_directory_access(auth.uid(), id)
  );

-- --- landlord_profiles / realtor_profiles ---------------------------------
-- Professional profiles, not personal finances: readable by signed-in users,
-- writable only by their owner.
DROP POLICY IF EXISTS "Owners manage landlord profile" ON public.landlord_profiles;
CREATE POLICY "Owners manage landlord profile" ON public.landlord_profiles
  FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Signed-in read landlord profiles" ON public.landlord_profiles;
CREATE POLICY "Signed-in read landlord profiles" ON public.landlord_profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins manage landlord profiles" ON public.landlord_profiles;
CREATE POLICY "Admins manage landlord profiles" ON public.landlord_profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Owners manage realtor profile" ON public.realtor_profiles;
CREATE POLICY "Owners manage realtor profile" ON public.realtor_profiles
  FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Signed-in read realtor profiles" ON public.realtor_profiles;
CREATE POLICY "Signed-in read realtor profiles" ON public.realtor_profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins manage realtor profiles" ON public.realtor_profiles;
CREATE POLICY "Admins manage realtor profiles" ON public.realtor_profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- --- directory_access_requests --------------------------------------------
DROP POLICY IF EXISTS "Requesters read own requests" ON public.directory_access_requests;
CREATE POLICY "Requesters read own requests" ON public.directory_access_requests
  FOR SELECT TO authenticated USING (requester_id = auth.uid());

DROP POLICY IF EXISTS "Partners create requests" ON public.directory_access_requests;
CREATE POLICY "Partners create requests" ON public.directory_access_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    requester_id = auth.uid()
    AND (public.has_role(auth.uid(), 'landlord') OR public.has_role(auth.uid(), 'realtor'))
    -- A request may not arrive pre-approved. Only the tenant sets this.
    AND consent_granted IS NOT TRUE
  );

DROP POLICY IF EXISTS "Tenants read requests about them" ON public.directory_access_requests;
CREATE POLICY "Tenants read requests about them" ON public.directory_access_requests
  FOR SELECT TO authenticated USING (tenant_id = auth.uid());

DROP POLICY IF EXISTS "Tenants decide requests about them" ON public.directory_access_requests;
CREATE POLICY "Tenants decide requests about them" ON public.directory_access_requests
  FOR UPDATE TO authenticated
  USING (tenant_id = auth.uid()) WITH CHECK (tenant_id = auth.uid());

DROP POLICY IF EXISTS "Admins read access requests" ON public.directory_access_requests;
CREATE POLICY "Admins read access requests" ON public.directory_access_requests
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- --- application_documents ------------------------------------------------
DROP POLICY IF EXISTS "Tenants manage own documents" ON public.application_documents;
CREATE POLICY "Tenants manage own documents" ON public.application_documents
  FOR ALL TO authenticated
  USING (tenant_id = auth.uid()) WITH CHECK (tenant_id = auth.uid());

DROP POLICY IF EXISTS "Admins review documents" ON public.application_documents;
CREATE POLICY "Admins review documents" ON public.application_documents
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- --- listings + images ----------------------------------------------------
DROP POLICY IF EXISTS "Public read active listings" ON public.listings;
CREATE POLICY "Public read active listings" ON public.listings
  FOR SELECT TO anon, authenticated
  USING (is_active = true AND listing_status <> 'inactive');

DROP POLICY IF EXISTS "Owners manage own listings" ON public.listings;
CREATE POLICY "Owners manage own listings" ON public.listings
  FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage listings" ON public.listings;
CREATE POLICY "Admins manage listings" ON public.listings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Read images of visible listings" ON public.listing_images;
CREATE POLICY "Read images of visible listings" ON public.listing_images
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id));

DROP POLICY IF EXISTS "Owners manage own listing images" ON public.listing_images;
CREATE POLICY "Owners manage own listing images" ON public.listing_images
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.owner_id = auth.uid()));

-- --- property_showings ----------------------------------------------------
DROP POLICY IF EXISTS "Tenants manage own showings" ON public.property_showings;
CREATE POLICY "Tenants manage own showings" ON public.property_showings
  FOR ALL TO authenticated
  USING (tenant_id = auth.uid()) WITH CHECK (tenant_id = auth.uid());

DROP POLICY IF EXISTS "Listing owners see their showings" ON public.property_showings;
CREATE POLICY "Listing owners see their showings" ON public.property_showings
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Listing owners update their showings" ON public.property_showings;
CREATE POLICY "Listing owners update their showings" ON public.property_showings
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Admins manage showings" ON public.property_showings;
CREATE POLICY "Admins manage showings" ON public.property_showings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- --- invites --------------------------------------------------------------
DROP POLICY IF EXISTS "Senders manage own invites" ON public.invites;
CREATE POLICY "Senders manage own invites" ON public.invites
  FOR ALL TO authenticated
  USING (sender_id = auth.uid()) WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "Recipients read own invites" ON public.invites;
CREATE POLICY "Recipients read own invites" ON public.invites
  FOR SELECT TO authenticated USING (tenant_id = auth.uid());

DROP POLICY IF EXISTS "Recipients respond to invites" ON public.invites;
CREATE POLICY "Recipients respond to invites" ON public.invites
  FOR UPDATE TO authenticated
  USING (tenant_id = auth.uid()) WITH CHECK (tenant_id = auth.uid());

DROP POLICY IF EXISTS "Admins read invites" ON public.invites;
CREATE POLICY "Admins read invites" ON public.invites
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- --- tenant_listing_matches -----------------------------------------------
-- Tenant and admin only. A match reveals that a specific person is looking at a
-- specific property; exposing that to the listing owner is a consent decision,
-- not a convenience, and it is not made here.
DROP POLICY IF EXISTS "Tenants read own matches" ON public.tenant_listing_matches;
CREATE POLICY "Tenants read own matches" ON public.tenant_listing_matches
  FOR SELECT TO authenticated USING (tenant_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage matches" ON public.tenant_listing_matches;
CREATE POLICY "Admins manage matches" ON public.tenant_listing_matches
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- --- messaging ------------------------------------------------------------
DROP POLICY IF EXISTS "Participants read threads" ON public.message_threads;
CREATE POLICY "Participants read threads" ON public.message_threads
  FOR SELECT TO authenticated USING (public.is_thread_participant(id, auth.uid()));

DROP POLICY IF EXISTS "Participants read participant rows" ON public.thread_participants;
CREATE POLICY "Participants read participant rows" ON public.thread_participants
  FOR SELECT TO authenticated USING (public.is_thread_participant(thread_id, auth.uid()));

DROP POLICY IF EXISTS "Participants read messages" ON public.messages;
CREATE POLICY "Participants read messages" ON public.messages
  FOR SELECT TO authenticated USING (public.is_thread_participant(thread_id, auth.uid()));

DROP POLICY IF EXISTS "Participants send messages" ON public.messages;
CREATE POLICY "Participants send messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND public.is_thread_participant(thread_id, auth.uid()));

DROP POLICY IF EXISTS "Senders edit own messages" ON public.messages;
CREATE POLICY "Senders edit own messages" ON public.messages
  FOR UPDATE TO authenticated
  USING (sender_id = auth.uid()) WITH CHECK (sender_id = auth.uid());

-- Thread creation runs server-side: a thread and its participant rows must be
-- written together, and a client that can insert participants can add itself to
-- someone else's conversation. No INSERT policy for authenticated on threads or
-- participants is deliberate.

-- --- integrations ---------------------------------------------------------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['integrations','integration_audit_log','integration_usage']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Admins manage %1$s" ON public.%1$I', t);
    EXECUTE format(
      'CREATE POLICY "Admins manage %1$s" ON public.%1$I FOR ALL TO authenticated '
      'USING (public.has_role(auth.uid(), ''admin'')) '
      'WITH CHECK (public.has_role(auth.uid(), ''admin''))', t);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Requesters read own integration requests" ON public.integration_requests;
CREATE POLICY "Requesters read own integration requests" ON public.integration_requests
  FOR SELECT TO authenticated USING (requested_by = auth.uid());

DROP POLICY IF EXISTS "Users file integration requests" ON public.integration_requests;
CREATE POLICY "Users file integration requests" ON public.integration_requests
  FOR INSERT TO authenticated WITH CHECK (requested_by = auth.uid());

DROP POLICY IF EXISTS "Admins manage integration requests" ON public.integration_requests;
CREATE POLICY "Admins manage integration requests" ON public.integration_requests
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- ---------------------------------------------------------------------------
-- 11. Grants
-- ---------------------------------------------------------------------------
-- Default privileges were revoked in 20260817001000, so these are the only
-- privileges that exist. Anonymous visitors get listings and their images —
-- the public shop window — and nothing else in this file.

GRANT SELECT ON public.listings, public.listing_images TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.tenant_profiles, public.landlord_profiles, public.realtor_profiles,
  public.application_documents, public.listings, public.listing_images,
  public.property_showings, public.invites, public.directory_access_requests,
  public.integration_requests
TO authenticated;

GRANT SELECT ON
  public.tenant_listing_matches, public.message_threads,
  public.thread_participants, public.integrations,
  public.integration_audit_log, public.integration_usage
TO authenticated;

GRANT INSERT, UPDATE ON public.messages TO authenticated;
GRANT SELECT ON public.messages TO authenticated;

-- Admin-managed tables still need write privileges for the admin paths that run
-- as the signed-in user rather than the service role.
GRANT INSERT, UPDATE, DELETE ON
  public.tenant_listing_matches, public.integrations,
  public.integration_audit_log, public.integration_usage,
  public.message_threads, public.thread_participants
TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;


-- ---------------------------------------------------------------------------
-- 12. Functions the old schema exposed
-- ---------------------------------------------------------------------------

-- is_admin() took no arguments and returned a boolean for the caller. Rebuilt
-- on the platform's role model so there is one definition of "admin".
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- calculate_match_score(tenant, listing) -> numeric.
--
-- The signature is recovered; the body is not. This is a REIMPLEMENTATION and
-- the weights are newly invented, not restored — a plain property-attribute
-- score, deliberately legible, so that a number in tenant_listing_matches means
-- something a person can check.
--
-- It scores only property attributes: rent against budget, bedrooms, bathrooms,
-- city and pets. It must never score household size, income, or any protected
-- characteristic. Phase 3's unified qualification rule replaces this.
CREATE OR REPLACE FUNCTION public.calculate_match_score(tenant_id_param uuid, listing_id_param uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT GREATEST(0, LEAST(100,
      CASE WHEN l.price IS NULL OR t.max_monthly_rent IS NULL THEN 0
           WHEN l.price <= t.max_monthly_rent THEN 40
           WHEN l.price <= t.max_monthly_rent * 1.1 THEN 20
           ELSE 0 END
    + CASE WHEN t.min_bedrooms IS NULL OR l.bedrooms IS NULL THEN 0
           WHEN l.bedrooms >= t.min_bedrooms THEN 20 ELSE 0 END
    + CASE WHEN t.min_bathrooms IS NULL OR l.total_baths IS NULL THEN 0
           WHEN l.total_baths >= t.min_bathrooms THEN 15 ELSE 0 END
    + CASE WHEN t.desired_cities IS NULL OR l.city IS NULL THEN 0
           WHEN l.city = ANY (t.desired_cities) THEN 15 ELSE 0 END
    + CASE WHEN t.pets IS NOT TRUE THEN 10
           WHEN l.pets_allowed IS TRUE THEN 10 ELSE 0 END
  ))::numeric
  FROM public.tenant_profiles t, public.listings l
  WHERE t.id = tenant_id_param AND l.id = listing_id_param
$$;

REVOKE ALL ON FUNCTION public.calculate_match_score(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.calculate_match_score(uuid, uuid) TO authenticated, service_role;


-- ---------------------------------------------------------------------------
-- 13. Compatibility view: public.users
-- ---------------------------------------------------------------------------
-- The original public.users carried the role column that made self-elevation
-- possible. The table is not recreated. This view gives the three read sites in
-- the app (useUserStats, useAdminAccess, useRealtimeSubscription) the shape they
-- expect, while role remains writable only through user_roles.
--
-- security_invoker = on so the caller's policies on profiles and user_roles
-- apply: a signed-in user sees their own row, an admin sees everyone, and
-- anonymous sees nothing. A view without this setting would run as its owner and
-- quietly bypass both.
--
-- 'realtor' is presented as 'agent' so existing queries keep matching. The
-- platform's own name is realtor; this mapping exists for the app's transition
-- and should go away with the screens that depend on it.

CREATE OR REPLACE VIEW public.users WITH (security_invoker = on) AS
  SELECT
    p.id,
    p.email,
    COALESCE(
      (SELECT CASE WHEN r.role = 'realtor' THEN 'agent' ELSE r.role::text END
         FROM public.user_roles r
        WHERE r.user_id = p.id
        ORDER BY CASE r.role
                   WHEN 'admin' THEN 1 WHEN 'editor' THEN 2 WHEN 'landlord' THEN 3
                   WHEN 'realtor' THEN 4 ELSE 5 END
        LIMIT 1),
      'tenant'
    ) AS role,
    p.created_at,
    p.updated_at
  FROM public.profiles p;

GRANT SELECT ON public.users TO authenticated;
