import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminList from "@/components/admin/AdminTable";
import ResourceDialog from "@/components/admin/ResourceDialog";
import FieldError from "@/components/admin/FieldError";
import RowActions from "@/components/admin/RowActions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  adminListQuery,
  errorMessage,
  useAdminDelete,
  useAdminUpsert,
  type Row,
} from "@/hooks/admin/crud";
import { useConfirm } from "@/hooks/admin/useConfirm";
import { orNull, slugify, topicSchema, type TopicForm } from "@/features/admin/schemas";

type Topic = Row<"topics">;

const topicsQuery = adminListQuery("topics", [{ column: "name" }]);

/** Carried across from `Irvine Living Daily/src/routes/admin.topics.tsx`. */
const AdminTopics = () => {
  const { data = [], isLoading, error } = useQuery(topicsQuery);
  const [editing, setEditing] = useState<Topic | null>(null);
  const [open, setOpen] = useState(false);

  const remove = useAdminDelete("topics");
  const confirm = useConfirm();

  const startCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const startEdit = (topic: Topic) => {
    setEditing(topic);
    setOpen(true);
  };

  return (
    <AdminLayout
      title="Topics"
      description="The lanes every post is filed under."
      actions={
        <Button onClick={startCreate} className="bg-espresso text-sand hover:bg-espresso/90">
          <Plus className="mr-2 h-4 w-4" /> New topic
        </Button>
      }
    >
      <AdminList
        isLoading={isLoading}
        isEmpty={data.length === 0}
        error={error}
        emptyMessage="No topics yet."
      >
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-clay/50">
            {data.map((topic) => (
              <li key={topic.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-espresso">{topic.name}</p>
                  <p className="truncate text-xs text-espresso-muted">/{topic.slug}</p>
                </div>
                <RowActions
                  onEdit={() => startEdit(topic)}
                  onDelete={() => confirm.request(topic.id, topic.name)}
                  editLabel={`Edit ${topic.name}`}
                  deleteLabel={`Delete ${topic.name}`}
                />
              </li>
            ))}
          </ul>
        </Card>
      </AdminList>

      <ResourceDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit topic" : "New topic"}
      >
        <TopicFields key={editing?.id ?? "new"} topic={editing} onDone={() => setOpen(false)} />
      </ResourceDialog>

      <ConfirmDialog
        open={confirm.isOpen}
        onOpenChange={(v) => !v && confirm.dismiss()}
        onConfirm={() =>
          confirm.confirm((id) =>
            remove.mutate(id, {
              onSuccess: () => toast.success("Topic deleted"),
              onError: (e) => toast.error(errorMessage(e)),
            }),
          )
        }
        title={`Delete ${confirm.pending?.label ?? "topic"}?`}
        description="Posts filed under it keep their content but lose the topic. This cannot be undone."
        confirmText="Delete"
        variant="destructive"
        isLoading={remove.isPending}
      />
    </AdminLayout>
  );
};

const TopicFields = ({ topic, onDone }: { topic: Topic | null; onDone: () => void }) => {
  const upsert = useAdminUpsert("topics");
  const form = useForm<TopicForm>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      name: topic?.name ?? "",
      slug: topic?.slug ?? "",
      description: topic?.description ?? "",
      hero_image: topic?.hero_image ?? "",
    },
  });

  const submit = form.handleSubmit((values) => {
    upsert.mutate(
      {
        id: topic?.id,
        values: {
          name: values.name,
          slug: values.slug,
          description: orNull(values.description),
          hero_image: orNull(values.hero_image),
        },
      },
      {
        onSuccess: () => {
          toast.success(topic ? "Topic updated" : "Topic created");
          onDone();
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  });

  // A new topic gets its slug from its name until someone types one; editing an
  // existing topic never rewrites the slug, because the slug is a live URL.
  const syncSlug = (name: string) => {
    if (!topic && !form.formState.dirtyFields.slug) {
      form.setValue("slug", slugify(name));
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <Label htmlFor="topic-name">Name</Label>
        <Input
          id="topic-name"
          {...form.register("name", { onChange: (e) => syncSlug(e.target.value) })}
          className="mt-1.5"
        />
        <FieldError message={form.formState.errors.name?.message} />
      </div>

      <div>
        <Label htmlFor="topic-slug">Slug</Label>
        <Input id="topic-slug" {...form.register("slug")} className="mt-1.5" />
        <FieldError message={form.formState.errors.slug?.message} />
      </div>

      <div>
        <Label htmlFor="topic-description">Description</Label>
        <Textarea id="topic-description" rows={3} {...form.register("description")} className="mt-1.5" />
      </div>

      <div>
        <Label htmlFor="topic-hero">Hero image key or URL</Label>
        <Input id="topic-hero" {...form.register("hero_image")} className="mt-1.5" />
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

export default AdminTopics;
