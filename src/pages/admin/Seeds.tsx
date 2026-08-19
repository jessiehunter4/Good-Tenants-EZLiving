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
  orNull,
  seedSchema,
  type ContentSlot,
  type SeedForm,
} from "@/features/admin/schemas";
import { formatDate } from "@/features/daily/format";

type Seed = Row<"article_seeds">;

const seedsQuery = adminListQuery("article_seeds", [
  { column: "active", ascending: false },
  { column: "slot" },
  { column: "last_used_at", ascending: true },
]);

/**
 * Carried across from `Irvine Living Daily/src/routes/admin.seeds.tsx`.
 *
 * A seed is a reusable angle rather than a finished post: the four weekly slots
 * draw from here, oldest-used first, which is what stops the same idea being
 * written twice in a month.
 */
const AdminSeeds = () => {
  const { data = [], isLoading, error } = useQuery(seedsQuery);
  const [editing, setEditing] = useState<Seed | null>(null);
  const [open, setOpen] = useState(false);
  const remove = useAdminDelete("article_seeds");
  const confirm = useConfirm();

  return (
    <AdminLayout
      title="Article seeds"
      description="The idea bank the weekly batch draws from."
      actions={
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="bg-espresso text-sand hover:bg-espresso/90"
        >
          <Plus className="mr-2 h-4 w-4" /> New seed
        </Button>
      }
    >
      <AdminList
        isLoading={isLoading}
        isEmpty={data.length === 0}
        error={error}
        emptyMessage="No seeds yet — the weekly batch has nothing to draw from."
      >
        <div className="grid gap-3">
          {data.map((seed) => (
            <Card key={seed.id} className="flex items-start justify-between gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{seed.slot}</Badge>
                  {!seed.active && <Badge variant="outline">Retired</Badge>}
                  <span className="text-xs text-espresso-muted">
                    {seed.last_used_at ? `last used ${formatDate(seed.last_used_at)}` : "never used"}
                  </span>
                </div>
                <p className="mt-1 font-semibold text-espresso">{seed.title_angle}</p>
                {seed.notes && <p className="text-sm text-espresso-muted">{seed.notes}</p>}
              </div>
              <RowActions
                onEdit={() => {
                  setEditing(seed);
                  setOpen(true);
                }}
                onDelete={() => confirm.request(seed.id, seed.title_angle)}
                editLabel={`Edit ${seed.title_angle}`}
                deleteLabel={`Delete ${seed.title_angle}`}
              />
            </Card>
          ))}
        </div>
      </AdminList>

      <ResourceDialog open={open} onOpenChange={setOpen} title={editing ? "Edit seed" : "New seed"}>
        <SeedFields key={editing?.id ?? "new"} seed={editing} onDone={() => setOpen(false)} />
      </ResourceDialog>

      <ConfirmDialog
        open={confirm.isOpen}
        onOpenChange={(v) => !v && confirm.dismiss()}
        onConfirm={() =>
          confirm.confirm((id) =>
            remove.mutate(id, {
              onSuccess: () => toast.success("Seed deleted"),
              onError: (e) => toast.error(errorMessage(e)),
            }),
          )
        }
        title="Delete this seed?"
        description={
          confirm.pending
            ? `“${confirm.pending.label}” will no longer be available to the weekly batch. To keep it for reference, switch it to retired instead.`
            : ""
        }
        confirmText="Delete"
        variant="destructive"
        isLoading={remove.isPending}
      />
    </AdminLayout>
  );
};

const SeedFields = ({ seed, onDone }: { seed: Seed | null; onDone: () => void }) => {
  const upsert = useAdminUpsert("article_seeds");
  const form = useForm<SeedForm>({
    resolver: zodResolver(seedSchema),
    defaultValues: {
      slot: (seed?.slot as ContentSlot) ?? "market",
      title_angle: seed?.title_angle ?? "",
      visual_description: seed?.visual_description ?? "",
      citation: seed?.citation ?? "",
      notes: seed?.notes ?? "",
      active: seed?.active ?? true,
    },
  });

  const submit = form.handleSubmit((values) => {
    upsert.mutate(
      {
        id: seed?.id,
        values: {
          slot: values.slot,
          title_angle: values.title_angle,
          visual_description: orNull(values.visual_description),
          citation: orNull(values.citation),
          notes: orNull(values.notes),
          active: values.active,
        },
      },
      {
        onSuccess: () => {
          toast.success(seed ? "Seed updated" : "Seed created");
          onDone();
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  });

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <Label htmlFor="seed-slot">Slot</Label>
        <Select
          value={form.watch("slot")}
          onValueChange={(v) => form.setValue("slot", v as ContentSlot)}
        >
          <SelectTrigger id="seed-slot" className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CONTENT_SLOTS.map((slot) => (
              <SelectItem key={slot} value={slot}>
                {slot}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="seed-angle">Title angle</Label>
        <Textarea id="seed-angle" rows={2} {...form.register("title_angle")} className="mt-1.5" />
        <FieldError message={form.formState.errors.title_angle?.message} />
      </div>

      <div>
        <Label htmlFor="seed-visual">Visual description</Label>
        <Textarea
          id="seed-visual"
          rows={2}
          {...form.register("visual_description")}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="seed-citation">Citation</Label>
        <Input id="seed-citation" {...form.register("citation")} className="mt-1.5" />
      </div>

      <div>
        <Label htmlFor="seed-notes">Notes</Label>
        <Textarea id="seed-notes" rows={3} {...form.register("notes")} className="mt-1.5" />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="seed-active"
          checked={form.watch("active")}
          onCheckedChange={(v) => form.setValue("active", v)}
        />
        <Label htmlFor="seed-active">Available to the weekly batch</Label>
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

export default AdminSeeds;
