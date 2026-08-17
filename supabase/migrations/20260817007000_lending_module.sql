-- ===========================================================================
-- Lending: scenarios, lender panel, and the submission that connects them
-- ===========================================================================
-- A broker or borrower builds a funding scenario — security properties, loan
-- structure, borrowing entity, guarantors, supporting documents — and submits
-- it. Lenders on the panel see the scenarios they have been given access to and
-- respond.
--
-- The visibility model is the one already used for the tenant directory, for
-- the same reason: a scenario carries an entity's assets, liabilities, tax
-- position and credit impairments. Lenders see a scenario when it has been
-- shared with them and not before, and a draft is visible to nobody but its
-- author.
--
-- Amounts are numeric(14,2). Money is never a float: 0.1 + 0.2 must be 0.3 in a
-- document someone lends against.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. Vocabulary
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE public.scenario_product AS ENUM ('first_mortgage', 'second_mortgage', 'construction');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.scenario_status AS ENUM ('draft', 'submitted', 'in_review', 'quoted', 'closed', 'withdrawn');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.security_type AS ENUM (
    'residential', 'commercial', 'industrial', 'agriculture_farming',
    'development_site', 'vacant_land', 'specialised', 'residual_stock',
    'mid_construction'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.transaction_type AS ENUM ('purchase', 'refinance', 'equity_release', 'development', 'land_subdivision');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ---------------------------------------------------------------------------
-- 2. Lender profiles
-- ---------------------------------------------------------------------------
-- The panel. A lender's appetite is what decides whether a scenario is worth
-- showing them, so it is structured rather than free text.

CREATE TABLE IF NOT EXISTS public.lender_profiles (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name text,
  contact_name text,
  contact_phone text,
  website text,
  /* Australian company number. Free text: validation belongs in the app, and a
     constraint here would block a lender from saving a half-finished profile. */
  acn text,
  credit_licence text,

  products public.scenario_product[],
  security_types public.security_type[],
  regions text[],
  min_loan_amount numeric(14,2),
  max_loan_amount numeric(14,2),
  max_lvr numeric(5,2),
  indicative_rate_from numeric(5,2),
  typical_turnaround_days integer,
  notes text,

  /* Verified by an admin, not by the lender. Panel membership is a commercial
     relationship, so it is granted rather than claimed. */
  is_verified boolean NOT NULL DEFAULT false,
  status public.profile_status NOT NULL DEFAULT 'incomplete',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);


-- ---------------------------------------------------------------------------
-- 3. Scenarios
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.loan_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  /* Human reference for phone calls and emails: SC-000123. */
  reference bigint GENERATED ALWAYS AS IDENTITY,
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  product public.scenario_product NOT NULL,
  status public.scenario_status NOT NULL DEFAULT 'draft',
  transaction_type public.transaction_type,

  -- Loan structure
  loan_amount numeric(14,2),
  loan_term_months integer,
  interest_payment_method text,
  broker_fee_percent numeric(5,2),

  -- Narrative. The two fields lenders actually read first.
  loan_purpose text,
  exit_strategy text,

  -- Borrowing entity
  borrowing_entity_type text,
  borrowing_entity_name text,
  borrowing_entity_acn text,

  -- Everything else
  turnaround_to_settlement text,
  preferred_valuer text,
  outstanding_tax boolean,
  credit_impairments boolean,
  additional_comments text,

  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  /* A submitted scenario must have been submitted at a point in time. Drafts
     must not carry a submission date. */
  CONSTRAINT loan_scenarios_submitted_at_matches_status
    CHECK ((status = 'draft') = (submitted_at IS NULL))
);

CREATE INDEX IF NOT EXISTS loan_scenarios_author_idx ON public.loan_scenarios (created_by, status);
CREATE INDEX IF NOT EXISTS loan_scenarios_open_idx ON public.loan_scenarios (status, submitted_at DESC);

CREATE TABLE IF NOT EXISTS public.scenario_properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid NOT NULL REFERENCES public.loan_scenarios(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 1,
  address text,
  description text,
  security_type public.security_type,
  property_use text,
  land_size_sqm numeric(12,2),
  estimated_value numeric(14,2),
  current_debt numeric(14,2),
  comments text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (scenario_id, position)
);

CREATE TABLE IF NOT EXISTS public.scenario_guarantors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid NOT NULL REFERENCES public.loan_scenarios(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 1,
  full_name text,
  employment_type text,
  property_assets numeric(14,2) NOT NULL DEFAULT 0,
  property_liabilities numeric(14,2) NOT NULL DEFAULT 0,
  other_assets numeric(14,2) NOT NULL DEFAULT 0,
  other_liabilities numeric(14,2) NOT NULL DEFAULT 0,
  /* Derived, never entered: a net position typed by hand is a net position that
     disagrees with its own inputs. */
  total_assets numeric(14,2) GENERATED ALWAYS AS (property_assets + other_assets) STORED,
  total_liabilities numeric(14,2) GENERATED ALWAYS AS (property_liabilities + other_liabilities) STORED,
  net_position numeric(14,2) GENERATED ALWAYS AS
    ((property_assets + other_assets) - (property_liabilities + other_liabilities)) STORED,
  outstanding_tax boolean,
  credit_impairments boolean,
  comments text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (scenario_id, position)
);

CREATE TABLE IF NOT EXISTS public.scenario_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid NOT NULL REFERENCES public.loan_scenarios(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  file_size integer,
  content_type text,
  document_type text,
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS scenario_documents_scenario_idx ON public.scenario_documents (scenario_id);


-- ---------------------------------------------------------------------------
-- 4. Who may see a scenario
-- ---------------------------------------------------------------------------
-- Access is granted per lender per scenario. Nothing is visible panel-wide:
-- these documents hold an entity's assets, liabilities, tax position and credit
-- impairments, and "every lender on the panel can read every scenario" is not a
-- thing anyone consented to.

CREATE TABLE IF NOT EXISTS public.scenario_lender_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid NOT NULL REFERENCES public.loan_scenarios(id) ON DELETE CASCADE,
  lender_id uuid NOT NULL REFERENCES public.lender_profiles(id) ON DELETE CASCADE,
  shared_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  shared_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  /* The lender's own answer, kept beside the access record rather than in a
     separate table, because a response without access is meaningless. */
  response text,
  responded_at timestamptz,
  indicative_rate numeric(5,2),
  indicative_amount numeric(14,2),
  lender_notes text,
  UNIQUE (scenario_id, lender_id)
);

CREATE INDEX IF NOT EXISTS scenario_lender_access_lender_idx
  ON public.scenario_lender_access (lender_id) WHERE revoked_at IS NULL;

CREATE OR REPLACE FUNCTION public.lender_can_see_scenario(_lender uuid, _scenario uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.scenario_lender_access a
    JOIN public.loan_scenarios s ON s.id = a.scenario_id
    WHERE a.lender_id = _lender
      AND a.scenario_id = _scenario
      AND a.revoked_at IS NULL
      -- A draft is never shared, whatever the access row says.
      AND s.status <> 'draft'
  )
$$;

REVOKE ALL ON FUNCTION public.lender_can_see_scenario(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lender_can_see_scenario(uuid, uuid) TO authenticated, service_role;


-- ---------------------------------------------------------------------------
-- 5. updated_at
-- ---------------------------------------------------------------------------

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['lender_profiles','loan_scenarios']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %1$s_set_updated_at ON public.%1$I', t);
    EXECUTE format(
      'CREATE TRIGGER %1$s_set_updated_at BEFORE UPDATE ON public.%1$I '
      'FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t);
  END LOOP;
END $$;


-- ---------------------------------------------------------------------------
-- 6. Row level security
-- ---------------------------------------------------------------------------

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'lender_profiles','loan_scenarios','scenario_properties','scenario_guarantors',
    'scenario_documents','scenario_lender_access'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- --- lender_profiles ------------------------------------------------------
DROP POLICY IF EXISTS "Lenders manage own profile" ON public.lender_profiles;
CREATE POLICY "Lenders manage own profile" ON public.lender_profiles
  FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Verified lenders are the panel a broker picks from, so signed-in users may
-- read them. Unverified ones stay private until an admin approves them.
DROP POLICY IF EXISTS "Signed-in read verified lenders" ON public.lender_profiles;
CREATE POLICY "Signed-in read verified lenders" ON public.lender_profiles
  FOR SELECT TO authenticated USING (is_verified = true);

DROP POLICY IF EXISTS "Admins manage lender profiles" ON public.lender_profiles;
CREATE POLICY "Admins manage lender profiles" ON public.lender_profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- --- loan_scenarios -------------------------------------------------------
DROP POLICY IF EXISTS "Authors manage own scenarios" ON public.loan_scenarios;
CREATE POLICY "Authors manage own scenarios" ON public.loan_scenarios
  FOR ALL TO authenticated
  USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Lenders read shared scenarios" ON public.loan_scenarios;
CREATE POLICY "Lenders read shared scenarios" ON public.loan_scenarios
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'lender')
    AND public.lender_can_see_scenario(auth.uid(), id)
  );

DROP POLICY IF EXISTS "Admins manage scenarios" ON public.loan_scenarios;
CREATE POLICY "Admins manage scenarios" ON public.loan_scenarios
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- --- the scenario's child rows -------------------------------------------
-- Same rule as the parent, expressed once per table: the author, a lender the
-- scenario was shared with, or an admin.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['scenario_properties','scenario_guarantors','scenario_documents']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Authors manage %1$s" ON public.%1$I', t);
    EXECUTE format(
      'CREATE POLICY "Authors manage %1$s" ON public.%1$I FOR ALL TO authenticated '
      'USING (EXISTS (SELECT 1 FROM public.loan_scenarios s WHERE s.id = scenario_id AND s.created_by = auth.uid())) '
      'WITH CHECK (EXISTS (SELECT 1 FROM public.loan_scenarios s WHERE s.id = scenario_id AND s.created_by = auth.uid()))',
      t);

    EXECUTE format('DROP POLICY IF EXISTS "Lenders read %1$s" ON public.%1$I', t);
    EXECUTE format(
      'CREATE POLICY "Lenders read %1$s" ON public.%1$I FOR SELECT TO authenticated '
      'USING (public.has_role(auth.uid(), ''lender'') AND public.lender_can_see_scenario(auth.uid(), scenario_id))',
      t);

    EXECUTE format('DROP POLICY IF EXISTS "Admins manage %1$s" ON public.%1$I', t);
    EXECUTE format(
      'CREATE POLICY "Admins manage %1$s" ON public.%1$I FOR ALL TO authenticated '
      'USING (public.has_role(auth.uid(), ''admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin''))',
      t);
  END LOOP;
END $$;

-- --- scenario_lender_access ----------------------------------------------
DROP POLICY IF EXISTS "Authors manage sharing" ON public.scenario_lender_access;
CREATE POLICY "Authors manage sharing" ON public.scenario_lender_access
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.loan_scenarios s WHERE s.id = scenario_id AND s.created_by = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.loan_scenarios s WHERE s.id = scenario_id AND s.created_by = auth.uid()));

DROP POLICY IF EXISTS "Lenders read own access rows" ON public.scenario_lender_access;
CREATE POLICY "Lenders read own access rows" ON public.scenario_lender_access
  FOR SELECT TO authenticated USING (lender_id = auth.uid());

-- A lender answers on their own row and nowhere else.
DROP POLICY IF EXISTS "Lenders respond on own access rows" ON public.scenario_lender_access;
CREATE POLICY "Lenders respond on own access rows" ON public.scenario_lender_access
  FOR UPDATE TO authenticated
  USING (lender_id = auth.uid()) WITH CHECK (lender_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage sharing" ON public.scenario_lender_access;
CREATE POLICY "Admins manage sharing" ON public.scenario_lender_access
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- ---------------------------------------------------------------------------
-- 7. Grants
-- ---------------------------------------------------------------------------
-- Default privileges are revoked in this project, so these are the only
-- privileges that exist. Nothing here is granted to anon: none of it is public.

GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.lender_profiles,
  public.loan_scenarios,
  public.scenario_properties,
  public.scenario_guarantors,
  public.scenario_documents,
  public.scenario_lender_access
TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;


-- ---------------------------------------------------------------------------
-- 8. Documents bucket
-- ---------------------------------------------------------------------------
-- Private, unlike content-images. Valuations, loan statements and asset
-- schedules are the most sensitive files this platform will hold.

INSERT INTO storage.buckets (id, name, public)
VALUES ('scenario-documents', 'scenario-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Files are namespaced by scenario id: <scenario_id>/<filename>.
DROP POLICY IF EXISTS "Authors manage scenario documents" ON storage.objects;
CREATE POLICY "Authors manage scenario documents" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'scenario-documents'
    AND EXISTS (
      SELECT 1 FROM public.loan_scenarios s
      WHERE s.created_by = auth.uid()
        AND s.id::text = split_part(name, '/', 1)
    )
  )
  WITH CHECK (
    bucket_id = 'scenario-documents'
    AND EXISTS (
      SELECT 1 FROM public.loan_scenarios s
      WHERE s.created_by = auth.uid()
        AND s.id::text = split_part(name, '/', 1)
    )
  );

DROP POLICY IF EXISTS "Lenders read shared scenario documents" ON storage.objects;
CREATE POLICY "Lenders read shared scenario documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'scenario-documents'
    AND public.has_role(auth.uid(), 'lender')
    AND public.lender_can_see_scenario(auth.uid(), split_part(name, '/', 1)::uuid)
  );
