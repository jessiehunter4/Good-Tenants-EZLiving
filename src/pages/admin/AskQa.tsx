import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminList from "@/components/admin/AdminTable";
import ContentRow from "@/components/admin/ContentRow";
import ResourceDialog from "@/components/admin/ResourceDialog";
import EditorField from "@/components/admin/editor/EditorField";
import PublishFields from "@/components/admin/editor/PublishFields";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  adminListQuery,
  errorMessage,
  useAdminDelete,
  useAdminUpsert,
  type Row,
} from "@/hooks/admin/crud";
import { topicsQuery } from "@/hooks/admin/queries";
import { useConfirm } from "@/hooks/admin/useConfirm";
import { orNull, slugify } from "@/features/admin/schemas";
import { askQaSchema, todayIso, type AskQaForm } from "@/features/admin/contentSchemas";

type AskQa = Row<"ask_qa">;

const askQaQuery = adminListQuery("ask_qa", [{ column: "publish_date", ascending: false }]);

/**
 * Carried across from `Irvine Living Daily/src/routes/admin.ask.tsx`.
 *
 * The daily's version had a generate-an-answer button backed by a model. That
 * needs a server runtime to hold the key, so it did not come across; the
 * answer is written here, from the question sitting in the inbox.
 */
const AdminAskQa = () => {
  const { data = [], isLoading, error } = useQuery(askQaQuery);
  const { data: topics = [] } = useQuery(topicsQuery);
  const [editing, setEditing] = useState<AskQa | null>(null);
  const [open, setOpen] = useState(false);
  const remove = useAdminDelete("ask_qa");
  const confirm = useConfirm();

  return (
    <AdminLayout
      title="Ask Q&A"
      description="Published answers to what readers asked."
      actions={
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="bg-espresso text-sand hover:bg-espresso/90"
        >
          <Plus className="mr-2 h-4 w-4" /> New answer
        </Button>
      }
    >
      <AdminList
        isLoading={isLoading}
        isEmpty={data.length === 0}
        error={error}
        emptyMessage="Nothing answered yet."
      >
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-clay/50">
            {data.map((qa) => (
              <ContentRow
                key={qa.id}
                title={qa.question}
                slug={qa.slug}
                publishDate={qa.publish_date}
                published={qa.published}
                topicName={topics.find((t) => t.id === qa.topic_id)?.name ?? null}
                onEdit={() => {
                  setEditing(qa);
                  setOpen(true);
                }}
                onDelete={() => confirm.request(qa.id, qa.question)}
              />
            ))}
          </ul>
        </Card>
      </AdminList>

      <ResourceDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit answer" : "New answer"}
      >
        <AskQaFields key={editing?.id ?? "new"} qa={editing} onDone={() => setOpen(false)} />
      </ResourceDialog>

      <ConfirmDialog
        open={confirm.isOpen}
        onOpenChange={(v) => !v && confirm.dismiss()}
        onConfirm={() =>
          confirm.confirm((id) =>
            remove.mutate(id, {
              onSuccess: () => toast.success("Answer deleted"),
              onError: (e) => toast.error(errorMessage(e)),
            }),
          )
        }
        title="Delete this answer?"
        description={
          confirm.pending
            ? `“${confirm.pending.label}” and its URL go away permanently. Unpublish it instead to keep it.`
            : ""
        }
        confirmText="Delete"
        variant="destructive"
        isLoading={remove.isPending}
      />
    </AdminLayout>
  );
};

const AskQaFields = ({ qa, onDone }: { qa: AskQa | null; onDone: () => void }) => {
  const upsert = useAdminUpsert("ask_qa");
  const form = useForm<AskQaForm>({
    resolver: zodResolver(askQaSchema),
    defaultValues: {
      slug: qa?.slug ?? "",
      question: qa?.question ?? "",
      author: qa?.author ?? "Good Tenants",
      publish_date: qa?.publish_date ?? todayIso(),
      hero_image: qa?.hero_image ?? "",
      summary: "",
      topic_id: qa?.topic_id ?? "",
      tags: qa?.tags ?? [],
      published: qa?.published ?? true,
      short_answer: qa?.short_answer ?? "",
      full_answer: qa?.full_answer ?? "",
      cta_label: qa?.cta_label ?? "",
      cta_url: qa?.cta_url ?? "",
      cta_responder: qa?.cta_responder ?? "Good Tenants",
      meta_title: qa?.meta_title ?? "",
      meta_description: qa?.meta_description ?? "",
    },
  });

  const submit = form.handleSubmit((values) => {
    upsert.mutate(
      {
        id: qa?.id,
        values: {
          slug: values.slug,
          question: values.question,
          author: values.author,
          publish_date: values.publish_date,
          hero_image: orNull(values.hero_image),
          topic_id: orNull(values.topic_id),
          tags: values.tags,
          published: values.published,
          short_answer: orNull(values.short_answer),
          full_answer: orNull(values.full_answer),
          cta_label: orNull(values.cta_label),
          cta_url: orNull(values.cta_url),
          cta_responder: orNull(values.cta_responder),
          meta_title: orNull(values.meta_title),
          meta_description: orNull(values.meta_description),
        },
      },
      {
        onSuccess: () => {
          toast.success(qa ? "Answer saved" : "Answer created");
          onDone();
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      <EditorField
        label="Question"
        htmlFor="qa-question"
        error={form.formState.errors.question?.message}
      >
        <Textarea
          id="qa-question"
          rows={2}
          {...form.register("question", {
            onChange: (e) => {
              if (!qa && !form.formState.dirtyFields.slug) {
                form.setValue("slug", slugify(e.target.value));
              }
            },
          })}
        />
      </EditorField>

      <EditorField
        label="Short answer"
        htmlFor="qa-short"
        hint="The one the reader sees first, and the one used as the summary."
      >
        <Textarea id="qa-short" rows={3} {...form.register("short_answer")} />
      </EditorField>

      <EditorField label="The longer version" htmlFor="qa-full">
        <Textarea id="qa-full" rows={8} {...form.register("full_answer")} />
      </EditorField>

      <PublishFields form={form} showSummary={false} />

      <div className="grid gap-3 sm:grid-cols-2">
        <EditorField label="Meta title" htmlFor="qa-meta-title" hint="Falls back to the question.">
          <Input id="qa-meta-title" {...form.register("meta_title")} />
        </EditorField>
        <EditorField
          label="Meta description"
          htmlFor="qa-meta-description"
          hint="Falls back to the short answer."
        >
          <Input id="qa-meta-description" {...form.register("meta_description")} />
        </EditorField>
      </div>

      <Button
        type="submit"
        disabled={upsert.isPending}
        className="w-full bg-espresso text-sand hover:bg-espresso/90"
      >
        {upsert.isPending ? "Saving…" : "Save answer"}
      </Button>
    </form>
  );
};

export default AdminAskQa;
