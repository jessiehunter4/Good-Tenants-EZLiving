/**
 * The shape every rental surface works on.
 *
 * Carried across from `comingsoonhomrentals-com/src/hooks/useListings.ts`,
 * where the row, its photos and its computed status were assembled inline in
 * the hook. Here the assembly is a pure function: it is where the compliance
 * rules are applied, and it should be checkable without a database.
 */
import type { Row } from "@/hooks/admin/crud";
import type { Database } from "@/integrations/supabase/types";
import {
  attributionFor,
  displayAddress,
  showingAllowed,
  visiblePhotos,
  type Attribution,
} from "./compliance";
import {
  computeListingStatus,
  DEFAULT_RETENTION_DAYS,
  type ListingStatus,
} from "./listingStatus";

/**
 * The public projection. `rental_listings` is what the surfaces read: narrowed
 * columns, and only listings the feed permits to be displayed. The table row is
 * what the admin screens read.
 */
type RentalViewRow = Database["public"]["Views"]["rental_listings"]["Row"];

/*
 * `id` comes from a primary key and cannot be null. Postgres does not express
 * that through a view, so the generated type widens it; narrowing it back here
 * is more honest than threading a null id into every component that uses it as
 * a React key.
 */
export type RentalListingRow = Omit<RentalViewRow, "id"> & { id: string };

/** Kept for the admin side, which reads the table itself. */
export type MlsListingRow = Row<"mls_listings">;

export type ListingPhotoRow = { photo_url: string; ordering: number | null };

export type RentalListing = {
  id: string;
  slug: string | null;
  /** Already masked when the feed forbids the street. Safe to render. */
  displayAddress: string;
  rent: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  propertyType: string | null;
  description: string | null;
  dateAvailable: string | null;
  petsAllowed: boolean | null;
  minCreditScore: number | null;
  incomeMultiplier: number | null;
  status: ListingStatus;
  /** Already cut to the primary photo when the feed forbids the gallery. */
  photos: string[];
  showingAllowed: boolean;
  attribution: Attribution;
};

function sortPhotos(photos: readonly ListingPhotoRow[]): string[] {
  return [...photos]
    .sort((a, b) => (a.ordering ?? Number.MAX_SAFE_INTEGER) - (b.ordering ?? Number.MAX_SAFE_INTEGER))
    .map((p) => p.photo_url);
}

export type ToListingOptions = {
  retentionDays?: number;
  now?: Date;
};

export function toRentalListing(
  row: RentalListingRow,
  photos: readonly ListingPhotoRow[] = [],
  options: ToListingOptions = {},
): RentalListing {
  const status = computeListingStatus(
    {
      contractStatusChangeDate: row.contract_status_change_date,
      retentionDays: options.retentionDays ?? DEFAULT_RETENTION_DAYS,
    },
    options.now,
  );

  return {
    id: row.id,
    slug: row.slug,
    // The database computes this and only serves the masked form to a visitor.
    // `displayAddress` re-derives it for an admin read, which returns both.
    displayAddress: displayAddress(row),
    rent: row.rent,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    sqft: row.sqft,
    propertyType: row.property_type,
    description: row.description,
    dateAvailable: row.date_available,
    petsAllowed: row.pets_allowed,
    minCreditScore: row.min_credit_score,
    incomeMultiplier: row.income_requirement_multiplier,
    status,
    photos: visiblePhotos(sortPhotos(photos), row, status),
    showingAllowed: showingAllowed(row),
    attribution: attributionFor(row),
  };
}

/**
 * A dropped listing is out of its retention window and must come off the
 * public surfaces. It is filtered here rather than in the query because the
 * window depends on a setting, not on a column.
 */
export function isPubliclyListed(listing: RentalListing): boolean {
  return listing.status !== "dropped";
}

export function formatRent(rent: number | null): string {
  if (rent == null) return "Price on request";
  return `$${rent.toLocaleString("en-US")}/mo`;
}

export function formatBeds(listing: RentalListing): string {
  const parts: string[] = [];
  if (listing.bedrooms != null) parts.push(`${listing.bedrooms} bd`);
  if (listing.bathrooms != null) parts.push(`${listing.bathrooms} ba`);
  if (listing.sqft != null) parts.push(`${listing.sqft.toLocaleString("en-US")} sqft`);
  return parts.join(" · ");
}
