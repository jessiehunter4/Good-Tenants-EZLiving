import { describe, expect, it } from "vitest";
import { articleSchema, jsonToSections, todayIso } from "./contentSchemas";

describe("todayIso", () => {
  it("is a plain date the `date` column accepts", () => {
    expect(todayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("uses the editor's local day, not UTC", () => {
    // toISOString() would roll over a day early in Manila and a day late in
    // California — the same bug the signup chart had.
    const now = new Date();
    expect(todayIso()).toBe(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
        now.getDate(),
      ).padStart(2, "0")}`,
    );
  });
});

describe("jsonToSections", () => {
  it("survives a column holding null, a string, or junk", () => {
    expect(jsonToSections(null)).toEqual([]);
    expect(jsonToSections("not sections")).toEqual([]);
    expect(jsonToSections([null, 3])).toEqual([]);
  });

  it("gives a section without an id one that can be linked to", () => {
    expect(jsonToSections([{ heading: "Numbers", body: "x" }])).toEqual([
      { id: "section-1", heading: "Numbers", body: "x" },
    ]);
  });
});

describe("articleSchema", () => {
  const valid = {
    slug: "irvine-rents", title: "Irvine rents", author: "Team",
    publish_date: "2026-08-19", hero_image: "", summary: "", topic_id: "",
    tags: [], hashtags: [], published: true, sections: [],
    cta_label: "", cta_url: "", cta_responder: "",
    social_caption_short: "", social_caption_long: "",
    meta_title: "", meta_description: "",
  };

  it("lets a draft be saved with almost nothing filled in", () => {
    expect(articleSchema.safeParse(valid).success).toBe(true);
  });

  it("still insists on the columns the table declares NOT NULL", () => {
    expect(articleSchema.safeParse({ ...valid, title: "" }).success).toBe(false);
    expect(articleSchema.safeParse({ ...valid, author: "" }).success).toBe(false);
    expect(articleSchema.safeParse({ ...valid, publish_date: "" }).success).toBe(false);
  });
});
