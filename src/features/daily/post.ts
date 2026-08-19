// Carried across from `Irvine Living Daily/src/lib/post-adapter.ts`.
//
// The daily publishes four different things — articles, rental drops, answered
// questions and case studies — from four tables with four different column
// vocabularies. Every screen that lists or renders them works on one shape, so
// the difference is absorbed here, once, in pure functions.
import { resolveImage } from "./images";
import { resolveCta, type ResolvedCta } from "./cta";

export type PostType = "article" | "qa" | "case-study" | "property";

export type Section = { id: string; heading: string; body: string };

export type UiPost = {
  slug: string;
  type: PostType;
  title: string;
  summary: string;
  heroImage: string;
  topicName: string;
  topicSlug: string;
  tags: string[];
  author: string;
  date: string;
  sections: Section[];
  cta: ResolvedCta;
  listingUrl?: string;
  readMinutes: number;
  socialCaptionShort?: string | null;
  socialCaptionLong?: string | null;
  hashtags: string[];
  ctaResponder: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  noindex?: boolean;
  schemaJsonLd?: Record<string, unknown> | null;
  citation?: string | null;
};

const WORDS_PER_MINUTE = 220;

function toSections(value: unknown): Section[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
    .map((s, i) => ({
      id: String(s.id ?? `s-${i}`),
      heading: String(s.heading ?? ""),
      body: String(s.body ?? ""),
    }));
}

function computeReadMinutes(sections: Section[], stored?: number | null): number {
  if (stored && stored > 0) return stored;
  const words = sections.reduce(
    (n, s) => n + (s.body || "").split(/\s+/).filter(Boolean).length,
    0,
  );
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

type TopicRef = { slug: string; name: string } | null | undefined;

function topicFields(t: TopicRef, fallback: { name: string; slug: string }) {
  return { topicName: t?.name ?? fallback.name, topicSlug: t?.slug ?? fallback.slug };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

// Row shapes are declared here rather than derived from the generated database
// types: these are the columns the four SELECTs actually ask for, and a screen
// should break at compile time when one of them stops being fetched.
export type ArticleRow = {
  slug: string; title: string; hero_image: string | null; author: string;
  publish_date: string; summary: string | null; sections: unknown; tags: string[] | null;
  read_time_minutes: number | null; cta_label: string | null; cta_url: string | null;
  cta_responder: string | null; social_caption_short: string | null;
  social_caption_long: string | null; hashtags: string[] | null;
  meta_title?: string | null; meta_description?: string | null;
  og_image?: string | null; og_title?: string | null; og_description?: string | null;
  canonical_url?: string | null; noindex?: boolean | null;
  schema_jsonld?: unknown; citation?: string | null;
  topic: TopicRef;
};

export type PropertyRow = {
  slug: string; headline: string; hero_image: string | null; author: string;
  publish_date: string; summary: string | null; sections: unknown; tags: string[] | null;
  cta_label: string | null; cta_responder: string | null;
  cshr_listing_url: string; social_caption_short: string | null;
  social_caption_long: string | null; hashtags: string[] | null;
  topic: TopicRef;
};

export type AskQaRow = {
  slug: string; question: string; hero_image: string | null; author: string;
  publish_date: string; short_answer: string | null; full_answer: string | null;
  tags: string[] | null; topic: TopicRef;
  cta_label?: string | null; cta_url?: string | null; cta_responder?: string | null;
  meta_title?: string | null; meta_description?: string | null;
};

export type CaseStudyRow = {
  slug: string; headline: string; hero_image: string | null; author: string;
  publish_date: string; summary: string | null; steps: unknown; outcomes: string | null;
  tags: string[] | null; cta_label: string | null; cta_url: string | null;
  cta_responder: string | null; social_caption_short: string | null;
  social_caption_long: string | null; hashtags: string[] | null;
  topic: TopicRef;
};

export type RawWrapped =
  | { type: "article"; row: ArticleRow }
  | { type: "property"; row: PropertyRow }
  | { type: "qa"; row: AskQaRow }
  | { type: "case-study"; row: CaseStudyRow };

export function adaptArticle(r: ArticleRow): UiPost {
  const sections = toSections(r.sections);
  const cta = resolveCta({
    type: "article",
    ctaUrl: r.cta_url, ctaLabel: r.cta_label, ctaResponder: r.cta_responder,
  });
  const t = topicFields(r.topic, { name: "General", slug: "general" });
  return {
    slug: r.slug, type: "article", title: r.title,
    summary: r.summary ?? "", heroImage: resolveImage(r.hero_image),
    topicName: t.topicName, topicSlug: t.topicSlug,
    tags: r.tags ?? [], author: r.author, date: r.publish_date,
    sections, cta, readMinutes: computeReadMinutes(sections, r.read_time_minutes),
    socialCaptionShort: r.social_caption_short,
    socialCaptionLong: r.social_caption_long,
    hashtags: r.hashtags ?? [], ctaResponder: cta.responder,
    metaTitle: r.meta_title ?? null,
    metaDescription: r.meta_description ?? null,
    ogTitle: r.og_title ?? null,
    ogDescription: r.og_description ?? null,
    ogImage: r.og_image ?? r.hero_image ?? null,
    canonicalUrl: r.canonical_url ?? null,
    noindex: r.noindex ?? false,
    schemaJsonLd: asRecord(r.schema_jsonld),
    citation: r.citation ?? null,
  };
}

export function adaptProperty(r: PropertyRow): UiPost {
  const sections = toSections(r.sections);
  const cta = resolveCta({
    type: "property",
    ctaLabel: r.cta_label, ctaResponder: r.cta_responder,
    listingUrl: r.cshr_listing_url,
  });
  const t = topicFields(r.topic, { name: "Rental Drops", slug: "rental-drops" });
  return {
    slug: r.slug, type: "property", title: r.headline,
    summary: r.summary ?? "", heroImage: resolveImage(r.hero_image),
    topicName: t.topicName, topicSlug: t.topicSlug,
    tags: r.tags ?? [], author: r.author, date: r.publish_date,
    sections, cta, listingUrl: r.cshr_listing_url,
    readMinutes: computeReadMinutes(sections),
    socialCaptionShort: r.social_caption_short,
    socialCaptionLong: r.social_caption_long,
    hashtags: r.hashtags ?? [], ctaResponder: cta.responder,
  };
}

export function adaptAskQa(r: AskQaRow): UiPost {
  const sections: Section[] = [];
  if (r.short_answer) sections.push({ id: "short-answer", heading: "Short answer", body: r.short_answer });
  if (r.full_answer) sections.push({ id: "full-answer", heading: "The longer version", body: r.full_answer });
  const cta = resolveCta({
    type: "qa",
    ctaUrl: r.cta_url ?? null, ctaLabel: r.cta_label ?? null,
    ctaResponder: r.cta_responder ?? null,
  });
  const t = topicFields(r.topic, { name: "Ask Good Tenants", slug: "ask-good-tenants" });
  return {
    slug: r.slug, type: "qa", title: r.question,
    summary: r.short_answer ?? "", heroImage: resolveImage(r.hero_image),
    topicName: t.topicName, topicSlug: t.topicSlug,
    tags: r.tags ?? [], author: r.author, date: r.publish_date,
    sections, cta, readMinutes: computeReadMinutes(sections),
    hashtags: [], ctaResponder: cta.responder,
    metaTitle: r.meta_title ?? null,
    metaDescription: r.meta_description ?? null,
  };
}

export function adaptCaseStudy(r: CaseStudyRow): UiPost {
  const sections: Section[] = [];
  if (r.summary) sections.push({ id: "the-brief", heading: "The brief", body: r.summary });
  sections.push(...toSections(r.steps).map((s, i) => ({
    id: s.id || `step-${i}`,
    heading: s.heading || `Step ${i + 1}`,
    body: s.body,
  })));
  if (r.outcomes) sections.push({ id: "outcomes", heading: "Outcomes", body: r.outcomes });
  const cta = resolveCta({
    type: "case-study",
    ctaUrl: r.cta_url, ctaLabel: r.cta_label, ctaResponder: r.cta_responder,
  });
  const t = topicFields(r.topic, { name: "Case Studies", slug: "case-studies" });
  return {
    slug: r.slug, type: "case-study", title: r.headline,
    summary: r.summary ?? "", heroImage: resolveImage(r.hero_image),
    topicName: t.topicName, topicSlug: t.topicSlug,
    tags: r.tags ?? [], author: r.author, date: r.publish_date,
    sections, cta, readMinutes: computeReadMinutes(sections),
    socialCaptionShort: r.social_caption_short,
    socialCaptionLong: r.social_caption_long,
    hashtags: r.hashtags ?? [], ctaResponder: cta.responder,
  };
}

export function adaptWrapped(w: RawWrapped): UiPost {
  switch (w.type) {
    case "article": return adaptArticle(w.row);
    case "property": return adaptProperty(w.row);
    case "qa": return adaptAskQa(w.row);
    case "case-study": return adaptCaseStudy(w.row);
  }
}

export function byNewestFirst(a: UiPost, b: UiPost): number {
  return b.date.localeCompare(a.date);
}

export const POST_TYPE_LABEL: Record<PostType, string> = {
  article: "Article",
  property: "Rental drop",
  qa: "Question",
  "case-study": "Case study",
};
