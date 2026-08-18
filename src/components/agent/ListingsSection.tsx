
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Plus } from "lucide-react";
import EmptyState from "@/components/tenant/EmptyState";
import ListingCard from "@/components/shared/ListingCard";
import { Listing } from "@/hooks/useAgentData";

interface ListingsSectionProps {
  listings: Listing[];
}

const ListingsSection = ({ listings }: ListingsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Listings</CardTitle>
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
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Home className="h-6 w-6 text-muted-foreground" />}
            title="No listings yet"
            description="Add your first property listing to start finding tenants."
            action={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Listing
              </Button>
            }
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ListingsSection;
