/**
 * What may be shown about a listing, and how it must be credited.
 *
 * Carried across from `comingsoonhomrentals-com/src/lib/listingCompliance.ts`.
 *
 * These are not presentation preferences. The listings arrive from an MLS feed
 * under terms that say which fields may be displayed, how many photos, and
 * what attribution has to appear beside them. The database refuses to send a
 * listing that forbids internet display at all; everything below is the
 * narrower question of what to do with one that may be shown.
 */
import { isTerminalStatus, type ListingStatus } from "./listingStatus";

export type CompliantListing = {
  /** Present when reading the table as an admin; absent on the public view. */
  address?: string | null;
  /** Present on the public view, where the database has already masked it. */
  display_address?: string | null;
  neighborhood?: string | null;
  address_display_allowed?: boolean | null;
  media_display_allowed?: boolean | null;
  showing_allowed?: boolean | null;
  open_house_allowed?: boolean | null;
  status?: string | null;
  mls_number?: string | null;
  source_mls?: string | null;
  source_updated_at?: string | null;
  listing_office_name?: string | null;
  listing_agent_name?: string | null;
  brokerage?: string | null;
  agent_name?: string | null;
};

/** Mandatory inquiry-routing disclosure. Carried across verbatim. */
export const INQUIRY_DISCLOSURE =
  "Inquiries are handled by Good Tenants EZ Living, not directly by the listing agent or listing office.";

const WITHHELD = "Address available on request";

/**
 * The address a visitor may see.
 *
 * On the public view the database has already decided this, and the raw street
 * is not in the row at all — so the first branch is the normal one. The rest is
 * for an admin read, which returns both columns, and it applies the same rule:
 * when the feed forbids the street the neighbourhood stands in, and when there
 * is no neighbourhood either, nothing of the address is shown.
 */
export function displayAddress(listing: CompliantListing): string {
  if (listing.display_address) return listing.display_address;
  if (listing.address_display_allowed === false) {
    return listing.neighborhood || WITHHELD;
  }
  return listing.address || WITHHELD;
}

/**
 * Whether media has to be cut back to the primary photo.
 *
 * Two reasons: the feed forbids media display, or the listing has reached a
 * terminal status, at which point the gallery may no longer be shown.
 */
export function restrictToPrimaryPhoto(
  listing: CompliantListing,
  computed?: ListingStatus,
): boolean {
  if (listing.media_display_allowed === false) return true;
  if (computed === "dropped") return true;
  return isTerminalStatus(listing.status);
}

export function visiblePhotos(
  photos: readonly string[],
  listing: CompliantListing,
  computed?: ListingStatus,
): string[] {
  if (photos.length === 0) return [];
  return restrictToPrimaryPhoto(listing, computed) ? [photos[0]] : [...photos];
}

/** Whether a showing may be offered at all. */
export function showingAllowed(listing: CompliantListing): boolean {
  return listing.showing_allowed !== false;
}

/**
 * The attribution line that must appear with a displayed listing: which MLS it
 * came from, its number there, and the office that holds it.
 */
export type Attribution = {
  mlsNumber: string | null;
  sourceMls: string;
  officeName: string | null;
  agentName: string | null;
  lastUpdated: string | null;
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Locale-independent, so the server and the browser agree. */
export function formatLastUpdated(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function attributionFor(listing: CompliantListing): Attribution {
  return {
    mlsNumber: listing.mls_number ?? null,
    sourceMls: listing.source_mls || "CRMLS",
    officeName: listing.listing_office_name || listing.brokerage || null,
    agentName: listing.listing_agent_name || listing.agent_name || null,
    lastUpdated: formatLastUpdated(listing.source_updated_at),
  };
}
