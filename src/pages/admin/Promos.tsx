import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminList from "@/components/admin/AdminTable";
import FieldError from "@/components/admin/FieldError";
import ResourceDialog from "@/components/admin/ResourceDialog";
import RowActions from "@/components/admin/RowActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  adminListQuery,
  errorMessage,
  useAdminDelete,
  useAdminUpsert,
  type Row,
} from "@/hooks/admin/crud";
import { useConfirm } from "@/hooks/admin/useConfirm";
import { orNull, promoSchema, type PromoForm } from "@/features/admin/schemas";

type Promo = Row<"sidebar_promos">;

const promosQuery = adminListQuery("sidebar_promos", [{ column: "priority" }]);

/** Carried across from `Irvine Living Daily/src/routes/admin.promos.tsx`. */
const AdminPromos = () => {
  const { data = [], isLoading, error } = useQuery(promosQuery);
  const [editing, setEditing] = useState<Promo | null>(null);
  const [open, setOpen] = useState(false);
  const remove = useAdminDelete("sidebar_promos");
  const confirm = useConfirm();

  return (
    <AdminLayout
      title="Sidebar promos"
      description="The cards beside every post. Lowest priority shows first."
      actions={
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="bg-espresso text-sand hover:bg-espresso/90"
        >
          <Plus className="mr-2 h-4 w-4" /> New promo
        </Button>
      }
    >
      <AdminList
        isLoading={isLoading}
        isEmpty={data.length === 0}
        error={error}
        emptyMessage="No promos yet."
      >
        <div className="grid gap-3">
          {data.map((promo) => (
            <Card key={promo.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-espresso">{promo.title}</p>
                  {promo.accent && <Badge>Accent</Badge>}
                  {!promo.active && <Badge variant="secondary">Inactive</Badge>}
                  <span className="text-xs text-espresso-muted">priority {promo.priority}</span>
                </div>
                {promo.short_copy && (
                  <p className="truncate text-sm text-espresso-muted">{promo.short_copy}</p>
                )}
              </div>
              <RowActions
                onEdit={() => {
                  setEditing(promo);
                  setOpen(true);
                }}
                onDelete={() => confirm.request(promo.id, promo.title)}
                editLabel={`Edit ${promo.title}`}
                deleteLabel={`Delete ${promo.title}`}
              />
            </Card>
          ))}
        </div>
      </AdminList>

      <ResourceDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit promo" : "New promo"}
      >
        <PromoFields key={editing?.id ?? "new"} promo={editing} onDone={() => setOpen(false)} />
      </ResourceDialog>

      <ConfirmDialog
        open={confirm.isOpen}
        onOpenChange={(v) => !v && confirm.dismiss()}
        onConfirm={() =>
          confirm.confirm((id) =>
            remove.mutate(id, {
              onSuccess: () => toast.success("Promo deleted"),
              onError: (e) => toast.error(errorMessage(e)),
            }),
          )
        }
        title={`Delete ${confirm.pending?.label ?? "promo"}?`}
        description="It disappears from every post's sidebar immediately."
        confirmText="Delete"
        variant="destructive"
        isLoading={remove.isPending}
      />
    </AdminLayout>
  );
};

const PromoFields = ({ promo, onDone }: { promo: Promo | null; onDone: () => void }) => {
  const upsert = useAdminUpsert("sidebar_promos");
  const form = useForm<PromoForm>({
    resolver: zodResolver(promoSchema),
    defaultValues: {
      title: promo?.title ?? "",
      short_copy: promo?.short_copy ?? "",
      image: promo?.image ?? "",
      button_label: promo?.button_label ?? "",
      button_url: promo?.button_url ?? "",
      priority: promo?.priority ?? 0,
      accent: promo?.accent ?? false,
      active: promo?.active ?? true,
    },
  });

  const submit = form.handleSubmit((values) => {
    upsert.mutate(
      {
        id: promo?.id,
        values: {
          title: values.title,
          short_copy: orNull(values.short_copy),
          image: orNull(values.image),
          button_label: orNull(values.button_label),
          button_url: orNull(values.button_url),
          priority: values.priority,
          accent: values.accent,
          active: values.active,
        },
      },
      {
        onSuccess: () => {
          toast.success(promo ? "Promo updated" : "Promo created");
          onDone();
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  });

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <Label htmlFor="promo-title">Title</Label>
        <Input id="promo-title" {...form.register("title")} className="mt-1.5" />
        <FieldError message={form.formState.errors.title?.message} />
      </div>

      <div>
        <Label htmlFor="promo-copy">Short copy</Label>
        <Textarea id="promo-copy" rows={2} {...form.register("short_copy")} className="mt-1.5" />
      </div>

      <div>
        <Label htmlFor="promo-image">Image key or URL</Label>
        <Input id="promo-image" {...form.register("image")} className="mt-1.5" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="promo-button">Button label</Label>
          <Input id="promo-button" {...form.register("button_label")} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="promo-url">Button URL</Label>
          <Input id="promo-url" {...form.register("button_url")} className="mt-1.5" />
        </div>
      </div>

      <div className="grid grid-cols-3 items-end gap-3">
        <div>
          <Label htmlFor="promo-priority">Priority</Label>
          <Input
            id="promo-priority"
            type="number"
            {...form.register("priority")}
            className="mt-1.5"
          />
        </div>
        <ToggleField
          id="promo-accent"
          label="Accent"
          checked={form.watch("accent")}
          onChange={(v) => form.setValue("accent", v)}
        />
        <ToggleField
          id="promo-active"
          label="Active"
          checked={form.watch("active")}
          onChange={(v) => form.setValue("active", v)}
        />
      </div>

      <Button
        type="submit"
        disabled={upsert.isPending}
        className="w-full bg-espresso text-sand hover:bg-espresso/90"
      >
        {upsert.isPending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
};

const ToggleField = ({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) => (
  <div className="flex items-center gap-2 pb-2">
    <Switch id={id} checked={checked} onCheckedChange={onChange} />
    <Label htmlFor={id}>{label}</Label>
  </div>
);

export default AdminPromos;
