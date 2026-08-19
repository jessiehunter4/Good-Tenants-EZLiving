
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle, Shield } from "lucide-react";

interface ProfileVerificationBadgeProps {
  status: string;
  userRole: 'tenant' | 'landlord' | 'agent';
  isVerified?: boolean | null;
  licenseNumber?: string | null;
}

const ProfileVerificationBadge = ({ 
  status, 
  userRole, 
  isVerified = false, 
  licenseNumber 
}: ProfileVerificationBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'verified':
      case 'premium':
        return {
          icon: CheckCircle,
          text: userRole === 'agent' ? 'Licensed Agent' : 'Verified',
          className: 'bg-role-agent/10 text-role-agent',
        };
      case 'pending':
        return {
          icon: Clock,
          text: 'Verification Pending',
          className: 'bg-warning/10 text-warning',
        };
      case 'incomplete':
        return {
          icon: AlertCircle,
          text: 'Profile Incomplete',
          className: 'bg-muted text-foreground',
        };
      default:
        return {
          icon: AlertCircle,
          text: 'Basic Profile',
          className: 'bg-muted text-foreground',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="flex gap-2">
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
      
      {userRole === 'agent' && licenseNumber && (
        <Badge variant="outline" className="bg-role-tenant/10 text-primary">
          <Shield className="h-3 w-3 mr-1" />
          License: {licenseNumber}
        </Badge>
      )}
      
      {isVerified && (
        <Badge className="bg-role-tenant/10 text-primary">
          <CheckCircle className="h-3 w-3 mr-1" />
          Background Verified
        </Badge>
      )}
    </div>
  );
};

export default ProfileVerificationBadge;
