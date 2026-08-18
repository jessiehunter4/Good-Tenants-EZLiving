
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { RealtorProfile } from "@/hooks/useAgentData";
import ProfileVerificationBadge from "@/components/shared/ProfileVerificationBadge";

interface ProfileSummaryProps {
  profile: RealtorProfile;
}

const ProfileSummary = ({ profile }: ProfileSummaryProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Welcome, Licensed Agent</CardTitle>
            <CardDescription>
              {profile.agency ? `${profile.agency}` : "Complete your profile details"}
            </CardDescription>
          </div>
          <ProfileVerificationBadge 
            status={profile.status}
            userRole="agent"
            isVerified={profile.is_verified}
            licenseNumber={profile.license_number}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-foreground">License Number</h3>
            <p>{profile.license_number || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="font-medium text-foreground">Agency/Brokerage</h3>
            <p>{profile.agency || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="font-medium text-foreground">Years of Experience</h3>
            <p>{profile.years_experience !== null ? profile.years_experience : 'Not specified'}</p>
          </div>
          <div>
            <h3 className="font-medium text-foreground">Specialties</h3>
            <p>{profile.specialties?.join(', ') || 'Not specified'}</p>
          </div>
        </div>

        {profile.bio && (
          <div className="mt-4">
            <h3 className="font-medium text-foreground">Bio</h3>
            <p className="text-sm text-muted-foreground">{profile.bio}</p>
          </div>
        )}

        {(profile.status === 'incomplete' || !profile.license_number) && (
          <div className="mt-4 p-4 bg-warning/10 border border-warning/25 rounded-lg">
            <p className="text-sm text-warning">
              <strong>Action Required:</strong> Complete your license verification to access the tenant directory and send invitations.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={() => navigate("/onboard-agent")}>
          Update Profile
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileSummary;
