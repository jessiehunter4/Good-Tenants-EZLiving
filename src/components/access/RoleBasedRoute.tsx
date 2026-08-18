
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useRolePermissions, RoleType, Permission } from "@/hooks/useRolePermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles?: RoleType[];
  requiredPermission?: Permission;
  fallbackPath?: string;
  requireVerification?: boolean;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles,
  requiredPermission,
  fallbackPath = "/auth",
  requireVerification = false
}) => {
  const { role, canAccess, isVerified, loading } = useRolePermissions();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Check if user has required role
  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check if user has required permission
  if (requiredPermission && !canAccess(requiredPermission)) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/40 px-4">
        <Alert className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this feature. 
            {requireVerification && !isVerified && " Please complete verification to unlock this feature."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check verification requirement
  if (requireVerification && !isVerified) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/40 px-4">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This feature requires account verification. Please complete your profile verification to continue.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
