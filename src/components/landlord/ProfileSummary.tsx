
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LandlordProfile } from "@/hooks/useLandlordData";
import ProfileVerificationBadge from "@/components/shared/ProfileVerificationBadge";

interface ProfileSummaryProps {
  profile: LandlordProfile;
}

const ProfileSummary = ({ profile }: ProfileSummaryProps) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Welcome, Property Owner</CardTitle>
            <CardDescription>
              {profile.property_count ? `Managing ${profile.property_count} properties` : "Complete your profile details"}
            </CardDescription>
          </div>
          <ProfileVerificationBadge 
            status={profile.status}
            userRole="landlord"
            isVerified={profile.is_verified}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-foreground">Properties Owned</h3>
            <p>{profile.property_count || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="font-medium text-foreground">Management Type</h3>
            <p>{profile.management_type === 'self_managed' ? 'Self-managed' : profile.management_type === 'property_manager' ? 'Property Manager' : 'Not specified'}</p>
          </div>
          <div>
            <h3 className="font-medium text-foreground">Years of Experience</h3>
            <p>{profile.years_experience !== null ? profile.years_experience : 'Not specified'}</p>
          </div>
          {profile.preferred_tenant_criteria && (
            <div className="col-span-2">
              <h3 className="font-medium text-foreground">Preferred Tenant Criteria</h3>
              <p className="text-sm">{profile.preferred_tenant_criteria}</p>
            </div>
          )}
        </div>

        {profile.bio && (
          <div className="mt-4">
            <h3 className="font-medium text-foreground">Bio</h3>
            <p className="text-sm text-muted-foreground">{profile.bio}</p>
          </div>
        )}

        {profile.status === 'incomplete' && (
          <div className="mt-4 p-4 bg-warning/10 border border-warning/25 rounded-lg">
            <p className="text-sm text-warning">
              <strong>Action Required:</strong> Complete your profile to access all features and start finding tenants.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={() => navigate("/onboard-landlord")}>
          Update Profile
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileSummary;
