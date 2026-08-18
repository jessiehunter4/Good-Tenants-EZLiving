
import { Building, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ListingCard from "@/components/shared/ListingCard";
import { Listing } from "@/hooks/useLandlordData";

interface ListingsSectionProps {
  listings: Listing[];
}

const ListingsSection = ({ listings }: ListingsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Properties</CardTitle>
        <CardDescription>
          Manage your property listings here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                address={listing.address}
                city={listing.city}
                state={listing.state}
                zip={listing.zip}
                bedrooms={listing.bedrooms}
                bathrooms={listing.bathrooms}
                square_feet={listing.square_feet}
                price={listing.price}
                available_date={listing.available_date}
                is_active={listing.is_active}
                onEdit={() => {}}
                onFindTenants={() => {}}
                actionText="Find Tenants"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Building className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No properties yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first property listing to start finding tenants.
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ListingsSection;
