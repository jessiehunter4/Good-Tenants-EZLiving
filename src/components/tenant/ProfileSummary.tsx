
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ProfileStatus {
  label: string;
  progress: number;
  color: string;
}

interface TenantProfile {
  id: string;
  status: string;
  move_in_date: string | null;
  household_size: number | null;
  household_income: number | null;
  pets: boolean | null;
  preferred_locations: string[] | null;
  bio: string | null;
}

const profileStatusMap: Record<string, ProfileStatus> = {
  incomplete: {
    label: "Incomplete",
    progress: 25,
    color: "text-warning bg-warning/10",
  },
  basic: {
    label: "Basic",
    progress: 50,
    color: "text-primary bg-role-tenant/10",
  },
  verified: {
    label: "Verified",
    progress: 75,
    color: "text-role-agent bg-role-agent/10",
  },
  premium: {
    label: "Premium",
    progress: 100,
    color: "text-role-landlord bg-role-landlord/10",
  },
};

interface ProfileSummaryProps {
  profile: TenantProfile;
}

const ProfileSummary = ({ profile }: ProfileSummaryProps) => {
  const navigate = useNavigate();

  const getStatusInfo = (status: string): ProfileStatus => {
    return profileStatusMap[status as keyof typeof profileStatusMap] || profileStatusMap.incomplete;
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Welcome, Tenant</CardTitle>
            <CardDescription>
              Your tenant profile is {getStatusInfo(profile.status).label}
            </CardDescription>
          </div>
          <Badge className={getStatusInfo(profile.status).color}>
            {getStatusInfo(profile.status).label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Profile Completion</span>
              <span>{getStatusInfo(profile.status).progress}%</span>
            </div>
            <Progress value={getStatusInfo(profile.status).progress} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h3 className="font-medium text-foreground">Move-in Date</h3>
              <p>{formatDate(profile.move_in_date)}</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground">Household Size</h3>
              <p>{profile.household_size || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground">Household Income</h3>
              <p>{profile.household_income ? `$${profile.household_income.toLocaleString()}/month` : 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground">Pets</h3>
              <p>{profile.pets ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => navigate("/onboard-tenant")}>
          Update Profile
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileSummary;
