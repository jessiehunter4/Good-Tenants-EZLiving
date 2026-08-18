
import React from "react";
import { useRolePermissions, Permission, AccessTier } from "@/hooks/useRolePermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Lock, Crown, Shield } from "lucide-react";

interface FeatureGateProps {
  children: React.ReactNode;
  permission: Permission;
  requiredTier?: AccessTier;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
  onUpgrade?: () => void;
}

const FeatureGate: React.FC<FeatureGateProps> = ({
  children,
  permission,
  requiredTier,
  fallback,
  showUpgrade = true,
  onUpgrade
}) => {
  const { canAccess, tier, role } = useRolePermissions();

  if (!canAccess(permission)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    const getTierIcon = () => {
      switch (requiredTier) {
        case "premium": return <Crown className="h-4 w-4" />;
        case "verified": return <Shield className="h-4 w-4" />;
        default: return <Lock className="h-4 w-4" />;
      }
    };

    const getTierMessage = () => {
      if (requiredTier === "premium") {
        return "This feature requires a premium account.";
      }
      if (requiredTier === "verified") {
        return "This feature requires account verification.";
      }
      return "You don't have access to this feature.";
    };

    return (
      <Alert className="border-warning/25 bg-warning/10">
        {getTierIcon()}
        <AlertDescription className="flex items-center justify-between">
          <span>{getTierMessage()}</span>
          {showUpgrade && onUpgrade && (
            <Button onClick={onUpgrade} size="sm" variant="outline">
              {requiredTier === "premium" ? "Upgrade" : "Verify Account"}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};

export default FeatureGate;
