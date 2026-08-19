import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminList from "@/components/admin/AdminTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  adminListQuery,
  errorMessage,
  useAdminDelete,
  useAdminPatch,
} from "@/hooks/admin/crud";
import { useConfirm } from "@/hooks/admin/useConfirm";
import {
  countByStatus,
  nextStatuses,
  QUESTION_STATUS_LABEL,
  QUESTION_STATUSES,
  type QuestionStatus,
} from "@/features/admin/inboxStatus";

const submissionsQuery = adminListQuery("question_submissions", [
  { column: "created_at", ascending: false },
]);

/**
 * Carried across from `Irvine Living Daily/src/routes/admin.inbox.tsx`.
 *
 * The daily fetched each status tab separately. One query filtered in the
 * browser is fewer round trips and lets every tab show its count without
 * loading it — the volume here is a handful of questions a week.
 *
 * What did not come across is "Answer with AI", which needs a server runtime to
 * hold the model key. The answer flow is manual until that decision is made:
 * triage here, then publish the answer from Ask Q&A.
 */
const AdminInbox = () => {
  const { data = [], isLoading, error } = useQuery(submissionsQuery);
  const [tab, setTab] = useState<QuestionStatus>("new");
  const patch = useAdminPatch("question_submissions");
  const remove = useAdminDelete("question_submissions");
  const confirm = useConfirm();

  const counts = countByStatus(data, QUESTION_STATUSES);
  const rows = data.filter((row) => row.status === tab);

  return (
    <AdminLayout
      title="Questions inbox"
      description="What readers asked through Ask Good Tenants."
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as QuestionStatus)}>
        <TabsList>
          {QUESTION_STATUSES.map((status) => (
            <TabsTrigger key={status} value={status}>
              {QUESTION_STATUS_LABEL[status]} ({counts[status]})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-6">
        <AdminList
          isLoading={isLoading}
          isEmpty={rows.length === 0}
          error={error}
          emptyMessage={`No ${QUESTION_STATUS_LABEL[tab].toLowerCase()} questions.`}
        >
          <div className="space-y-3">
            {rows.map((row) => (
              <Card key={row.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-espresso">
                      {row.name ?? "Anonymous"}
                      <span className="font-normal text-espresso-muted"> · {row.email}</span>
                    </p>
                    <p className="text-xs text-espresso-muted">
                      {new Date(row.created_at).toLocaleString()}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-espresso">{row.question}</p>
                    {row.context && (
                      <p className="mt-1 whitespace-pre-wrap text-xs text-espresso-muted">
                        Context: {row.context}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary">{row.status}</Badge>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {nextStatuses(QUESTION_STATUSES, row.status).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        patch.mutate(
                          { id: row.id, values: { status } },
                          {
                            onSuccess: () => toast.success(`Marked ${status}`),
                            onError: (e) => toast.error(errorMessage(e)),
                          },
                        )
                      }
                    >
                      Mark {QUESTION_STATUS_LABEL[status].toLowerCase()}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    aria-label={`Delete question from ${row.name ?? "this reader"}`}
                    onClick={() => confirm.request(row.id, row.name ?? "this reader")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </AdminList>
      </div>

      <ConfirmDialog
        open={confirm.isOpen}
        onOpenChange={(v) => !v && confirm.dismiss()}
        onConfirm={() =>
          confirm.confirm((id) =>
            remove.mutate(id, {
              onSuccess: () => toast.success("Question deleted"),
              onError: (e) => toast.error(errorMessage(e)),
            }),
          )
        }
        title="Delete this question?"
        description={
          confirm.pending
            ? `The question from ${confirm.pending.label} is removed permanently. Mark it as spam instead if you only want it out of the way.`
            : ""
        }
        confirmText="Delete"
        variant="destructive"
        isLoading={remove.isPending}
      />
    </AdminLayout>
  );
};

export default AdminInbox;
