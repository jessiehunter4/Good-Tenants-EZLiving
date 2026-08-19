import type { UseFormReturn, FieldValues, Path } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

import EditorField from "./EditorField";
import ImageInput from "./ImageInput";
import TagInput from "./TagInput";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminListQuery } from "@/hooks/admin/crud";

const NO_TOPIC = "__none__";

export const topicsQuery = adminListQuery("topics", [{ column: "name" }]);

/**
 * The fields every publishable thing has: where it lives, when it goes out, who
 * wrote it, what it is filed under, and where it sends the reader.
 *
 * Generic over the form so articles, questions and case studies share it
 * without three copies. Only fields present in all three live here.
 */
type PublishShape = {
  slug: string;
  author: string;
  publish_date: string;
  hero_image: string;
  summary: string;
  topic_id: string;
  tags: string[];
  published: boolean;
  cta_label: string;
  cta_url: string;
  cta_responder: string;
};

export function PublishFields<T extends FieldValues & PublishShape>({
  form,
  summaryLabel = "Summary",
}: {
  form: UseFormReturn<T>;
  summaryLabel?: string;
}) {
  const { data: topics = [] } = useQuery(topicsQuery);
  const field = (name: keyof PublishShape) => name as Path<T>;

  const errors = form.formState.errors as Record<string, { message?: string } | undefined>;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <EditorField label="Slug" htmlFor="content-slug" error={errors.slug?.message}>
          <Input id="content-slug" {...form.register(field("slug"))} />
        </EditorField>
        <EditorField
          label="Publish date"
          htmlFor="content-date"
          error={errors.publish_date?.message}
        >
          <Input id="content-date" type="date" {...form.register(field("publish_date"))} />
        </EditorField>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <EditorField label="Author" htmlFor="content-author" error={errors.author?.message}>
          <Input id="content-author" {...form.register(field("author"))} />
        </EditorField>
        <EditorField label="Topic" htmlFor="content-topic">
          <Select
            value={form.watch(field("topic_id")) || NO_TOPIC}
            onValueChange={(v) =>
              form.setValue(field("topic_id"), (v === NO_TOPIC ? "" : v) as T[Path<T>])
            }
          >
            <SelectTrigger id="content-topic">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_TOPIC}>No topic</SelectItem>
              {topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </EditorField>
      </div>

      <EditorField label="Hero image" htmlFor="content-hero">
        <ImageInput
          id="content-hero"
          value={form.watch(field("hero_image")) ?? ""}
          onChange={(v) => form.setValue(field("hero_image"), v as T[Path<T>])}
        />
      </EditorField>

      <EditorField label={summaryLabel} htmlFor="content-summary">
        <Textarea id="content-summary" rows={2} {...form.register(field("summary"))} />
      </EditorField>

      <EditorField label="Tags" htmlFor="content-tags">
        <TagInput
          id="content-tags"
          value={form.watch(field("tags")) ?? []}
          onChange={(v) => form.setValue(field("tags"), v as T[Path<T>])}
        />
      </EditorField>

      <div className="grid gap-3 sm:grid-cols-2">
        <EditorField label="CTA label" htmlFor="content-cta-label">
          <Input id="content-cta-label" {...form.register(field("cta_label"))} />
        </EditorField>
        <EditorField
          label="CTA URL"
          htmlFor="content-cta-url"
          hint="Leave blank to use the default for this post type."
        >
          <Input id="content-cta-url" {...form.register(field("cta_url"))} />
        </EditorField>
      </div>

      <EditorField
        label="CTA responder"
        htmlFor="content-cta-responder"
        hint="Whoever is named here has to be watching that inbox."
      >
        <Input id="content-cta-responder" {...form.register(field("cta_responder"))} />
      </EditorField>

      <div className="flex items-center gap-2">
        <Switch
          id="content-published"
          checked={form.watch(field("published")) ?? false}
          onCheckedChange={(v) => form.setValue(field("published"), v as T[Path<T>])}
        />
        <Label htmlFor="content-published">Published</Label>
      </div>
    </>
  );
}

export default PublishFields;
