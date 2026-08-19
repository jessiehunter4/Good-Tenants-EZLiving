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
import SectionsEditor from "@/components/admin/editor/SectionsEditor";
import TagInput from "@/components/admin/editor/TagInput";
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
import {
  caseStudySchema,
  jsonToSections,
  sectionsToJson,
  todayIso,
  type CaseStudyForm,
} from "@/features/admin/contentSchemas";

type CaseStudy = Row<"case_studies">;

const caseStudiesQuery = adminListQuery("case_studies", [
  { column: "publish_date", ascending: false },
]);

/** Carried across from `Irvine Living Daily/src/routes/admin.case-studies.tsx`. */
const AdminCaseStudies = () => {
  const { data = [], isLoading, error } = useQuery(caseStudiesQuery);
  const { data: topics = [] } = useQuery(topicsQuery);
  const [editing, setEditing] = useState<CaseStudy | null>(null);
  const [open, setOpen] = useState(false);
  const remove = useAdminDelete("case_studies");
  const confirm = useConfirm();

  return (
    <AdminLayout
      title="Case studies"
      description="Real relocations and leases, start to finish."
      actions={
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="bg-espresso text-sand hover:bg-espresso/90"
        >
          <Plus className="mr-2 h-4 w-4" /> New case study
        </Button>
      }
    >
      <AdminList
        isLoading={isLoading}
        isEmpty={data.length === 0}
        error={error}
        emptyMessage="No case studies yet."
      >
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-clay/50">
            {data.map((study) => (
              <ContentRow
                key={study.id}
                title={study.headline}
                slug={study.slug}
                publishDate={study.publish_date}
                published={study.published}
                topicName={topics.find((t) => t.id === study.topic_id)?.name ?? null}
                onEdit={() => {
                  setEditing(study);
                  setOpen(true);
                }}
                onDelete={() => confirm.request(study.id, study.headline)}
              />
            ))}
          </ul>
        </Card>
      </AdminList>

      <ResourceDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit case study" : "New case study"}
      >
        <CaseStudyFields
          key={editing?.id ?? "new"}
          study={editing}
          onDone={() => setOpen(false)}
        />
      </ResourceDialog>

      <ConfirmDialog
        open={confirm.isOpen}
        onOpenChange={(v) => !v && confirm.dismiss()}
        onConfirm={() =>
          confirm.confirm((id) =>
            remove.mutate(id, {
              onSuccess: () => toast.success("Case study deleted"),
              onError: (e) => toast.error(errorMessage(e)),
            }),
          )
        }
        title="Delete this case study?"
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

const CaseStudyFields = ({
  study,
  onDone,
}: {
  study: CaseStudy | null;
  onDone: () => void;
}) => {
  const upsert = useAdminUpsert("case_studies");
  const form = useForm<CaseStudyForm>({
    resolver: zodResolver(caseStudySchema),
    defaultValues: {
      slug: study?.slug ?? "",
      headline: study?.headline ?? "",
      author: study?.author ?? "Good Tenants",
      publish_date: study?.publish_date ?? todayIso(),
      hero_image: study?.hero_image ?? "",
      summary: study?.summary ?? "",
      topic_id: study?.topic_id ?? "",
      tags: study?.tags ?? [],
      hashtags: study?.hashtags ?? [],
      steps: jsonToSections(study?.steps),
      outcomes: study?.outcomes ?? "",
      published: study?.published ?? true,
      cta_label: study?.cta_label ?? "",
      cta_url: study?.cta_url ?? "",
      cta_responder: study?.cta_responder ?? "Good Tenants",
      social_caption_short: study?.social_caption_short ?? "",
      social_caption_long: study?.social_caption_long ?? "",
    },
  });

  const submit = form.handleSubmit((values) => {
    upsert.mutate(
      {
        id: study?.id,
        values: {
          slug: values.slug,
          headline: values.headline,
          author: values.author,
          publish_date: values.publish_date,
          hero_image: orNull(values.hero_image),
          summary: orNull(values.summary),
          topic_id: orNull(values.topic_id),
          tags: values.tags,
          hashtags: values.hashtags,
          steps: sectionsToJson(values.steps),
          outcomes: orNull(values.outcomes),
          published: values.published,
          cta_label: orNull(values.cta_label),
          cta_url: orNull(values.cta_url),
          cta_responder: orNull(values.cta_responder),
          social_caption_short: orNull(values.social_caption_short),
          social_caption_long: orNull(values.social_caption_long),
        },
      },
      {
        onSuccess: () => {
          toast.success(study ? "Case study saved" : "Case study created");
          onDone();
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      <EditorField
        label="Headline"
        htmlFor="case-headline"
        error={form.formState.errors.headline?.message}
      >
        <Input
          id="case-headline"
          {...form.register("headline", {
            onChange: (e) => {
              if (!study && !form.formState.dirtyFields.slug) {
                form.setValue("slug", slugify(e.target.value));
              }
            },
          })}
        />
      </EditorField>

      <PublishFields form={form} summaryLabel="The brief" />

      <EditorField
        label="Steps"
        htmlFor="case-steps"
        hint="What happened, in order. These render between the brief and the outcomes."
      >
        <SectionsEditor value={form.watch("steps")} onChange={(v) => form.setValue("steps", v)} />
      </EditorField>

      <EditorField label="Outcomes" htmlFor="case-outcomes">
        <Textarea id="case-outcomes" rows={3} {...form.register("outcomes")} />
      </EditorField>

      <EditorField label="Hashtags" htmlFor="case-hashtags">
        <TagInput
          id="case-hashtags"
          placeholder="irvine"
          value={form.watch("hashtags")}
          onChange={(v) => form.setValue("hashtags", v)}
        />
      </EditorField>

      <div className="grid gap-3 sm:grid-cols-2">
        <EditorField label="Social caption, short" htmlFor="case-social-short">
          <Textarea id="case-social-short" rows={2} {...form.register("social_caption_short")} />
        </EditorField>
        <EditorField label="Social caption, long" htmlFor="case-social-long">
          <Textarea id="case-social-long" rows={2} {...form.register("social_caption_long")} />
        </EditorField>
      </div>

      <Button
        type="submit"
        disabled={upsert.isPending}
        className="w-full bg-espresso text-sand hover:bg-espresso/90"
      >
        {upsert.isPending ? "Saving…" : "Save case study"}
      </Button>
    </form>
  );
};

export default AdminCaseStudies;
