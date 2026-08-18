
import { MapPin, DollarSign, Home, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Listing } from "@/types/listings";

interface PropertyCardProps {
  listing: Listing;
  onExpressInterest: (listingId: string) => void;
  onViewProperty: (listingId: string) => void;
}

const PropertyCard = ({ listing, onExpressInterest, onViewProperty }: PropertyCardProps) => {
  const formatPrice = (price: number) => `$${price.toLocaleString()}/month`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{listing.address}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {listing.city}, {listing.state} {listing.zip}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {listing.featured && (
              <Badge className="bg-warning/10 text-warning">Featured</Badge>
            )}
            <Badge className="bg-role-agent/10 text-role-agent">Available</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <Home className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">
              {listing.bedrooms} bed, {listing.bathrooms} bath
            </span>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm font-medium">
              {listing.price ? formatPrice(listing.price) : 'Price on request'}
            </span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">
              Available: {listing.available_date ? formatDate(listing.available_date) : 'Now'}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {listing.square_feet ? `${listing.square_feet.toLocaleString()} sq ft` : 'Size not specified'}
          </div>
        </div>

        {listing.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {listing.description}
          </p>
        )}

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onViewProperty(listing.id)}
          >
            View Details
          </Button>
          <Button 
            className="flex-1"
            onClick={() => onExpressInterest(listing.id)}
          >
            Express Interest
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
