import { describe, expect, it } from "vitest";
import { dropToPost } from "./dropToPost";
import type { Row } from "@/hooks/admin/crud";

const drop: Row<"cshr_drops"> = {
  id: "11111111-2222-3333-4444-555555555555",
  listing_url: "https://example.com/listing/1",
  external_id: null,
  address: "12 Great Park Blvd",
  headline: "Bright 3 bed near the Great Park",
  summary: "Corner unit with a yard.",
  hero_image: null,
  price: 4200,
  beds: 3,
  baths: 2,
  sqft: 1750,
  available_at: "2026-09-01",
  raw: {},
  status: "pending",
  property_post_id: null,
  selection_score: null,
  selection_notes: null,
  synced_at: "2026-08-19T00:00:00Z",
  created_at: "2026-08-19T00:00:00Z",
  updated_at: "2026-08-19T00:00:00Z",
};

describe("dropToPost", () => {
  it("builds the quick facts block from whatever the feed supplied", () => {
    const post = dropToPost(drop);
    expect(post.sections[0].heading).toBe("Quick facts");
    expect(post.sections[0].body).toContain("Price: $4,200/mo");
    expect(post.sections[0].body).toContain("Beds: 3");
    expect(post.sections[0].body).toContain("Square feet: 1,750");
  });

  it("omits the facts block entirely when the feed gave nothing to say", () => {
    const bare = { ...drop, address: null, price: null, beds: null, baths: null, sqft: null, available_at: null, summary: null };
    expect(dropToPost(bare).sections).toEqual([]);
  });

  it("falls back through headline, address, then a generic title", () => {
    expect(dropToPost({ ...drop, headline: null }).headline).toBe("12 Great Park Blvd");
    expect(dropToPost({ ...drop, headline: null, address: null }).headline).toBe("New rental drop");
  });

  it("suffixes the slug so two listings on one street cannot collide", () => {
    const a = dropToPost({ ...drop, id: "aaaaaaaa-0000-0000-0000-000000000000" });
    const b = dropToPost({ ...drop, id: "bbbbbbbb-0000-0000-0000-000000000000" });
    expect(a.slug).not.toBe(b.slug);
    expect(a.slug.startsWith("bright-3-bed-near-the-great-park-")).toBe(true);
  });

  it("prefers the external id for the suffix, so a re-sync keeps the same slug", () => {
    const post = dropToPost({ ...drop, external_id: "MLS9988" });
    expect(post.slug.endsWith("-mls998")).toBe(true);
  });
});
