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
import PublishFields, { topicsQuery } from "@/components/admin/editor/PublishFields";
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
import { useConfirm } from "@/hooks/admin/useConfirm";
import { orNull, slugify } from "@/features/admin/schemas";
import {
  articleSchema,
  jsonToSections,
  sectionsToJson,
  todayIso,
  type ArticleForm,
} from "@/features/admin/contentSchemas";

type Article = Row<"articles">;

const articlesQuery = adminListQuery("articles", [
  { column: "publish_date", ascending: false },
]);

/** Carried across from `Irvine Living Daily/src/routes/admin.articles.tsx`. */
const AdminArticles = () => {
  const { data = [], isLoading, error } = useQuery(articlesQuery);
  const { data: topics = [] } = useQuery(topicsQuery);
  const [editing, setEditing] = useState<Article | null>(null);
  const [open, setOpen] = useState(false);
  const remove = useAdminDelete("articles");
  const confirm = useConfirm();

  const topicName = (id: string | null) => topics.find((t) => t.id === id)?.name ?? null;

  return (
    <AdminLayout
      title="Articles"
      description="The written posts — market notes, guides and community pieces."
      actions={
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="bg-espresso text-sand hover:bg-espresso/90"
        >
          <Plus className="mr-2 h-4 w-4" /> New article
        </Button>
      }
    >
      <AdminList
        isLoading={isLoading}
        isEmpty={data.length === 0}
        error={error}
        emptyMessage="No articles yet."
      >
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-clay/50">
            {data.map((article) => (
              <ContentRow
                key={article.id}
                title={article.title}
                slug={article.slug}
                publishDate={article.publish_date}
                published={article.published}
                topicName={topicName(article.topic_id)}
                onEdit={() => {
                  setEditing(article);
                  setOpen(true);
                }}
                onDelete={() => confirm.request(article.id, article.title)}
              />
            ))}
          </ul>
        </Card>
      </AdminList>

      <ResourceDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit article" : "New article"}
      >
        <ArticleFields
          key={editing?.id ?? "new"}
          article={editing}
          onDone={() => setOpen(false)}
        />
      </ResourceDialog>

      <ConfirmDialog
        open={confirm.isOpen}
        onOpenChange={(v) => !v && confirm.dismiss()}
        onConfirm={() =>
          confirm.confirm((id) =>
            remove.mutate(id, {
              onSuccess: () => toast.success("Article deleted"),
              onError: (e) => toast.error(errorMessage(e)),
            }),
          )
        }
        title="Delete this article?"
        description={
          confirm.pending
            ? `“${confirm.pending.label}” and its URL go away permanently. Unpublish it instead to take it off the site but keep it.`
            : ""
        }
        confirmText="Delete"
        variant="destructive"
        isLoading={remove.isPending}
      />
    </AdminLayout>
  );
};

const ArticleFields = ({ article, onDone }: { article: Article | null; onDone: () => void }) => {
  const upsert = useAdminUpsert("articles");
  const form = useForm<ArticleForm>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      slug: article?.slug ?? "",
      title: article?.title ?? "",
      author: article?.author ?? "Good Tenants",
      publish_date: article?.publish_date ?? todayIso(),
      hero_image: article?.hero_image ?? "",
      summary: article?.summary ?? "",
      topic_id: article?.topic_id ?? "",
      tags: article?.tags ?? [],
      hashtags: article?.hashtags ?? [],
      sections: jsonToSections(article?.sections),
      published: article?.published ?? true,
      cta_label: article?.cta_label ?? "",
      cta_url: article?.cta_url ?? "",
      cta_responder: article?.cta_responder ?? "Good Tenants",
      social_caption_short: article?.social_caption_short ?? "",
      social_caption_long: article?.social_caption_long ?? "",
      meta_title: article?.meta_title ?? "",
      meta_description: article?.meta_description ?? "",
    },
  });

  const submit = form.handleSubmit((values) => {
    upsert.mutate(
      {
        id: article?.id,
        values: {
          slug: values.slug,
          title: values.title,
          author: values.author,
          publish_date: values.publish_date,
          hero_image: orNull(values.hero_image),
          summary: orNull(values.summary),
          topic_id: orNull(values.topic_id),
          tags: values.tags,
          hashtags: values.hashtags,
          sections: sectionsToJson(values.sections),
          published: values.published,
          cta_label: orNull(values.cta_label),
          cta_url: orNull(values.cta_url),
          cta_responder: orNull(values.cta_responder),
          social_caption_short: orNull(values.social_caption_short),
          social_caption_long: orNull(values.social_caption_long),
          meta_title: orNull(values.meta_title),
          meta_description: orNull(values.meta_description),
        },
      },
      {
        onSuccess: () => {
          toast.success(article ? "Article saved" : "Article created");
          onDone();
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      <EditorField label="Title" htmlFor="article-title" error={form.formState.errors.title?.message}>
        <Input
          id="article-title"
          {...form.register("title", {
            onChange: (e) => {
              if (!article && !form.formState.dirtyFields.slug) {
                form.setValue("slug", slugify(e.target.value));
              }
            },
          })}
        />
      </EditorField>

      <PublishFields form={form} />

      <EditorField label="Sections" htmlFor="article-sections">
        <SectionsEditor
          value={form.watch("sections")}
          onChange={(v) => form.setValue("sections", v)}
        />
      </EditorField>

      <EditorField label="Hashtags" htmlFor="article-hashtags">
        <TagInput
          id="article-hashtags"
          placeholder="irvine"
          value={form.watch("hashtags")}
          onChange={(v) => form.setValue("hashtags", v)}
        />
      </EditorField>

      <div className="grid gap-3 sm:grid-cols-2">
        <EditorField label="Social caption, short" htmlFor="article-social-short">
          <Textarea id="article-social-short" rows={2} {...form.register("social_caption_short")} />
        </EditorField>
        <EditorField label="Social caption, long" htmlFor="article-social-long">
          <Textarea id="article-social-long" rows={2} {...form.register("social_caption_long")} />
        </EditorField>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <EditorField
          label="Meta title"
          htmlFor="article-meta-title"
          hint="Falls back to the title."
        >
          <Input id="article-meta-title" {...form.register("meta_title")} />
        </EditorField>
        <EditorField
          label="Meta description"
          htmlFor="article-meta-description"
          hint="Falls back to the summary."
        >
          <Input id="article-meta-description" {...form.register("meta_description")} />
        </EditorField>
      </div>

      <Button
        type="submit"
        disabled={upsert.isPending}
        className="w-full bg-espresso text-sand hover:bg-espresso/90"
      >
        {upsert.isPending ? "Saving…" : "Save article"}
      </Button>
    </form>
  );
};

export default AdminArticles;
