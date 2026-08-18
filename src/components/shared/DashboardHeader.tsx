
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User, Home, Plus, MessageSquare, LogOut, Settings, Zap } from "lucide-react";
import IntegrationRequestModal from "@/components/integrations/IntegrationRequestModal";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  showControls?: boolean;
  email?: string;
  onSignOut?: () => void;
  role?: string;
}

const DashboardHeader = ({ title, subtitle, showControls = true, email, onSignOut }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  
  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    } else {
      signOut();
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        {showControls && (
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => navigate('/messages')}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </Button>
            
            {(user?.role === "agent" || user?.role === "landlord" || user?.role === "admin") && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/properties/create')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            )}

            {user?.role !== "admin" && (
              <IntegrationRequestModal>
                <Button variant="outline" size="sm">
                  <Zap className="h-4 w-4 mr-2" />
                  Request Integration
                </Button>
              </IntegrationRequestModal>
            )}

            {user?.role === "admin" && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/admin')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
            )}
            
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;
