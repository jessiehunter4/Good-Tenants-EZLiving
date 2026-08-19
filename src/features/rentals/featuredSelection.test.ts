// Tests for the Featured Rental selection engine (build plan Phase 1.4).
//
// The plan names this as a primary unit-test target: "featured-selection
// scoring + diversity rule".

import { describe, expect, it } from "vitest";
import {
  checkDiversity,
  scoreCandidate,
  selectFeatured,
  SELECTION_MAX_SCORE,
  type DropCandidate,
  type FeaturedHistoryEntry,
  type SelectionConfig,
} from "./featuredSelection";

const TODAY = "2026-08-12";

const CONFIG: SelectionConfig = {
  scoreThreshold: 70,
  priceMin: 3000,
  priceMax: 5000,
  requireHeroImage: true,
  diversityWindowDays: 14,
};

function candidate(over: Partial<DropCandidate> = {}): DropCandidate {
  return {
    id: "drop-1",
    listingUrl: "https://cshr.example/listing/1",
    community: "Woodbridge",
    propertyType: "Condo",
    heroImage: "https://img.example/hero.jpg",
    photoCount: 24,
    summary: "x".repeat(450),
    price: 4000,
    beds: 3,
    baths: 2,
    sqft: 1600,
    availableAt: "2026-09-01",
    aiScore: 90,
    rawText: "Renovated kitchen with quartz counters, private patio, two-car garage, central air, pool",
    ...over,
  };
}

describe("scoreCandidate", () => {
  it("gives a complete, well-photographed, in-band listing near full marks", () => {
    const result = scoreCandidate(candidate(), CONFIG, [], TODAY);
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.score).toBeLessThanOrEqual(SELECTION_MAX_SCORE);
    expect(result.disqualified).toBe(false);
  });

  it("never exceeds the maximum or drops below zero", () => {
    const perfect = scoreCandidate(candidate({ aiScore: 100 }), CONFIG, [], TODAY);
    expect(perfect.score).toBeLessThanOrEqual(SELECTION_MAX_SCORE);

    const empty = scoreCandidate(
      candidate({
        heroImage: null, photoCount: 0, summary: null, price: null,
        beds: null, baths: null, sqft: null, availableAt: null,
        aiScore: null, rawText: null,
      }),
      { ...CONFIG, requireHeroImage: false },
      [],
      TODAY,
    );
    expect(empty.score).toBeGreaterThanOrEqual(0);
  });

  it("disqualifies a listing with no hero image when one is required", () => {
    const result = scoreCandidate(candidate({ heroImage: null }), CONFIG, [], TODAY);
    expect(result.disqualified).toBe(true);
    expect(result.reasons[0]).toContain("Disqualified");
  });

  it("does not disqualify when the hero image requirement is off", () => {
    const result = scoreCandidate(
      candidate({ heroImage: null }),
      { ...CONFIG, requireHeroImage: false },
      [],
      TODAY,
    );
    expect(result.disqualified).toBe(false);
  });

  it("clamps an out-of-range AI score rather than trusting it", () => {
    const high = scoreCandidate(candidate({ aiScore: 500 }), CONFIG, [], TODAY);
    const normal = scoreCandidate(candidate({ aiScore: 100 }), CONFIG, [], TODAY);
    expect(high.score).toBe(normal.score);
  });

  it("explains every score with reasons", () => {
    const result = scoreCandidate(candidate(), CONFIG, [], TODAY);
    expect(result.reasons.length).toBeGreaterThan(3);
    expect(result.reasons.join(" ")).toContain("Hero image present");
  });

  it("is deterministic — same inputs, same score", () => {
    const a = scoreCandidate(candidate(), CONFIG, [], TODAY);
    const b = scoreCandidate(candidate(), CONFIG, [], TODAY);
    expect(a.score).toBe(b.score);
    expect(a.reasons).toEqual(b.reasons);
  });
});

describe("price band scoring", () => {
  it("scores a price inside the band above one outside it", () => {
    const inside = scoreCandidate(candidate({ price: 4000 }), CONFIG, [], TODAY);
    const outside = scoreCandidate(candidate({ price: 8000 }), CONFIG, [], TODAY);
    expect(inside.score).toBeGreaterThan(outside.score);
  });

  it("treats the band edges as inside", () => {
    const low = scoreCandidate(candidate({ price: 3000 }), CONFIG, [], TODAY);
    const high = scoreCandidate(candidate({ price: 5000 }), CONFIG, [], TODAY);
    const mid = scoreCandidate(candidate({ price: 4000 }), CONFIG, [], TODAY);
    expect(low.score).toBe(mid.score);
    expect(high.score).toBe(mid.score);
  });

  it("decays with distance rather than falling off a cliff", () => {
    const near = scoreCandidate(candidate({ price: 5200 }), CONFIG, [], TODAY);
    const far = scoreCandidate(candidate({ price: 5900 }), CONFIG, [], TODAY);
    const beyond = scoreCandidate(candidate({ price: 9000 }), CONFIG, [], TODAY);
    expect(near.score).toBeGreaterThan(far.score);
    expect(far.score).toBeGreaterThan(beyond.score);
  });

  it("stays neutral when no range is configured", () => {
    const noBand: SelectionConfig = { ...CONFIG, priceMin: null, priceMax: null };
    const cheap = scoreCandidate(candidate({ price: 1000 }), noBand, [], TODAY);
    const dear = scoreCandidate(candidate({ price: 99000 }), noBand, [], TODAY);
    expect(cheap.score).toBe(dear.score);
  });
});

describe("checkDiversity", () => {
  const history: FeaturedHistoryEntry[] = [
    { featuredDate: "2026-08-10", community: "Woodbridge", propertyType: "Condo" },
  ];

  it("rejects a community featured inside the window", () => {
    const r = checkDiversity(candidate({ propertyType: "Townhouse" }), history, TODAY, 14);
    expect(r.passed).toBe(false);
    expect(r.conflict).toContain("Woodbridge");
  });

  it("rejects a property type featured inside the window", () => {
    const r = checkDiversity(candidate({ community: "Northwood" }), history, TODAY, 14);
    expect(r.passed).toBe(false);
    expect(r.conflict).toContain("Condo");
  });

  it("accepts when both community and type are new", () => {
    const r = checkDiversity(
      candidate({ community: "Northwood", propertyType: "Townhouse" }),
      history,
      TODAY,
      14,
    );
    expect(r.passed).toBe(true);
    expect(r.conflict).toBeNull();
  });

  it("accepts once the entry falls outside the window", () => {
    const old: FeaturedHistoryEntry[] = [
      { featuredDate: "2026-07-01", community: "Woodbridge", propertyType: "Condo" },
    ];
    expect(checkDiversity(candidate(), old, TODAY, 14).passed).toBe(true);
  });

  it("treats the window as exclusive at its boundary", () => {
    const entry = (d: string): FeaturedHistoryEntry[] => [
      { featuredDate: d, community: "Woodbridge", propertyType: "Condo" },
    ];
    // 2026-07-30 is exactly 13 days before TODAY — still inside a 14-day window.
    expect(checkDiversity(candidate(), entry("2026-07-30"), TODAY, 14).passed).toBe(false);
    // 2026-07-29 is 14 days before — outside.
    expect(checkDiversity(candidate(), entry("2026-07-29"), TODAY, 14).passed).toBe(true);
  });

  it("respects a configured window other than the default", () => {
    const h = entryFor("2026-08-05");
    expect(checkDiversity(candidate(), h, TODAY, 14).passed).toBe(false);
    expect(checkDiversity(candidate(), h, TODAY, 3).passed).toBe(true);
  });

  it("compares case- and whitespace-insensitively", () => {
    const messy: FeaturedHistoryEntry[] = [
      { featuredDate: "2026-08-10", community: "  woodbridge ", propertyType: null },
    ];
    expect(checkDiversity(candidate({ propertyType: null }), messy, TODAY, 14).passed).toBe(false);
  });

  it("does not block on unknown community or type", () => {
    const r = checkDiversity(
      candidate({ community: null, propertyType: null }),
      history,
      TODAY,
      14,
    );
    expect(r.passed).toBe(true);
  });

  it("ignores history dated in the future", () => {
    const future: FeaturedHistoryEntry[] = [
      { featuredDate: "2026-09-01", community: "Woodbridge", propertyType: "Condo" },
    ];
    expect(checkDiversity(candidate(), future, TODAY, 14).passed).toBe(true);
  });

  function entryFor(date: string): FeaturedHistoryEntry[] {
    return [{ featuredDate: date, community: "Woodbridge", propertyType: "Condo" }];
  }
});

describe("selectFeatured", () => {
  const recent: FeaturedHistoryEntry[] = [
    { featuredDate: "2026-08-11", community: "Woodbridge", propertyType: "Condo" },
  ];

  it("prefers a diverse candidate over a higher-scoring repeat", () => {
    const repeat = candidate({ id: "repeat", aiScore: 100 });
    const diverse = candidate({
      id: "diverse", community: "Northwood", propertyType: "Townhouse", aiScore: 80,
    });

    const result = selectFeatured([repeat, diverse], CONFIG, recent, TODAY);
    expect(result.winner?.candidate.id).toBe("diverse");
    expect(result.diversityOverride).toBe(false);
  });

  it("falls back to a repeat only when nothing diverse qualifies, and flags it", () => {
    const result = selectFeatured([candidate({ id: "repeat" })], CONFIG, recent, TODAY);
    expect(result.winner?.candidate.id).toBe("repeat");
    expect(result.diversityOverride).toBe(true);
    expect(result.winner?.diversityConflict).toContain("Woodbridge");
  });

  it("returns no winner when nothing clears the threshold", () => {
    const weak = candidate({
      id: "weak", photoCount: 0, summary: null, price: 20000,
      beds: null, baths: null, sqft: null, availableAt: null,
      aiScore: 5, rawText: null,
    });
    const result = selectFeatured([weak], CONFIG, [], TODAY);
    expect(result.winner).toBeNull();
    expect(result.diversityOverride).toBe(false);
  });

  it("never selects a disqualified candidate, however high it scores", () => {
    const noHero = candidate({ id: "no-hero", heroImage: null, aiScore: 100 });
    const result = selectFeatured([noHero], CONFIG, [], TODAY);
    expect(result.winner).toBeNull();
    expect(result.ranked[0]?.disqualified).toBe(true);
  });

  it("returns every candidate ranked, including the unselectable ones", () => {
    const all = [
      candidate({ id: "a" }),
      candidate({ id: "b", heroImage: null }),
      candidate({ id: "c", community: "Northwood", propertyType: "Townhouse" }),
    ];
    const result = selectFeatured(all, CONFIG, recent, TODAY);
    expect(result.ranked).toHaveLength(3);
    // Disqualified candidates sort last so the admin queue reads top-down.
    expect(result.ranked.at(-1)?.candidate.id).toBe("b");
  });

  it("handles an empty candidate list", () => {
    const result = selectFeatured([], CONFIG, [], TODAY);
    expect(result.winner).toBeNull();
    expect(result.ranked).toEqual([]);
  });

  it("breaks ties stably so runs do not reorder", () => {
    const a = candidate({ id: "aaa", community: "Northwood", propertyType: "Townhouse" });
    const b = candidate({ id: "bbb", community: "Turtle Rock", propertyType: "Single Family" });
    const first = selectFeatured([a, b], CONFIG, [], TODAY);
    const second = selectFeatured([b, a], CONFIG, [], TODAY);
    expect(first.winner?.candidate.id).toBe(second.winner?.candidate.id);
  });
});
