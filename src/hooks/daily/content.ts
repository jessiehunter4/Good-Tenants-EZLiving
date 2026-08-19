// Public content reads for the daily.
//
// Carried across from `Irvine Living Daily/src/lib/content.functions.ts` and
// `queries.ts`, with one adaptation: the daily ran these as server functions
// against a service-role client. Here they run in the browser against the anon
// key, which is safe because every content table already carries a
// `published = true` public read policy — the database, not the caller, decides
// what a visitor can see.
import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  ArticleRow, AskQaRow, CaseStudyRow, PropertyRow, RawWrapped,
} from "@/features/daily/post";

const ARTICLE_SELECT =
  "slug, title, hero_image, author, publish_date, summary, sections, tags, read_time_minutes," +
  " cta_label, cta_url, cta_responder, social_caption_short, social_caption_long, hashtags," +
  " meta_title, meta_description, og_image, og_title, og_description, canonical_url, noindex," +
  " schema_jsonld, citation, topic:topics(slug, name)";

const PROPERTY_SELECT =
  "slug, headline, hero_image, author, publish_date, summary, sections, tags, cta_label," +
  " cta_responder, cshr_listing_url, social_caption_short, social_caption_long, hashtags," +
  " topic:topics(slug, name)";

const QA_SELECT =
  "slug, question, hero_image, author, publish_date, short_answer, full_answer, tags," +
  " cta_label, cta_url, cta_responder, meta_title, meta_description, topic:topics(slug, name)";

const CASE_SELECT =
  "slug, headline, hero_image, author, publish_date, summary, steps, outcomes, tags," +
  " cta_label, cta_url, cta_responder, social_caption_short, social_caption_long, hashtags," +
  " topic:topics(slug, name)";

const MINUTE = 60 * 1000;

export type Topic = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  hero_image: string | null;
};

export type SidebarPromo = {
  title: string;
  short_copy: string | null;
  button_label: string | null;
  button_url: string | null;
  image: string | null;
  accent: boolean;
  priority: number;
};

function unwrap<T>(res: { data: unknown; error: { message: string } | null }): T[] {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T[];
}

async function fetchTopics(): Promise<Topic[]> {
  const res = await supabase
    .from("topics")
    .select("id, slug, name, description, hero_image")
    .order("name");
  return unwrap<Topic>(res);
}

async function fetchSidebarPromos(): Promise<SidebarPromo[]> {
  const res = await supabase
    .from("sidebar_promos")
    .select("title, short_copy, button_label, button_url, image, accent, priority")
    .eq("active", true)
    .order("priority");
  return unwrap<SidebarPromo>(res);
}

// The merged feed. Four tables, four shapes, one list — tagged on the way out
// so the adapter knows which vocabulary each row speaks.
async function fetchAllPosts(): Promise<RawWrapped[]> {
  const [a, p, q, c] = await Promise.all([
    supabase.from("articles").select(ARTICLE_SELECT).eq("published", true),
    supabase.from("property_posts").select(PROPERTY_SELECT).eq("published", true),
    supabase.from("ask_qa").select(QA_SELECT).eq("published", true),
    supabase.from("case_studies").select(CASE_SELECT).eq("published", true),
  ]);
  return [
    ...unwrap<ArticleRow>(a).map((row): RawWrapped => ({ type: "article", row })),
    ...unwrap<PropertyRow>(p).map((row): RawWrapped => ({ type: "property", row })),
    ...unwrap<AskQaRow>(q).map((row): RawWrapped => ({ type: "qa", row })),
    ...unwrap<CaseStudyRow>(c).map((row): RawWrapped => ({ type: "case-study", row })),
  ];
}

// A slug is unique across all four tables, so resolving one means asking all
// four and taking whichever answers.
async function fetchPostBySlug(slug: string): Promise<RawWrapped | null> {
  const [a, p, q, c] = await Promise.all([
    supabase.from("articles").select(ARTICLE_SELECT).eq("slug", slug).eq("published", true).maybeSingle(),
    supabase.from("property_posts").select(PROPERTY_SELECT).eq("slug", slug).eq("published", true).maybeSingle(),
    supabase.from("ask_qa").select(QA_SELECT).eq("slug", slug).eq("published", true).maybeSingle(),
    supabase.from("case_studies").select(CASE_SELECT).eq("slug", slug).eq("published", true).maybeSingle(),
  ]);
  if (a.data) return { type: "article", row: a.data as unknown as ArticleRow };
  if (p.data) return { type: "property", row: p.data as unknown as PropertyRow };
  if (q.data) return { type: "qa", row: q.data as unknown as AskQaRow };
  if (c.data) return { type: "case-study", row: c.data as unknown as CaseStudyRow };
  return null;
}

export const topicsQuery = queryOptions({
  queryKey: ["daily", "topics"],
  queryFn: fetchTopics,
  staleTime: 5 * MINUTE,
});

export const sidebarPromosQuery = queryOptions({
  queryKey: ["daily", "sidebar-promos"],
  queryFn: fetchSidebarPromos,
  staleTime: 5 * MINUTE,
});

export const allPostsQuery = queryOptions({
  queryKey: ["daily", "posts"],
  queryFn: fetchAllPosts,
  staleTime: MINUTE,
});

export const postBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["daily", "post", slug],
    queryFn: () => fetchPostBySlug(slug),
    staleTime: MINUTE,
  });
