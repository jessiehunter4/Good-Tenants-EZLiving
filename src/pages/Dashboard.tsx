
import { useEffect } from "react";
import { dashboardPathFor, FALLBACK_DASHBOARD } from '@/features/access/dashboardPath';
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import DashboardLoader from "@/components/dashboard/DashboardLoader";
import DashboardHeader from "@/components/shared/DashboardHeader";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import { BRAND } from "@/config/brand";

const Dashboard = () => {
  const { user, getUserRole, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const redirectBasedOnRole = () => {
      if (!user) return;

      try {
        console.log("Dashboard: Redirecting based on role for user:", user.id);
        
        // Get user role from metadata (getUserRole returns string directly, not Promise)
        const destination = dashboardPathFor(getUserRole());

        /*
         * An unknown role resolves to this page, and navigating to the page you
         * are already on is how a render loop starts. Staying put is also the
         * honest outcome: there is nowhere better to send them.
         */
        if (destination !== FALLBACK_DASHBOARD) {
          navigate(destination, { replace: true });
        } else {
          console.log("No role found, staying on general dashboard");
        }
      } catch (error) {
        console.error("Error in Dashboard redirect logic:", error);
        toast({
          title: "Error",
          description: "Failed to load your profile data.",
          variant: "destructive",
        });
      }
    };

    redirectBasedOnRole();
  }, [user, toast, navigate, getUserRole]);

  if (!user) {
    return <DashboardLoader />;
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <DashboardHeader 
        title="Dashboard"
        subtitle={`Welcome to ${BRAND.name}`}
        email={user.email}
        onSignOut={signOut}
      />
      
      <main className="container mx-auto px-4 py-8">
        <WelcomeCard />
        <DashboardTabs />
      </main>
    </div>
  );
};

export default Dashboard;
