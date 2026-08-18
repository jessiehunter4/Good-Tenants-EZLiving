
import { useEffect } from "react";
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
        const role = getUserRole();
        console.log("Dashboard: User role:", role);
        
        if (role) {
          // Redirect to role-specific dashboard
          switch (role) {
            case "tenant":
              console.log("Redirecting to tenant dashboard");
              navigate("/dashboard-tenant");
              break;
            case "agent":
              console.log("Redirecting to agent dashboard");
              navigate("/dashboard-agent");
              break;
            case "landlord":
              console.log("Redirecting to landlord dashboard");
              navigate("/dashboard-landlord");
              break;
            case "admin":
              console.log("Redirecting to admin dashboard");
              navigate("/admin-dashboard");
              break;
            default:
              console.log("Unknown role, staying on general dashboard");
              break;
          }
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
