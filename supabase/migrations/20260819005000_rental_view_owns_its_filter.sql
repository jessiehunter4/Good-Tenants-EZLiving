-- ===========================================================================
-- Phase 02 — the public view owns its row filter
-- ===========================================================================
-- `security_invoker` was the wrong choice for this view. It preserves the
-- caller's row policies, which is what we wanted, but it also requires the
-- caller to hold privileges on the table underneath — so anonymous traffic
-- could only read the view by being granted the table, which is precisely what
-- the view exists to avoid.
--
-- The view therefore runs as its owner and states the row filter itself. The
-- narrowing that RLS was doing is written into the WHERE clause, where it is
-- visible to anyone reading the definition rather than implied by a policy on
-- another object.
--
-- `security_barrier` stops a caller's own WHERE clause from being evaluated
-- before this one — without it, a cleverly written filter function can observe
-- rows the view was supposed to exclude.
-- ===========================================================================

DROP VIEW IF EXISTS public.rental_listings;

CREATE VIEW public.rental_listings
WITH (security_barrier = true) AS
SELECT
  id, slug,
  -- The masked address. The raw `address` column is deliberately absent.
  display_address,
  neighborhood, county, subdivision,
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
  -- Attribution: public by obligation, not by choice.
  mls_number, source_mls, source_updated_at,
  agent_name, agent_license, brokerage,
  listing_agent_name, listing_agent_license,
  listing_office_name, listing_office_license,
  co_listing_agent_name, co_listing_office_name,
  -- Absent on purpose: listing_agent_email and listing_agent_phone. The
  -- mandatory disclosure says inquiries are handled here rather than by the
  -- listing agent; publishing their direct line contradicts it.
  address_display_allowed, media_display_allowed, showing_allowed,
  open_house_allowed,
  created_at, updated_at
FROM public.mls_listings
-- The row filter, stated rather than inherited: a listing the feed forbids from
-- internet display is not part of this view at all.
WHERE internet_display_allowed IS NOT FALSE;

COMMENT ON VIEW public.rental_listings IS
  'What a visitor may see of a listing: narrowed columns, and only listings the '
  'feed permits to be displayed. The raw address and the listing agent''s direct '
  'contact details are not in it.';

REVOKE ALL ON public.mls_listings FROM anon;
GRANT SELECT ON public.rental_listings TO anon, authenticated;

-- Photos: same treatment, so a listing that forbids media has none in the view.
DROP VIEW IF EXISTS public.rental_listing_photos;

CREATE VIEW public.rental_listing_photos
WITH (security_barrier = true) AS
SELECT p.id, p.listing_id, p.photo_url, p.ordering, p.created_at
FROM public.mls_listing_photos p
JOIN public.mls_listings l ON l.id = p.listing_id
WHERE l.internet_display_allowed IS NOT FALSE
  AND l.media_display_allowed IS NOT FALSE;

COMMENT ON VIEW public.rental_listing_photos IS
  'Photos for listings that permit both internet display and media display.';

REVOKE ALL ON public.mls_listing_photos FROM anon;
GRANT SELECT ON public.rental_listing_photos TO anon, authenticated;
