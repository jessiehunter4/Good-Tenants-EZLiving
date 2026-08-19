import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Check, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminList from "@/components/admin/AdminTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import {
  adminListQuery,
  errorMessage,
  useAdminDelete,
  useAdminPatch,
  type Row,
} from "@/hooks/admin/crud";
import { useConfirm } from "@/hooks/admin/useConfirm";
import { formatDate } from "@/features/daily/format";
import { CONTENT_SLOTS } from "@/features/admin/schemas";
import { draftTitle, groupDraftsByBatch } from "@/features/admin/calendar";

type Draft = Row<"ai_article_drafts">;

const batchesQuery = adminListQuery("ai_article_batches", [
  { column: "week_start", ascending: false },
]);
const draftsQuery = adminListQuery("ai_article_drafts", [{ column: "slot" }]);

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  pending_review: "default",
  generating: "secondary",
  approved: "outline",
  published: "outline",
  rejected: "destructive",
  failed: "destructive",
};

const SLOT_LABEL: Record<string, string> = {
  market: "Market insight",
  listing: "Listing spotlight",
  tip: "Tenant tip",
  community: "Community",
};

/**
 * Carried across from `Irvine Living Daily/src/routes/admin.calendar.tsx`.
 *
 * The daily generated a week of drafts from the seed bank with a model, then
 * reviewed them here. Generation needs a server runtime to hold the key, so
 * what came across is the review half: see the week, approve, reject, drop.
 */
const AdminCalendar = () => {
  const { data: batches = [], isLoading, error } = useQuery(batchesQuery);
  const { data: drafts = [] } = useQuery(draftsQuery);
  const patch = useAdminPatch("ai_article_drafts");
  const remove = useAdminDelete("ai_article_drafts");
  const confirm = useConfirm();

  const byBatch = groupDraftsByBatch(drafts);

  const setStatus = (draft: Draft, status: string) =>
    patch.mutate(
      { id: draft.id, values: { status, reviewed_at: new Date().toISOString() } },
      {
        onSuccess: () => toast.success(`Marked ${status.replace("_", " ")}`),
        onError: (e) => toast.error(errorMessage(e)),
      },
    );

  return (
    <AdminLayout
      title="Content calendar"
      description="The weeks of drafts waiting to be reviewed."
    >
      <Card className="mb-6 border-clay bg-clay-soft p-4">
        <div className="flex items-start gap-3">
          <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-espresso-muted" />
          <p className="text-sm text-espresso">
            Generating a week draws on the seed bank and a language model, which needs a server
            runtime this app does not have yet. Until then this screen reviews what exists — write
            posts directly under Articles.
          </p>
        </div>
      </Card>

      <AdminList
        isLoading={isLoading}
        isEmpty={batches.length === 0}
        error={error}
        emptyMessage="No weeks generated."
      >
        <div className="space-y-6">
          {batches.map((batch) => {
            const batchDrafts = byBatch.get(batch.id) ?? [];
            return (
              <Card key={batch.id} className="p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="font-semibold text-espresso">
                      Week of {formatDate(batch.week_start)}
                    </h2>
                    <p className="text-xs text-espresso-muted">
                      {batchDrafts.length} of {CONTENT_SLOTS.length} slots filled
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[batch.status] ?? "secondary"}>
                    {batch.status}
                  </Badge>
                </div>

                {batchDrafts.length === 0 ? (
                  <p className="text-sm text-espresso-muted">No drafts in this week.</p>
                ) : (
                  <ul className="divide-y divide-clay/50">
                    {batchDrafts.map((draft) => (
                      <li key={draft.id} className="flex items-start justify-between gap-4 py-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">
                              {SLOT_LABEL[draft.slot] ?? draft.slot}
                            </Badge>
                            <Badge variant={STATUS_VARIANT[draft.status] ?? "secondary"}>
                              {draft.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="mt-1 truncate font-medium text-espresso">
                            {draftTitle(draft)}
                          </p>
                          {draft.reject_reason && (
                            <p className="text-xs text-destructive">{draft.reject_reason}</p>
                          )}
                        </div>

                        <div className="flex shrink-0 gap-1">
                          {draft.status !== "approved" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setStatus(draft, "approved")}
                              aria-label={`Approve ${draftTitle(draft)}`}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {draft.status !== "rejected" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setStatus(draft, "rejected")}
                              aria-label={`Reject ${draftTitle(draft)}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => confirm.request(draft.id, draftTitle(draft))}
                            aria-label={`Delete ${draftTitle(draft)}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      </AdminList>

      <ConfirmDialog
        open={confirm.isOpen}
        onOpenChange={(v) => !v && confirm.dismiss()}
        onConfirm={() =>
          confirm.confirm((id) =>
            remove.mutate(id, {
              onSuccess: () => toast.success("Draft deleted"),
              onError: (e) => toast.error(errorMessage(e)),
            }),
          )
        }
        title="Delete this draft?"
        description={
          confirm.pending
            ? `“${confirm.pending.label}” goes away permanently. Reject it instead to keep the record.`
            : ""
        }
        confirmText="Delete"
        variant="destructive"
        isLoading={remove.isPending}
      />
    </AdminLayout>
  );
};

export default AdminCalendar;
