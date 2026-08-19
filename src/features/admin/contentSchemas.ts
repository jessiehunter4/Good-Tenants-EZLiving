import { z } from "zod";
import { slugField } from "./schemas";
import type { Json } from "@/integrations/supabase/types";
import type { Section } from "@/features/daily/post";

/**
 * The three things the daily publishes by hand: an article, an answered
 * question, and a case study. Rental drops are written from the feed rather
 * than typed, so they have their own screen.
 *
 * Carried across from the daily's editor routes. Required fields are the ones
 * the table declares NOT NULL — everything else is optional here and nullable
 * there, so a half-finished draft can still be saved.
 */
const text = (max: number) => z.string().trim().max(max);

const sectionSchema = z.object({
  id: z.string(),
  heading: z.string(),
  body: z.string(),
});

const publishFields = {
  slug: slugField,
  author: z.string().trim().min(1, "An author is required").max(120),
  publish_date: z.string().min(1, "A publish date is required"),
  hero_image: text(2048),
  summary: text(2000),
  topic_id: z.string(),
  tags: z.array(z.string()),
  published: z.boolean(),
  cta_label: text(200),
  cta_url: text(2048),
  cta_responder: text(200),
};

export const articleSchema = z.object({
  ...publishFields,
  title: z.string().trim().min(1, "A title is required").max(300),
  sections: z.array(sectionSchema),
  hashtags: z.array(z.string()),
  social_caption_short: text(1000),
  social_caption_long: text(4000),
  meta_title: text(200),
  meta_description: text(400),
});
export type ArticleForm = z.infer<typeof articleSchema>;

export const askQaSchema = z.object({
  ...publishFields,
  question: z.string().trim().min(1, "A question is required").max(500),
  short_answer: text(2000),
  full_answer: text(20000),
  meta_title: text(200),
  meta_description: text(400),
});
export type AskQaForm = z.infer<typeof askQaSchema>;

export const caseStudySchema = z.object({
  ...publishFields,
  headline: z.string().trim().min(1, "A headline is required").max(300),
  steps: z.array(sectionSchema),
  outcomes: text(4000),
  hashtags: z.array(z.string()),
  social_caption_short: text(1000),
  social_caption_long: text(4000),
});
export type CaseStudyForm = z.infer<typeof caseStudySchema>;

/** Today, as the `date` column wants it — local, so it matches the editor's day. */
export function todayIso(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * Sections are stored in a jsonb column. They are plain string records, so the
 * conversion is safe; TypeScript needs to be told once rather than at every
 * save site.
 */
export function sectionsToJson(sections: Section[]): Json {
  return sections as unknown as Json;
}

export function jsonToSections(value: unknown): Section[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
    .map((s, i) => ({
      id: String(s.id ?? `section-${i + 1}`),
      heading: String(s.heading ?? ""),
      body: String(s.body ?? ""),
    }));
}
