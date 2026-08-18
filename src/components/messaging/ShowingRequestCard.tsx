
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { format } from "date-fns";

interface ShowingRequest {
  id: string;
  listing_id: string;
  tenant_id: string;
  requested_date: string;
  requested_time: string;
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  message?: string;
  listing?: {
    address: string;
    city: string;
    state: string;
  };
  tenant?: {
    email: string;
  };
}

interface ShowingRequestCardProps {
  showing: ShowingRequest;
  onRespond?: (showingId: string, action: 'confirm' | 'reschedule' | 'cancel') => void;
  userRole: string;
}

const ShowingRequestCard: React.FC<ShowingRequestCardProps> = ({ 
  showing, 
  onRespond, 
  userRole 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested': return 'bg-warning/10 text-warning';
      case 'confirmed': return 'bg-role-agent/10 text-role-agent';
      case 'completed': return 'bg-role-tenant/10 text-primary';
      case 'cancelled': return 'bg-destructive/10 text-destructive';
      case 'rescheduled': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-foreground';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">Property Showing Request</CardTitle>
          <Badge className={getStatusColor(showing.status)}>
            {showing.status.charAt(0).toUpperCase() + showing.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {showing.listing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{showing.listing.address}, {showing.listing.city}, {showing.listing.state}</span>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(showing.requested_date), 'PPP')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{showing.requested_time}</span>
          </div>
        </div>
        
        {showing.tenant && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{showing.tenant.email}</span>
          </div>
        )}
        
        {showing.message && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">Message:</p>
            <p className="text-sm">{showing.message}</p>
          </div>
        )}
        
        {userRole !== 'tenant' && showing.status === 'requested' && onRespond && (
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              onClick={() => onRespond(showing.id, 'confirm')}
              className="flex-1"
            >
              Confirm
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onRespond(showing.id, 'reschedule')}
              className="flex-1"
            >
              Reschedule
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={() => onRespond(showing.id, 'cancel')}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShowingRequestCard;
