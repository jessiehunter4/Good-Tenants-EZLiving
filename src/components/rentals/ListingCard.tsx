import { Link } from "react-router-dom";

import { formatRent, statusBadgeClass, type RentalListing } from "@/features/rentals/listing";
import { STATUS_LABEL } from "@/features/rentals/listingStatus";

/**
 * Carried across from `comingsoonhomrentals-com/src/components/ListingCard.tsx`.
 *
 * Its shape is the source's: a 48-tall photo with the status badge over it, the
 * rent in green, the bed/bath/size line, the address, then the attribution
 * block and a full-width call to action.
 *
 * The attribution is not decoration. Showing a feed listing without naming the
 * MLS, its number there and the office that holds it is what makes the display
 * non-compliant — so it renders whatever it has rather than hiding when a field
 * is missing.
 */
export const ListingCard = ({ listing }: { listing: RentalListing }) => {
  const details = [
    listing.bedrooms != null && `${listing.bedrooms} beds`,
    listing.bathrooms != null && `${listing.bathrooms} baths`,
    listing.sqft != null && `${listing.sqft.toLocaleString("en-US")} sq ft`,
  ].filter(Boolean).join(" • ");

  const to = `/rentals/${listing.slug ?? listing.id}`;

  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-md transition-shadow duration-200 hover:shadow-lg">
      <div className="relative">
        <Link to={to}>
          <div className="h-48 overflow-hidden bg-muted">
            {listing.photos[0] ? (
              <img
                src={listing.photos[0]}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No photo available
              </div>
            )}
          </div>
        </Link>

        <div
          className={`absolute left-3 top-3 rounded-md px-2 py-1 text-xs font-medium text-white ${statusBadgeClass(
            listing.status,
          )}`}
        >
          {STATUS_LABEL[listing.status]}
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2 text-xl font-bold text-cta-qualify-ink">
          {formatRent(listing.rent).replace("/mo", "")}
          <span className="text-sm text-muted-foreground">/mo</span>
        </div>

        {details && <div className="mb-2 text-sm text-muted-foreground">{details}</div>}

        <Link to={to} className="block">
          <div className="mb-3 line-clamp-2 font-medium text-foreground transition-colors hover:text-cta-browse-ink">
            {listing.displayAddress}
          </div>
        </Link>

        <div className="mb-3 border-t pt-2 text-[11px] leading-snug text-muted-foreground">
          {listing.attribution.agentName && (
            <div>
              <strong>Listing Agent:</strong> {listing.attribution.agentName}
            </div>
          )}
          {listing.attribution.officeName && (
            <div>
              <strong>Listing Office:</strong> {listing.attribution.officeName}
            </div>
          )}
          <div>
            {listing.attribution.mlsNumber && <span>MLS #{listing.attribution.mlsNumber} · </span>}
            Source: {listing.attribution.sourceMls}
          </div>
        </div>

        {/*
         * The source sent everyone to prescreening. Here the profile already
         * knows whether they qualify, so the detail page decides what to offer
         * — and a listing whose agent forbids showings never offers one.
         */}
        <Link to={to} className="block">
          <button
            type="button"
            className="w-full rounded-md bg-cta-browse px-4 py-2 font-medium text-cta-browse-foreground transition-colors duration-200 hover:bg-cta-browse/90"
          >
            {listing.showingAllowed ? "Prequalify & Book Showing" : "See this rental"}
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ListingCard;
