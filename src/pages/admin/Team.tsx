import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Shield, ShieldOff, UserPlus } from "lucide-react";
import { toast } from "sonner";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminList from "@/components/admin/AdminTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { adminListQuery, errorMessage } from "@/hooks/admin/crud";
import { useGrantEditor, useRevokeRole, useStaff } from "@/hooks/admin/useStaff";

const invitesQuery = adminListQuery("admin_invites", [
  { column: "sent_at", ascending: false },
]);

/**
 * Carried across from `Irvine Living Daily/src/routes/admin.team.tsx`.
 *
 * The daily's version could send an invite: it hashed a token, wrote the row
 * and emailed a link. Both halves need a server — a service key to create the
 * account and a sender for the mail — so what came across is the half that
 * does not: seeing who has staff access, and granting or removing the editor
 * role for someone who already has an account.
 */
const AdminTeam = () => {
  const { data: staff = [], isLoading, error } = useStaff();
  const { data: invites = [] } = useQuery(invitesQuery);
  const grant = useGrantEditor();
  const revoke = useRevokeRole();
  const [pendingRevoke, setPendingRevoke] = useState<{ id: string; email: string } | null>(null);
  const [email, setEmail] = useState("");

  const openInvites = invites.filter((i) => !i.accepted_at && !i.revoked_at);

  return (
    <AdminLayout
      title="Team"
      description="Who can publish, and who can administer."
    >
      <Card className="mb-6 p-5">
        <h2 className="mb-1 font-semibold text-espresso">Make someone an editor</h2>
        <p className="mb-3 text-sm text-espresso-muted">
          They need an account already — sign-up happens on the public site. An editor can write
          and publish; an admin can do that and everything else.
        </p>
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            grant.mutate(email.trim(), {
              onSuccess: () => {
                toast.success("Editor access granted");
                setEmail("");
              },
              onError: (err) => toast.error(errorMessage(err)),
            });
          }}
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="their@email.com"
            aria-label="Email address"
            className="h-10 min-w-[260px] flex-1 rounded-md border border-clay bg-card px-3 text-sm text-espresso outline-none focus:border-espresso"
          />
          <Button
            type="submit"
            disabled={grant.isPending}
            className="bg-espresso text-sand hover:bg-espresso/90"
          >
            <UserPlus className="mr-1.5 h-4 w-4" />
            {grant.isPending ? "Granting…" : "Grant editor"}
          </Button>
        </form>
      </Card>

      {openInvites.length > 0 && (
        <Card className="mb-6 p-5">
          <h2 className="mb-3 font-semibold text-espresso">Invites still open</h2>
          <ul className="space-y-2 text-sm">
            {openInvites.map((invite) => (
              <li key={invite.id} className="flex items-center justify-between gap-3">
                <span className="truncate text-espresso">
                  {invite.first_name} {invite.last_name} · {invite.email}
                </span>
                <span className="shrink-0 text-xs text-espresso-muted">
                  sent {new Date(invite.sent_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-espresso-muted">
            Carried over from the daily. Nothing sends these now — grant the role directly instead.
          </p>
        </Card>
      )}

      <AdminList
        isLoading={isLoading}
        isEmpty={staff.length === 0}
        error={error}
        emptyMessage="Nobody has staff access."
      >
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-clay/50">
            {staff.map((member) => (
              <li key={`${member.id}-${member.role}`} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-espresso">
                    {member.display_name || member.email}
                  </p>
                  <p className="truncate text-xs text-espresso-muted">{member.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                    {member.role === "admin" ? (
                      <Shield className="mr-1 h-3 w-3" />
                    ) : null}
                    {member.role}
                  </Badge>
                  {member.role === "editor" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      aria-label={`Remove editor access from ${member.email}`}
                      onClick={() => setPendingRevoke({ id: member.id, email: member.email ?? "" })}
                    >
                      <ShieldOff className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </AdminList>

      <ConfirmDialog
        open={pendingRevoke !== null}
        onOpenChange={(v) => !v && setPendingRevoke(null)}
        onConfirm={() => {
          if (!pendingRevoke) return;
          revoke.mutate(
            { userId: pendingRevoke.id, role: "editor" },
            {
              onSuccess: () => {
                toast.success("Editor access removed");
                setPendingRevoke(null);
              },
              onError: (e) => toast.error(errorMessage(e)),
            },
          );
        }}
        title="Remove editor access?"
        description={
          pendingRevoke
            ? `${pendingRevoke.email} keeps their account but can no longer write or publish.`
            : ""
        }
        confirmText="Remove access"
        variant="destructive"
        isLoading={revoke.isPending}
      />
    </AdminLayout>
  );
};

export default AdminTeam;
