import { useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminList from "@/components/admin/AdminTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  adminListQuery,
  errorMessage,
  useAdminDelete,
  useAdminPatch,
  type Row,
} from "@/hooks/admin/crud";
import { useConfirm } from "@/hooks/admin/useConfirm";
import {
  countByStatus,
  LEAD_STATUS_LABEL,
  LEAD_STATUSES,
  type LeadStatus,
} from "@/features/admin/inboxStatus";

type Lead = Row<"lead_captures">;

const STATUS_VARIANT: Record<LeadStatus, "default" | "secondary" | "outline" | "destructive"> = {
  new: "default",
  contacted: "secondary",
  converted: "outline",
  archived: "destructive",
};

const leadsQuery = adminListQuery("lead_captures", [
  { column: "created_at", ascending: false },
]);

/** Carried across from `Irvine Living Daily/src/routes/admin.leads.tsx`. */
const AdminLeads = () => {
  const { data = [], isLoading, error } = useQuery(leadsQuery);
  const patch = useAdminPatch("lead_captures");
  const remove = useAdminDelete("lead_captures");
  const confirm = useConfirm();

  const counts = countByStatus(data, LEAD_STATUSES);

  return (
    <AdminLayout
      title="Leads"
      description="Captures from CTA opt-ins, lead forms and direct enquiries."
      actions={
        <div className="flex flex-wrap gap-2">
          {LEAD_STATUSES.map((status) => (
            <Badge key={status} variant={STATUS_VARIANT[status]}>
              {LEAD_STATUS_LABEL[status]} {counts[status]}
            </Badge>
          ))}
        </div>
      }
    >
      <AdminList
        isLoading={isLoading}
        isEmpty={data.length === 0}
        error={error}
        emptyMessage="No leads yet."
      >
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-clay/50">
            {data.map((lead) => (
              <li key={lead.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge variant={STATUS_VARIANT[lead.status as LeadStatus] ?? "default"}>
                        {lead.status}
                      </Badge>
                      <Badge variant="secondary">{lead.intent}</Badge>
                      {lead.source_slug && (
                        <Link
                          to={`/blog/${lead.source_slug}`}
                          className="text-xs text-espresso-muted underline"
                        >
                          /blog/{lead.source_slug}
                        </Link>
                      )}
                      <span className="text-xs text-espresso-muted">
                        {new Date(lead.created_at).toLocaleString()}
                      </span>
                    </div>

                    <p className="font-semibold text-espresso">{lead.name || "No name given"}</p>
                    <p className="text-sm text-espresso-muted">
                      {[lead.email, lead.phone].filter(Boolean).join(" · ") || "No contact details"}
                    </p>
                    {lead.message && (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-espresso">{lead.message}</p>
                    )}
                    <Attribution lead={lead} />
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Select
                      value={lead.status}
                      onValueChange={(status) =>
                        patch.mutate(
                          { id: lead.id, values: { status } },
                          {
                            onSuccess: () => toast.success("Lead updated"),
                            onError: (e) => toast.error(errorMessage(e)),
                          },
                        )
                      }
                    >
                      <SelectTrigger
                        className="h-8 w-[130px] text-xs"
                        aria-label={`Status for ${lead.name || lead.email || "lead"}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEAD_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {LEAD_STATUS_LABEL[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      aria-label={`Delete lead from ${lead.name || lead.email || "unknown"}`}
                      onClick={() =>
                        confirm.request(lead.id, lead.name || lead.email || "this lead")
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </AdminList>

      <ConfirmDialog
        open={confirm.isOpen}
        onOpenChange={(v) => !v && confirm.dismiss()}
        onConfirm={() =>
          confirm.confirm((id) =>
            remove.mutate(id, {
              onSuccess: () => toast.success("Lead deleted"),
              onError: (e) => toast.error(errorMessage(e)),
            }),
          )
        }
        title="Delete this lead?"
        description={
          confirm.pending
            ? `${confirm.pending.label} and their message are removed permanently. Archive instead if you only want them out of the way.`
            : ""
        }
        confirmText="Delete"
        variant="destructive"
        isLoading={remove.isPending}
      />
    </AdminLayout>
  );
};

const Attribution = ({ lead }: { lead: Lead }) => {
  const parts = [lead.utm_source, lead.utm_medium, lead.utm_campaign, lead.utm_content].filter(
    Boolean,
  );
  if (parts.length === 0) return null;
  return <p className="mt-2 text-xs text-espresso-muted">UTM: {parts.join(" / ")}</p>;
};

export default AdminLeads;
