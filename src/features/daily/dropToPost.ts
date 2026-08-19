import type { Row } from "@/hooks/admin/crud";
import type { Section } from "./post";
import { slugify } from "@/features/admin/schemas";

type Drop = Row<"cshr_drops">;

/**
 * Turning a feed drop into a publishable post.
 *
 * Carried across from `publishDropById` in the daily's
 * `lib/admin/drops.functions.ts`. Extracted as a pure function so the mapping
 * — which facts become the quick-facts block, what the slug is built from —
 * can be checked without a database.
 */
export type DropOverrides = {
  headline?: string;
  summary?: string;
  heroImage?: string;
  topicId?: string | null;
};

export type DropPostDraft = {
  slug: string;
  headline: string;
  hero_image: string | null;
  summary: string | null;
  sections: Section[];
  cshr_listing_url: string;
  cta_label: string;
  cta_responder: string;
  author: string;
  topic_id: string | null;
  tags: string[];
  hashtags: string[];
  published: boolean;
};

const SLUG_SUFFIX_LENGTH = 6;

export function dropToPost(drop: Drop, overrides: DropOverrides = {}): DropPostDraft {
  const headline = overrides.headline || drop.headline || drop.address || "New rental drop";
  const summary = overrides.summary ?? drop.summary ?? null;
  const heroImage = overrides.heroImage ?? drop.hero_image ?? null;

  // The suffix keeps two listings on the same street from colliding on a slug.
  const suffix = (drop.external_id ?? drop.id).slice(0, SLUG_SUFFIX_LENGTH);

  const facts: string[] = [];
  if (drop.address) facts.push(`Address: ${drop.address}`);
  if (drop.price != null) facts.push(`Price: $${Number(drop.price).toLocaleString()}/mo`);
  if (drop.beds != null) facts.push(`Beds: ${drop.beds}`);
  if (drop.baths != null) facts.push(`Baths: ${drop.baths}`);
  if (drop.sqft != null) facts.push(`Square feet: ${drop.sqft.toLocaleString()}`);
  if (drop.available_at) facts.push(`Available: ${drop.available_at}`);

  const sections: Section[] = [];
  if (facts.length) {
    sections.push({ id: "quick-facts", heading: "Quick facts", body: facts.join("\n\n") });
  }
  if (summary) {
    sections.push({ id: "about", heading: "About this rental", body: summary });
  }

  return {
    slug: slugify(`${headline}-${suffix}`),
    headline,
    hero_image: heroImage,
    summary,
    sections,
    cshr_listing_url: drop.listing_url,
    cta_label: "See this rental",
    cta_responder: "Jessie Hunter Team",
    author: "Good Tenants",
    topic_id: overrides.topicId ?? null,
    tags: [],
    hashtags: [],
    published: true,
  };
}
