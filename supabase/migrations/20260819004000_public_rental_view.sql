-- ===========================================================================
-- Phase 02 — the public projection of a listing
-- ===========================================================================
-- The previous migration masked withheld addresses with a generated column and
-- column-level grants. The masking works; the grants do not, because PostgREST
-- requires table-level SELECT to expose a table at all — with only column
-- grants the table disappears from the API entirely rather than appearing with
-- fewer columns.
--
-- A view is the mechanism that does work over the API, and it is the better
-- shape anyway: the set of columns a visitor may see is written down in one
-- place, readable, instead of being a grant list nobody will think to check.
--
-- `security_invoker` matters here. Without it a view runs as its owner and
-- bypasses the row policies on the table beneath — which would hand every
-- suppressed listing straight back. With it, the caller's policies still apply,
-- so the view narrows columns while RLS goes on narrowing rows.
-- ===========================================================================

CREATE OR REPLACE VIEW public.rental_listings
WITH (security_invoker = true) AS
SELECT
  id,
  slug,
  -- The masked address. The raw `address` column is deliberately not here.
  display_address,
  neighborhood,
  county,
  subdivision,
  rent,
  security_deposit,
  application_fee,
  bedrooms,
  bathrooms,
  sqft,
  lot_size,
  year_built,
  property_type,
  property_sub_type,
  architectural_style,
  description,
  status,
  computed_status,
  date_available,
  list_date,
  start_showing_date,
  lease_terms,
  contract_status_change_date,
  pets_allowed,
  min_credit_score,
  income_requirement_multiplier,
  occupancy_limits,
  special_conditions,
  utilities_included,
  appliances,
  exterior_features,
  cooling_type,
  heating_type,
  flooring_type,
  roof_type,
  construction_materials,
  fencing,
  fireplace_features,
  landscaping,
  pool_features,
  garage_spaces,
  covered_parking_spaces,
  total_parking_spaces,
  parking_spaces,
  hoa_fee,
  hoa_frequency,
  mello_roos,
  property_taxes,
  tax_year,
  school_district,
  elementary_school,
  middle_school,
  high_school,
  walk_score,
  transit_score,
  bike_score,
  video_url,
  virtual_tour_url,
  floor_plan_url,
  -- Attribution: public by obligation, not by choice. A displayed listing has
  -- to name its MLS, its number there and the office that holds it.
  mls_number,
  source_mls,
  source_updated_at,
  agent_name,
  agent_license,
  brokerage,
  listing_agent_name,
  listing_agent_license,
  listing_office_name,
  listing_office_license,
  co_listing_agent_name,
  co_listing_office_name,
  -- The permissions themselves, so a surface knows what it may offer. Note
  -- what is absent: listing_agent_email and listing_agent_phone. The mandatory
  -- disclosure says inquiries are handled here rather than by the listing
  -- agent, and publishing their direct line contradicts it.
  address_display_allowed,
  media_display_allowed,
  showing_allowed,
  open_house_allowed,
  created_at,
  updated_at
FROM public.mls_listings;

COMMENT ON VIEW public.rental_listings IS
  'What a visitor may see of a listing. Columns are narrowed here; rows are '
  'narrowed by the policies on mls_listings, which security_invoker preserves.';

-- Undo the column grants from 20260819003000: they are superseded, and leaving
-- them would mean two mechanisms claiming to decide the same thing.
REVOKE ALL ON public.mls_listings FROM anon;

GRANT SELECT ON public.rental_listings TO anon, authenticated;

-- Admins and the sync still read the table itself, gated by its policies.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mls_listings TO authenticated;
