
import { useState } from "react";
import { Home } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Property {
  id: string;
  address: string | null;
  city: string | null;
  state: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  price: number | null;
}

interface PropertySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendInvite: (propertyId: string, message: string) => void;
  properties: Property[];
  tenantName: string;
}

const PropertySelectionModal = ({ 
  isOpen, 
  onClose, 
  onSendInvite, 
  properties, 
  tenantName 
}: PropertySelectionModalProps) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [customMessage, setCustomMessage] = useState<string>("");
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!selectedPropertyId) {
      toast({
        title: "Property Required",
        description: "Please select a property to continue.",
        variant: "destructive"
      });
      return;
    }

    onSendInvite(selectedPropertyId, customMessage);
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "Price not specified";
    return `$${price.toLocaleString()}`;
  };

  const getPropertyAddress = (property: Property) => {
    const parts = [
      property.address,
      property.city,
      property.state
    ].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Select a Property</DialogTitle>
          <DialogDescription>
            Choose a property to invite {tenantName} to view
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {properties.length > 0 ? (
            <RadioGroup value={selectedPropertyId} onValueChange={setSelectedPropertyId} className="gap-4">
              {properties.map((property) => (
                <div key={property.id} className="flex">
                  <RadioGroupItem 
                    id={property.id} 
                    value={property.id} 
                    className="mt-4"
                  />
                  <Label 
                    htmlFor={property.id} 
                    className="flex-1 ml-2 border rounded-md p-3 hover:bg-muted/40 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start">
                        <div className="bg-role-tenant/10 p-2 rounded-md mr-3">
                          <Home className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{getPropertyAddress(property)}</p>
                          <p className="text-sm text-muted-foreground">
                            {property.bedrooms} bed {property.bathrooms} bath
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">{formatPrice(property.price)}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="text-center py-6">
              <Home className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">No properties available</p>
              <p className="text-muted-foreground">You need to add properties before inviting tenants.</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="message">Add a personal message (optional)</Label>
            <Textarea 
              id="message"
              placeholder="Write a message to the tenant..." 
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedPropertyId || properties.length === 0}
          >
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PropertySelectionModal;
