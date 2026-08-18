
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Invitation {
  id: string;
  message: string | null;
  status: string | null;
  created_at: string;
  sender: {
    email: string;
    role: string;
  } | null;
  listing: {
    address: string | null;
    city: string | null;
    bedrooms: number | null;
    bathrooms: number | null;
    price: number | null;
  } | null;
}

interface InvitationCardProps {
  invitation: Invitation;
  onStatusChange?: () => void;
}

const InvitationCard = ({ invitation, onStatusChange }: InvitationCardProps) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateInvitationStatus = async (status: string) => {
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from("invites")
        .update({ status })
        .eq("id", invitation.id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Invitation ${status === "accepted" ? "accepted" : "declined"}.`,
      });
      
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error("Error updating invitation:", error);
      toast({
        title: "Error",
        description: "Could not update invitation status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card key={invitation.id}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            {invitation.listing?.address || 'Address not available'}, {invitation.listing?.city || 'City not available'}
          </CardTitle>
          <Badge className={
            invitation.status === 'pending' ? 'bg-warning' : 
            invitation.status === 'accepted' ? 'bg-success' : 
            'bg-muted-foreground'
          }>
            {(invitation.status || 'pending').charAt(0).toUpperCase() + (invitation.status || 'pending').slice(1)}
          </Badge>
        </div>
        <CardDescription>
          From: {invitation.sender?.email || 'Unknown sender'} ({invitation.sender?.role || 'unknown role'})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-sm text-muted-foreground">Bedrooms</span>
              <p>{invitation.listing?.bedrooms || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Bathrooms</span>
              <p>{invitation.listing?.bathrooms || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Price</span>
              <p>${invitation.listing?.price?.toLocaleString() || 'N/A'}/month</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Date Received</span>
              <p>{new Date(invitation.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          {invitation.message && (
            <div className="mt-2 pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground">Message:</p>
              <p className="text-sm">{invitation.message}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {invitation.status === 'pending' && (
          <>
            <Button 
              variant="default" 
              className="flex-1"
              disabled={isUpdating}
              onClick={() => updateInvitationStatus('accepted')}
            >
              Accept
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              disabled={isUpdating}
              onClick={() => updateInvitationStatus('declined')}
            >
              Decline
            </Button>
          </>
        )}
        {invitation.status !== 'pending' && (
          <Button variant="outline" className="flex-1">
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default InvitationCard;
