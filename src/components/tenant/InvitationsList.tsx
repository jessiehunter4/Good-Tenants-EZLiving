
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import InvitationCard, { Invitation } from "./InvitationCard";
import EmptyState from "./EmptyState";

interface InvitationsListProps {
  invitations: Invitation[];
  onStatusChange?: () => void;
}

const InvitationsList = ({ invitations, onStatusChange }: InvitationsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Invitations</CardTitle>
        <CardDescription>
          Invitations from agents and landlords will appear here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {invitations.length > 0 ? (
          <div className="space-y-4">
            {invitations.map((invite) => (
              <InvitationCard 
                key={invite.id} 
                invitation={invite} 
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<User className="h-6 w-6 text-muted-foreground" />}
            title="No invitations yet"
            description="Complete your profile to increase your chances of receiving invitations."
          />
        )}
      </CardContent>
    </Card>
  );
};

export default InvitationsList;
