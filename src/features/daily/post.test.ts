import { describe, expect, it } from "vitest";
import { adaptArticle, adaptCaseStudy, byNewestFirst, type ArticleRow, type CaseStudyRow } from "./post";
import { searchPosts } from "./search";

const article: ArticleRow = {
  slug: "irvine-rent-2026",
  title: "Irvine rent in 2026",
  hero_image: null,
  author: "Jessie Hunter",
  publish_date: "2026-06-15",
  summary: "What changed.",
  sections: [{ heading: "Numbers", body: "one two three four five" }],
  tags: ["market"],
  read_time_minutes: null,
  cta_label: null,
  cta_url: null,
  cta_responder: null,
  social_caption_short: null,
  social_caption_long: null,
  hashtags: null,
  topic: { slug: "market-updates", name: "Market Updates" },
};

describe("adaptArticle", () => {
  it("gives a section without an id a stable one, so the table of contents can link to it", () => {
    expect(adaptArticle(article).sections[0].id).toBe("s-0");
  });

  it("never reports a zero-minute read", () => {
    expect(adaptArticle({ ...article, sections: [] }).readMinutes).toBe(1);
  });

  it("falls back to General when a post has no topic — 9 of the daily's 11 articles do not", () => {
    expect(adaptArticle({ ...article, topic: null }).topicName).toBe("General");
  });

  it("defaults the og image to the hero rather than leaving a share card blank", () => {
    expect(adaptArticle({ ...article, hero_image: "post-market" }).ogImage).toBe("post-market");
  });
});

describe("adaptCaseStudy", () => {
  const study: CaseStudyRow = {
    slug: "relocation", headline: "A relocation", hero_image: null, author: "Team",
    publish_date: "2026-04-01", summary: "The brief.", steps: [{ heading: "Step one", body: "Did it." }],
    outcomes: "Leased.", tags: null, cta_label: null, cta_url: null, cta_responder: null,
    social_caption_short: null, social_caption_long: null, hashtags: null, topic: null,
  };

  it("reads as brief, steps, outcomes", () => {
    expect(adaptCaseStudy(study).sections.map((s) => s.heading)).toEqual([
      "The brief", "Step one", "Outcomes",
    ]);
  });
});

describe("byNewestFirst", () => {
  it("puts the newer post first", () => {
    const older = adaptArticle({ ...article, slug: "older", publish_date: "2026-01-01" });
    const newer = adaptArticle({ ...article, slug: "newer", publish_date: "2026-06-01" });
    expect([older, newer].sort(byNewestFirst).map((p) => p.slug)).toEqual(["newer", "older"]);
  });
});

describe("searchPosts", () => {
  const posts = [adaptArticle(article)];

  it("returns everything for an empty query", () => {
    expect(searchPosts(posts, "   ")).toHaveLength(1);
  });

  it("matches on topic and tag, not just the title", () => {
    expect(searchPosts(posts, "market updates")).toHaveLength(1);
    expect(searchPosts(posts, "MARKET")).toHaveLength(1);
  });

  it("returns nothing when nothing matches", () => {
    expect(searchPosts(posts, "tustin")).toHaveLength(0);
  });
});
