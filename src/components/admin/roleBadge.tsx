import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * One place that knows how a role is presented.
 *
 * It handles a null role deliberately. The users view returns null for an
 * account that holds no role — which is exactly what a signup asserting `admin`
 * now produces — and the previous code called role.charAt(0) on it, so the whole
 * table threw rather than rendering the row.
 */
const ROLE_STYLES: Record<string, string> = {
  tenant: "border-role-tenant/30 bg-role-tenant/10 text-role-tenant",
  landlord: "border-role-landlord/30 bg-role-landlord/10 text-role-landlord",
  agent: "border-role-agent/30 bg-role-agent/10 text-role-agent",
  lender: "border-brand/30 bg-brand/10 text-brand",
  admin: "border-foreground/20 bg-foreground/10 text-foreground",
};

export const RoleBadge = ({ role }: { role: string | null | undefined }) => {
  if (!role) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        No role
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={cn("capitalize", ROLE_STYLES[role] ?? "")}>
      {role}
    </Badge>
  );
};

export default RoleBadge;
