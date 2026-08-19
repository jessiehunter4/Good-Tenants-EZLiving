import { describe, expect, it } from "vitest";

import {
  assertFairHousingCompliant,
  isPublishable,
  lintFairHousing,
} from "./fairHousing";

describe("lintFairHousing", () => {
  it("passes copy that describes only the property", () => {
    const copy =
      "Three bedrooms, two baths, 1,600 square feet. Renovated kitchen with quartz " +
      "counters, private patio, two-car garage. Available September 1.";
    expect(lintFairHousing(copy)).toEqual([]);
    expect(isPublishable(copy)).toBe(true);
  });

  it("blocks copy describing who the home suits", () => {
    const findings = lintFairHousing("Perfect for families with young children.");
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]?.severity).toBe("block");
  });

  it("blocks exclusion by familial status", () => {
    expect(isPublishable("No children please.")).toBe(false);
    expect(isPublishable("Adults only building.")).toBe(false);
  });

  it("blocks religious references and proximity", () => {
    expect(isPublishable("Walking distance to church.")).toBe(false);
    expect(isPublishable("A quiet Christian community.")).toBe(false);
  });

  it("blocks exclusion by disability or source of income", () => {
    expect(isPublishable("Must be able to climb stairs.")).toBe(false);
    expect(isPublishable("No Section 8.")).toBe(false);
  });

  it("flags proxies for review without blocking them", () => {
    const findings = lintFairHousing("Located in a safe neighborhood with good schools.");
    expect(findings.length).toBe(2);
    expect(findings.every((f) => f.severity === "review")).toBe(true);
    // Review-level findings still publish — they need a human, not a wall.
    expect(isPublishable("Located in a safe neighborhood.")).toBe(true);
  });

  it("flags a CTA that does not name the responder", () => {
    const findings = lintFairHousing("Contact the agent to schedule a tour.");
    expect(findings[0]?.reason).toContain("Jessie Hunter Team");
  });

  it("is case-insensitive", () => {
    expect(isPublishable("PERFECT FOR FAMILIES")).toBe(false);
    expect(isPublishable("perfect for families")).toBe(false);
  });

  it("finds every occurrence, not just the first", () => {
    const findings = lintFairHousing(
      "Perfect for families. Truly perfect for retirees too.",
    );
    expect(findings.length).toBeGreaterThanOrEqual(2);
  });

  it("returns findings in the order they appear", () => {
    const findings = lintFairHousing("Good schools nearby, and a safe neighborhood.");
    expect(findings[0]!.index).toBeLessThan(findings[1]!.index);
  });

  it("does not leak regex state between calls", () => {
    const copy = "Perfect for families.";
    expect(lintFairHousing(copy)).toEqual(lintFairHousing(copy));
    expect(lintFairHousing(copy).length).toBeGreaterThan(0);
  });

  it("handles empty input", () => {
    expect(lintFairHousing("")).toEqual([]);
    expect(isPublishable("")).toBe(true);
  });
});

describe("assertFairHousingCompliant", () => {
  it("throws on blocking copy, naming the phrase", () => {
    expect(() => assertFairHousingCompliant("Perfect for families")).toThrowError(
      /perfect for families/i,
    );
  });

  it("does not throw on review-level findings", () => {
    expect(() => assertFairHousingCompliant("A safe neighborhood.")).not.toThrow();
  });

  it("does not throw on clean copy", () => {
    expect(() => assertFairHousingCompliant("Two bedrooms, one bath.")).not.toThrow();
  });
});
