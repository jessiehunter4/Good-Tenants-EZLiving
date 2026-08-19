import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminList from "@/components/admin/AdminTable";
import FieldError from "@/components/admin/FieldError";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  adminListQuery,
  errorMessage,
  useAdminDelete,
  useAdminPatch,
  useAdminUpsert,
} from "@/hooks/admin/crud";
import { useConfirm } from "@/hooks/admin/useConfirm";
import { recipientSchema, type RecipientForm } from "@/features/admin/schemas";

const recipientsQuery = adminListQuery("ask_notification_recipients", [
  { column: "active", ascending: false },
  { column: "name" },
]);

/** Carried across from `Irvine Living Daily/src/routes/admin.notifications.tsx`. */
const AdminNotifications = () => {
  const { data = [], isLoading, error } = useQuery(recipientsQuery);
  const upsert = useAdminUpsert("ask_notification_recipients");
  const patch = useAdminPatch("ask_notification_recipients");
  const remove = useAdminDelete("ask_notification_recipients");
  const confirm = useConfirm();

  const form = useForm<RecipientForm>({
    resolver: zodResolver(recipientSchema),
    defaultValues: { name: "", email: "" },
  });

  const activeCount = data.filter((r) => r.active).length;

  const submit = form.handleSubmit((values) => {
    upsert.mutate(
      { values: { name: values.name, email: values.email, active: true } },
      {
        onSuccess: () => {
          toast.success("Recipient added");
          form.reset();
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  });

  return (
    <AdminLayout
      title="Question notifications"
      description="Who hears about a new Ask Good Tenants question."
    >
      <Card className="mb-6 border-warning/40 bg-warning/5 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <p className="text-sm text-espresso">
            This list is not wired to an email sender yet — there is no server runtime to send
            from. Names here are the record of who <em>should</em> be told; questions still arrive
            in the inbox either way.
          </p>
        </div>
      </Card>

      {data.length > 0 && activeCount === 0 && (
        <Card className="mb-6 border-destructive/40 bg-destructive/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <p className="text-sm text-espresso">
              Every recipient is paused, so nobody is on the list at all.
            </p>
          </div>
        </Card>
      )}

      <Card className="mb-6 p-5">
        <h2 className="mb-3 font-semibold text-espresso">Add a recipient</h2>
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <div>
            <Label htmlFor="recipient-name" className="sr-only">
              Name
            </Label>
            <Input id="recipient-name" placeholder="Name" {...form.register("name")} />
            <FieldError message={form.formState.errors.name?.message} />
          </div>
          <div>
            <Label htmlFor="recipient-email" className="sr-only">
              Email
            </Label>
            <Input
              id="recipient-email"
              type="email"
              placeholder="Email"
              {...form.register("email")}
            />
            <FieldError message={form.formState.errors.email?.message} />
          </div>
          <Button
            type="submit"
            disabled={upsert.isPending}
            className="h-10 bg-espresso text-sand hover:bg-espresso/90"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add
          </Button>
        </form>
      </Card>

      <AdminList
        isLoading={isLoading}
        isEmpty={data.length === 0}
        error={error}
        emptyMessage="No recipients configured."
      >
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-clay/50">
            {data.map((recipient) => (
              <li key={recipient.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate font-semibold text-espresso">
                    {recipient.name}
                    {!recipient.active && <Badge variant="secondary">Paused</Badge>}
                  </p>
                  <p className="truncate text-xs text-espresso-muted">{recipient.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`active-${recipient.id}`}
                      checked={recipient.active}
                      onCheckedChange={(active) =>
                        patch.mutate(
                          { id: recipient.id, values: { active } },
                          { onError: (e) => toast.error(errorMessage(e)) },
                        )
                      }
                    />
                    <Label htmlFor={`active-${recipient.id}`} className="text-xs text-espresso-muted">
                      Active
                    </Label>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    aria-label={`Remove ${recipient.name}`}
                    onClick={() => confirm.request(recipient.id, recipient.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
              onSuccess: () => toast.success("Recipient removed"),
              onError: (e) => toast.error(errorMessage(e)),
            }),
          )
        }
        title={`Remove ${confirm.pending?.label ?? "recipient"}?`}
        description="Pause them instead if this is temporary."
        confirmText="Remove"
        variant="destructive"
        isLoading={remove.isPending}
      />
    </AdminLayout>
  );
};

export default AdminNotifications;
