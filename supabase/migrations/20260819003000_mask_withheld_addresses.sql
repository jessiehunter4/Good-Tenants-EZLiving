-- ===========================================================================
-- Phase 02 — compliance in the query layer, not in the component
-- ===========================================================================
-- The rentals site masked a withheld address in the browser: it selected
-- `address` for every listing and then, in React, showed the neighbourhood
-- instead when `address_display_allowed` was false. The street was still sent
-- to the browser and still sat in the network tab. The obligation is not to
-- avoid painting the address on screen — it is not to disclose it.
--
-- Two Postgres features make the difference. A generated column computes the
-- address a visitor may see, and column-level grants mean anonymous traffic is
-- not permitted to read the raw one at all. A hand-written request for it is
-- refused by the database rather than by a component nobody can audit.
--
-- The same reasoning applies to the listing agent's direct email and phone.
-- The mandatory disclosure says inquiries are handled here rather than by the
-- listing agent, so publishing their direct line contradicts the disclosure
-- printed beside it.
-- ===========================================================================

ALTER TABLE public.mls_listings
  ADD COLUMN IF NOT EXISTS display_address text
  GENERATED ALWAYS AS (
    CASE
      WHEN address_display_allowed IS FALSE
        THEN coalesce(nullif(neighborhood, ''), 'Address available on request')
      ELSE address
    END
  ) STORED;

COMMENT ON COLUMN public.mls_listings.display_address IS
  'The address a visitor may be shown. Anonymous callers can read this and not '
  '`address`, so a withheld street is never transmitted.';

-- Anonymous visitors: re-grant column by column. Everything a listing card or
-- a detail page needs, and nothing the feed withholds.
REVOKE SELECT ON public.mls_listings FROM anon;

GRANT SELECT (
  id, slug, display_address, neighborhood, county, subdivision,
  rent, security_deposit, application_fee,
  bedrooms, bathrooms, sqft, lot_size, year_built,
  property_type, property_sub_type, architectural_style, description,
  status, computed_status, date_available, list_date, start_showing_date,
  lease_terms, contract_status_change_date,
  pets_allowed, min_credit_score, income_requirement_multiplier,
  occupancy_limits, special_conditions, utilities_included,
  appliances, exterior_features, cooling_type, heating_type, flooring_type,
  roof_type, construction_materials, fencing, fireplace_features, landscaping,
  pool_features, garage_spaces, covered_parking_spaces, total_parking_spaces,
  parking_spaces,
  hoa_fee, hoa_frequency, mello_roos, property_taxes, tax_year,
  school_district, elementary_school, middle_school, high_school,
  walk_score, transit_score, bike_score,
  video_url, virtual_tour_url, floor_plan_url,
  -- Attribution. Public by obligation: a displayed listing must be credited.
  mls_number, source_mls, source_updated_at,
  agent_name, brokerage, agent_license,
  listing_agent_name, listing_agent_license,
  listing_office_name, listing_office_license,
  co_listing_agent_name, co_listing_office_name,
  -- The permissions themselves, so a surface can tell what it may offer.
  address_display_allowed, media_display_allowed, showing_allowed,
  open_house_allowed,
  created_at, updated_at
) ON public.mls_listings TO anon;

-- A signed-in renter is in the same position as a visitor here; being logged in
-- does not grant a right to a withheld street. Admins read through the
-- `authenticated` role too, so their access is the full-table grant that
-- follows, gated by the admin policy.
REVOKE SELECT ON public.mls_listings FROM authenticated;
GRANT SELECT ON public.mls_listings TO authenticated;
