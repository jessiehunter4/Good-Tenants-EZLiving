import { Link } from "react-router-dom";
import { Bath, BedDouble, Square } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatBeds, formatRent, type RentalListing } from "@/features/rentals/listing";
import { STATUS_LABEL } from "@/features/rentals/listingStatus";

/** Carried across from `comingsoonhomrentals-com/src/components/ListingCard.tsx`. */
export const ListingCard = ({ listing }: { listing: RentalListing }) => (
  <Link
    to={`/rentals/${listing.slug ?? listing.id}`}
    className="group block overflow-hidden rounded-2xl border border-clay/50 bg-card transition hover:shadow-lg"
  >
    <div className="relative aspect-[4/3] overflow-hidden bg-sand-deep">
      {listing.photos[0] ? (
        <img
          src={listing.photos[0]}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-espresso-muted">
          No photo available
        </div>
      )}
      <Badge className="absolute left-3 top-3 bg-espresso text-sand">
        {STATUS_LABEL[listing.status]}
      </Badge>
    </div>

    <div className="p-5">
      <p className="text-lg font-bold text-espresso">{formatRent(listing.rent)}</p>
      <p className="mt-1 truncate text-sm font-semibold text-espresso">{listing.displayAddress}</p>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-espresso-muted">
        {listing.bedrooms != null && (
          <span className="flex items-center gap-1">
            <BedDouble className="h-3.5 w-3.5" />
            {listing.bedrooms} bd
          </span>
        )}
        {listing.bathrooms != null && (
          <span className="flex items-center gap-1">
            <Bath className="h-3.5 w-3.5" />
            {listing.bathrooms} ba
          </span>
        )}
        {listing.sqft != null && (
          <span className="flex items-center gap-1">
            <Square className="h-3.5 w-3.5" />
            {listing.sqft.toLocaleString("en-US")} sqft
          </span>
        )}
      </div>

      <p className="sr-only">{formatBeds(listing)}</p>
    </div>
  </Link>
);

export default ListingCard;
