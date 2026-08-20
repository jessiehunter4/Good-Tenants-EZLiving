// Reading listings for the public surfaces.
//
// Carried across from `comingsoonhomrentals-com/src/hooks/useListings.ts` and
// `useListing.ts`. Two things changed on the way in.
//
// The compliance filtering is gone from this file, because it is no longer
// this file's job. The source selected every row and then, in React, hid the
// ones marked not-for-internet-display and swapped a withheld street for its
// neighbourhood — which means both had already been sent to the browser.
//
// The select list must name only columns the view exposes. Asking for one it
// deliberately withholds — `suppressed_reason` was the first — fails the whole
// request with a 400, and the page falls to its empty state as though there
// were simply no listings. A withheld column is not a null column.
//
// These read `rental_listings` and `rental_listing_photos`, two views that do
// the narrowing in the database: a suppressed listing is not in them, a
// withheld street is replaced before it leaves the server, and the listing
// agent's direct line is not a column. The page cannot leak what it is never
// given.
//
// The row-to-listing assembly is gone too, into a pure function, so the
// compliance rules can be tested without a database.
import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  toRentalListing,
  type ListingPhotoRow,
  type RentalListingRow,
  type RentalListing,
} from "@/features/rentals/listing";
import { DEFAULT_RETENTION_DAYS } from "@/features/rentals/listingStatus";

const MINUTE = 60 * 1000;

/*
 * Named as a typed list rather than a string, so the compiler checks each one
 * against the view. `suppressed_reason` sat in this select for a day: the view
 * deliberately withholds it, PostgREST rejected the whole request with a 400,
 * and the page rendered its empty state as though there were no listings at
 * all. A withheld column is not a null column, and nothing was watching.
 */
const LISTING_COLUMNS = [
  "id", "slug", "display_address", "neighborhood", "rent", "status",
  "computed_status", "bedrooms", "bathrooms", "sqft", "property_type",
  "year_built", "lot_size", "description", "date_available",
  "contract_status_change_date", "pets_allowed", "min_credit_score",
  "income_requirement_multiplier", "mls_number", "source_mls",
  "source_updated_at", "agent_name", "brokerage", "listing_agent_name",
  "listing_office_name", "address_display_allowed", "media_display_allowed",
  "showing_allowed", "open_house_allowed",
] as const satisfies readonly (keyof RentalListingRow)[];

const LISTING_SELECT = `${LISTING_COLUMNS.join(", ")}, rental_listing_photos ( photo_url, ordering )`;

type ListingWithPhotos = RentalListingRow & { rental_listing_photos: ListingPhotoRow[] | null };

export type RentalFilters = {
  location?: string;
  maxRent?: number | null;
  minBedrooms?: number | null;
  minBathrooms?: number | null;
  pets?: "any" | "allowed" | "not_allowed";
};

export const EMPTY_FILTERS: RentalFilters = {
  location: "",
  maxRent: null,
  minBedrooms: null,
  minBathrooms: null,
  pets: "any",
};

/**
 * How long a listing stays visible after it goes active. Stored as text in
 * site_settings, so it is parsed rather than trusted.
 */
export const retentionDaysQuery = queryOptions({
  queryKey: ["rentals", "retention-days"],
  queryFn: async (): Promise<number> => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "listing_retention_days")
      .maybeSingle();
    if (error) throw new Error(error.message);
    const parsed = Number(data?.setting_value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_RETENTION_DAYS;
  },
  staleTime: 30 * MINUTE,
});

export function rentalsQuery(filters: RentalFilters, retentionDays: number) {
  return queryOptions({
    queryKey: ["rentals", "list", filters, retentionDays],
    queryFn: async (): Promise<RentalListing[]> => {
      let query = supabase.from("rental_listings").select(LISTING_SELECT);

      if (filters.location?.trim()) {
        query = query.ilike("address", `%${filters.location.trim()}%`);
      }
      if (filters.maxRent != null) query = query.lte("rent", filters.maxRent);
      if (filters.minBedrooms != null) query = query.gte("bedrooms", filters.minBedrooms);
      if (filters.minBathrooms != null) query = query.gte("bathrooms", filters.minBathrooms);
      if (filters.pets === "allowed") query = query.eq("pets_allowed", true);
      if (filters.pets === "not_allowed") query = query.eq("pets_allowed", false);

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw new Error(error.message);

      return ((data ?? []) as unknown as ListingWithPhotos[]).map((row) =>
        toRentalListing(row, row.rental_listing_photos ?? [], { retentionDays }),
      );
    },
    staleTime: MINUTE,
  });
}

export function rentalBySlugQuery(slug: string, retentionDays: number) {
  return queryOptions({
    queryKey: ["rentals", "detail", slug, retentionDays],
    queryFn: async (): Promise<RentalListing | null> => {
      const { data, error } = await supabase
        .from("rental_listings")
        .select(LISTING_SELECT)
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return null;
      const row = data as unknown as ListingWithPhotos;
      return toRentalListing(row, row.rental_listing_photos ?? [], { retentionDays });
    },
    staleTime: MINUTE,
  });
}
