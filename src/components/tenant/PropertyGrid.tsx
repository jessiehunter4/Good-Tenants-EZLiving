
import { Home } from "lucide-react";
import { Listing } from "@/types/listings";
import PropertyCard from "./PropertyCard";
import EmptyState from "./EmptyState";

interface PropertyGridProps {
  listings: Listing[];
  onExpressInterest: (listingId: string) => void;
  onViewProperty: (listingId: string) => void;
}

const PropertyGrid = ({ listings, onExpressInterest, onViewProperty }: PropertyGridProps) => {
  if (listings.length === 0) {
    return (
      <EmptyState
        icon={<Home className="h-8 w-8 text-muted-foreground" />}
        title="No properties found"
        description="No properties match your search criteria. Try adjusting your filters."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {listings.map((listing) => (
        <PropertyCard
          key={listing.id}
          listing={listing}
          onExpressInterest={onExpressInterest}
          onViewProperty={onViewProperty}
        />
      ))}
    </div>
  );
};

export default PropertyGrid;
