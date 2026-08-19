import { describe, expect, it } from "vitest";
import { ctaSchema, orNull, slugify, topicSchema } from "./schemas";

describe("slugify", () => {
  it("makes a slug the topic schema will accept", () => {
    const slug = slugify("What's changed in Irvine — May 2026!");
    expect(slug).toBe("whats-changed-in-irvine-may-2026");
    expect(topicSchema.shape.slug.safeParse(slug).success).toBe(true);
  });

  it("never leaves a leading or trailing hyphen", () => {
    expect(slugify("  --Great Park--  ")).toBe("great-park");
  });
});

describe("topicSchema", () => {
  it("accepts blank optional fields, which orNull turns into nulls", () => {
    const parsed = topicSchema.parse({ name: "Market", slug: "market", description: "", hero_image: "" });
    expect(orNull(parsed.description)).toBeNull();
    expect(orNull(parsed.hero_image)).toBeNull();
  });

  it("rejects a slug with spaces or capitals", () => {
    expect(topicSchema.safeParse({ name: "X", slug: "Market Updates" }).success).toBe(false);
  });
});

describe("ctaSchema", () => {
  it("uses underscores, matching the slugs already seeded in cta_destinations", () => {
    expect(ctaSchema.shape.slug.safeParse("lead_renter_profile").success).toBe(true);
    expect(ctaSchema.shape.slug.safeParse("lead-renter-profile").success).toBe(false);
  });

  it("only accepts the kinds the table's check constraint allows", () => {
    expect(ctaSchema.shape.kind.safeParse("lead_form").success).toBe(true);
    expect(ctaSchema.shape.kind.safeParse("billboard").success).toBe(false);
  });
});

describe("orNull", () => {
  it("treats whitespace as absent", () => {
    expect(orNull("   ")).toBeNull();
    expect(orNull("")).toBeNull();
    expect(orNull(undefined)).toBeNull();
  });

  it("keeps a real value", () => {
    expect(orNull("Market Updates")).toBe("Market Updates");
  });
});
