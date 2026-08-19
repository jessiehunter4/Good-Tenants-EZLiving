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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  CONTENT_SLOTS,
  CTA_KINDS,
  ctaSchema,
  orNull,
  type ContentSlot,
  type CtaForm,
  type CtaKind,
} from "@/features/admin/schemas";

type Cta = Row<"cta_destinations">;

const NO_SLOT = "__none__";

const ctasQuery = adminListQuery("cta_destinations", [
  { column: "active", ascending: false },
  { column: "kind" },
  { column: "label" },
]);

/**
 * Carried across from `Irvine Living Daily/src/routes/admin.ctas.tsx`.
 *
 * Every post ends in a call to action, and every call to action names who
 * answers it. This is that library — the reason a post can say "the Jessie
 * Hunter Team will reply" and have it be true.
 */
const AdminCtas = () => {
  const { data = [], isLoading, error } = useQuery(ctasQuery);
  const [editing, setEditing] = useState<Cta | null>(null);
  const [open, setOpen] = useState(false);
  const remove = useAdminDelete("cta_destinations");
  const confirm = useConfirm();

  return (
    <AdminLayout
      title="CTA library"
      description="Where posts send readers, and who answers when they arrive."
      actions={
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="bg-espresso text-sand hover:bg-espresso/90"
        >
          <Plus className="mr-2 h-4 w-4" /> New CTA
        </Button>
      }
    >
      <AdminList
        isLoading={isLoading}
        isEmpty={data.length === 0}
        error={error}
        emptyMessage="No CTAs yet."
      >
        <div className="grid gap-3">
          {data.map((cta) => (
            <Card key={cta.id} className="flex items-start justify-between gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-espresso">{cta.label}</p>
                  <Badge variant="secondary">{cta.kind}</Badge>
                  {cta.default_for_slot && <Badge>default for {cta.default_for_slot}</Badge>}
                  {!cta.active && <Badge variant="outline">Inactive</Badge>}
                </div>
                <p className="truncate text-xs text-espresso-muted">
                  {cta.slug} · {cta.url}
                </p>
                <p className="mt-1 text-xs text-espresso-muted">Answered by {cta.responder}</p>
              </div>
              <RowActions
                onEdit={() => {
                  setEditing(cta);
                  setOpen(true);
                }}
                onDelete={() => confirm.request(cta.id, cta.label)}
                editLabel={`Edit ${cta.label}`}
                deleteLabel={`Delete ${cta.label}`}
              />
            </Card>
          ))}
        </div>
      </AdminList>

      <ResourceDialog open={open} onOpenChange={setOpen} title={editing ? "Edit CTA" : "New CTA"}>
        <CtaFields key={editing?.id ?? "new"} cta={editing} onDone={() => setOpen(false)} />
      </ResourceDialog>

      <ConfirmDialog
        open={confirm.isOpen}
        onOpenChange={(v) => !v && confirm.dismiss()}
        onConfirm={() =>
          confirm.confirm((id) =>
            remove.mutate(id, {
              onSuccess: () => toast.success("CTA deleted"),
              onError: (e) => toast.error(errorMessage(e)),
            }),
          )
        }
        title={`Delete ${confirm.pending?.label ?? "CTA"}?`}
        description="Posts pointing at it fall back to the default destination for their type."
        confirmText="Delete"
        variant="destructive"
        isLoading={remove.isPending}
      />
    </AdminLayout>
  );
};

const CtaFields = ({ cta, onDone }: { cta: Cta | null; onDone: () => void }) => {
  const upsert = useAdminUpsert("cta_destinations");
  const form = useForm<CtaForm>({
    resolver: zodResolver(ctaSchema),
    defaultValues: {
      slug: cta?.slug ?? "",
      label: cta?.label ?? "",
      kind: (cta?.kind as CtaKind) ?? "lead_form",
      url: cta?.url ?? "",
      responder: cta?.responder ?? "Jessie Hunter Team / Good Tenants",
      description: cta?.description ?? "",
      button_text: cta?.button_text ?? "",
      default_for_slot: (cta?.default_for_slot as ContentSlot | null) ?? null,
      active: cta?.active ?? true,
    },
  });

  const submit = form.handleSubmit((values) => {
    upsert.mutate(
      {
        id: cta?.id,
        values: {
          slug: values.slug,
          label: values.label,
          kind: values.kind,
          url: values.url,
          responder: values.responder,
          description: orNull(values.description),
          button_text: orNull(values.button_text),
          default_for_slot: values.default_for_slot,
          active: values.active,
        },
      },
      {
        onSuccess: () => {
          toast.success(cta ? "CTA updated" : "CTA created");
          onDone();
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  });

  const slot = form.watch("default_for_slot");

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="cta-slug">Slug</Label>
          <Input id="cta-slug" {...form.register("slug")} className="mt-1.5" />
          <FieldError message={form.formState.errors.slug?.message} />
        </div>
        <div>
          <Label htmlFor="cta-kind">Kind</Label>
          <Select
            value={form.watch("kind")}
            onValueChange={(v) => form.setValue("kind", v as CtaKind)}
          >
            <SelectTrigger id="cta-kind" className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CTA_KINDS.map((kind) => (
                <SelectItem key={kind} value={kind}>
                  {kind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="cta-label">Label</Label>
        <Input id="cta-label" {...form.register("label")} className="mt-1.5" />
        <FieldError message={form.formState.errors.label?.message} />
      </div>

      <div>
        <Label htmlFor="cta-url">URL</Label>
        <Input id="cta-url" {...form.register("url")} className="mt-1.5" />
        <FieldError message={form.formState.errors.url?.message} />
      </div>

      <div>
        <Label htmlFor="cta-responder">Responder</Label>
        <Input id="cta-responder" {...form.register("responder")} className="mt-1.5" />
        <p className="mt-1 text-xs text-espresso-muted">
          Shown to the reader. Whoever is named here has to be watching that inbox.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="cta-button">Button text</Label>
          <Input id="cta-button" {...form.register("button_text")} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="cta-slot">Default for slot</Label>
          <Select
            value={slot ?? NO_SLOT}
            onValueChange={(v) =>
              form.setValue("default_for_slot", v === NO_SLOT ? null : (v as ContentSlot))
            }
          >
            <SelectTrigger id="cta-slot" className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_SLOT}>None</SelectItem>
              {CONTENT_SLOTS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="cta-description">Description</Label>
        <Textarea id="cta-description" rows={2} {...form.register("description")} className="mt-1.5" />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="cta-active"
          checked={form.watch("active")}
          onCheckedChange={(v) => form.setValue("active", v)}
        />
        <Label htmlFor="cta-active">Active</Label>
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

export default AdminCtas;
