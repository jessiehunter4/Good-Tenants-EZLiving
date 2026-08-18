
import { format } from "date-fns";
import { User } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TenantProfile } from "@/types/profiles";
import { useToast } from "@/hooks/use-toast";

interface TenantProfileModalProps {
  tenant: TenantProfile;
  isOpen: boolean;
  onClose: () => void;
  onInvite: (tenantId: string) => void;
}

const TenantProfileModal = ({ tenant, isOpen, onClose, onInvite }: TenantProfileModalProps) => {
  const { toast } = useToast();
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Flexible";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatIncome = (income: number | null) => {
    if (!income) return "Not specified";
    return `$${income.toLocaleString()}/month`;
  };
  
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const getScreeningStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    switch (status) {
      case 'pre-screened':
        return <Badge className="bg-role-agent/10 text-role-agent">Pre-Screened</Badge>;
      case 'completed':
        return <Badge className="bg-role-tenant/10 text-primary">Screening Completed</Badge>;
      case 'in-process':
      default:
        return <Badge className="bg-warning/10 text-warning">Screening In Process</Badge>;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Tenant Profile</DialogTitle>
          <DialogDescription>
            Detailed information about this tenant
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header with avatar and badges */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={tenant.profile_image_url || undefined} />
                <AvatarFallback className="bg-role-tenant/10 text-primary">
                  {getInitials(tenant.user_email)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">{tenant.user_email}</h3>
                <p className="text-sm text-muted-foreground">
                  Last active: {tenant.last_activity ? formatDate(tenant.last_activity) : "Unknown"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {getScreeningStatusBadge(tenant.screening_status)}
              {tenant.is_pre_screened && (
                <Badge className="bg-role-agent/10 text-role-agent">Verified</Badge>
              )}
            </div>
          </div>
          
          {/* Tenant details */}
          <div className="grid grid-cols-2 gap-4 border-t border-b py-4">
            <div>
              <p className="text-sm text-muted-foreground">Moving Date</p>
              <p className="font-medium">{formatDate(tenant.move_in_date)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Income</p>
              <p className="font-medium">{formatIncome(tenant.household_income)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Household Size</p>
              <p className="font-medium">
                {tenant.household_size || 'Not specified'} {tenant.household_size === 1 ? 'person' : 'people'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pets</p>
              <p className="font-medium">{tenant.pets ? 'Yes' : 'No'}</p>
            </div>
          </div>
          
          {/* Location preferences */}
          <div>
            <h4 className="font-medium mb-2">Preferred Locations</h4>
            <div className="flex flex-wrap gap-2">
              {tenant.preferred_locations?.map((location, index) => (
                <Badge key={index} variant="outline" className="bg-muted">
                  {location}
                </Badge>
              )) || <p className="text-muted-foreground text-sm">No preferred locations specified</p>}
            </div>
          </div>
          
          {/* Bio */}
          {tenant.bio && (
            <div>
              <h4 className="font-medium mb-2">About</h4>
              <p className="text-sm text-foreground">{tenant.bio}</p>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => onInvite(tenant.id)}>
              Invite to Property
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TenantProfileModal;
