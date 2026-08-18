
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import DashboardLoader from "@/components/dashboard/DashboardLoader";
import { BRAND } from "@/config/brand";

const WelcomeCard = () => {
  const { user, getUserRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profileStatus, setProfileStatus] = useState<string>("incomplete");
  const [profileProgress, setProfileProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch user role
        const role = await getUserRole();
        if (role) {
          setUserRole(role);

          // Fetch profile status based on role
          let profileTable = "";
          switch (role) {
            case "tenant":
              profileTable = "tenant_profiles";
              break;
            case "agent":
              profileTable = "realtor_profiles";
              break;
            case "landlord":
              profileTable = "landlord_profiles";
              break;
            default:
              break;
          }

          if (profileTable) {
            const { data: profileData, error: profileError } = await supabase
              .from(profileTable as "tenant_profiles" | "realtor_profiles" | "landlord_profiles")
              .select("status")
              .eq("id", user.id)
              .single();

            if (profileError) throw profileError;
            if (profileData && profileData.status) {
              setProfileStatus(profileData.status);
              // Calculate approximate profile completion
              switch (profileData.status) {
                case "incomplete":
                  setProfileProgress(25);
                  break;
                case "basic":
                  setProfileProgress(50);
                  break;
                case "verified":
                  setProfileProgress(75);
                  break;
                case "premium":
                  setProfileProgress(100);
                  break;
                default:
                  setProfileProgress(25);
                  break;
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load your profile data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, toast, getUserRole]);

  if (loading) {
    return <DashboardLoader />;
  }

  const handleCompleteProfile = () => {
    if (userRole === "tenant") navigate("/onboard-tenant");
    else if (userRole === "agent") navigate("/onboard-agent");
    else if (userRole === "landlord") navigate("/onboard-landlord");
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Welcome to {BRAND.name}</CardTitle>
        <CardDescription>
          Complete your profile to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Profile Completion</span>
              <span>{profileProgress}%</span>
            </div>
            <Progress value={profileProgress} />
          </div>
          <div>
            <p>
              Current status: <span className="font-medium capitalize">{profileStatus}</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Complete your profile information to improve your visibility and matches.
            </p>
          </div>
          <Button onClick={handleCompleteProfile}>
            Complete Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeCard;
