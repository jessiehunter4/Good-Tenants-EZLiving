
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/tenant/EmptyState";

const VerificationRequired = () => {
  return (
    <EmptyState
      icon={<User className="h-6 w-6 text-muted-foreground" />}
      title="Verification Required"
      description="You need to be verified to access the tenant directory."
      action={<Button>Get Verified</Button>}
    />
  );
};

export default VerificationRequired;
