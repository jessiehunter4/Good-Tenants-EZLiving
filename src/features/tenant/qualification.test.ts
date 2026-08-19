import { describe, expect, it } from "vitest";
import {
  DEFAULT_INCOME_MULTIPLIER,
  isPreScreened,
  meetsCreditRequirement,
  qualifyForListing,
  requiredIncomeFor,
  type QualifiableListing,
  type QualifiableProfile,
} from "./qualification";

const profile: QualifiableProfile = {
  householdIncome: 12000,
  creditEstimate: "good",
  hasPets: false,
  earliestMoveDate: "2026-09-01",
};

const listing: QualifiableListing = {
  rent: 4000,
  minCreditScore: 680,
  petsAllowed: true,
  dateAvailable: "2026-09-15",
  incomeMultiplier: null,
};

const outcome = (r: ReturnType<typeof qualifyForListing>, id: string) =>
  r.checks.find((c) => c.id === id)?.outcome;

describe("requiredIncomeFor", () => {
  it("uses 2.5x when the listing states no multiplier", () => {
    expect(requiredIncomeFor(listing)).toBe(4000 * DEFAULT_INCOME_MULTIPLIER);
  });

  it("prefers the listing's own multiplier", () => {
    expect(requiredIncomeFor({ ...listing, incomeMultiplier: 3 })).toBe(12000);
  });

  it("treats a listing with no rent as requiring nothing, not NaN", () => {
    expect(requiredIncomeFor({ ...listing, rent: null })).toBe(0);
  });
});

describe("qualifyForListing", () => {
  it("qualifies a renter who clears every bar", () => {
    const result = qualifyForListing(profile, listing);
    expect(result.qualified).toBe(true);
    expect(outcome(result, "income")).toBe("pass");
  });

  it("fails on income and says what the home actually needs", () => {
    const result = qualifyForListing({ ...profile, householdIncome: 8000 }, listing);
    expect(result.qualified).toBe(false);
    expect(result.checks.find((c) => c.id === "income")?.message).toContain("$10,000");
  });

  it("qualifies at exactly the required income, not just above it", () => {
    const result = qualifyForListing({ ...profile, householdIncome: 10000 }, listing);
    expect(result.qualified).toBe(true);
  });

  it("skips the credit check when the listing states no minimum", () => {
    const result = qualifyForListing(
      { ...profile, creditEstimate: "poor" },
      { ...listing, minCreditScore: null },
    );
    expect(outcome(result, "credit")).toBeUndefined();
    expect(result.qualified).toBe(true);
  });

  it("fails a renter with pets only where the listing refuses them", () => {
    const withPets = { ...profile, hasPets: true };
    expect(qualifyForListing(withPets, { ...listing, petsAllowed: false }).qualified).toBe(false);
    expect(qualifyForListing(withPets, { ...listing, petsAllowed: null }).qualified).toBe(true);
  });

  it("says nothing about pets for a renter who has none", () => {
    expect(outcome(qualifyForListing(profile, { ...listing, petsAllowed: false }), "pets"))
      .toBeUndefined();
  });

  it("warns about late timing without disqualifying", () => {
    const result = qualifyForListing({ ...profile, earliestMoveDate: "2026-12-01" }, listing);
    expect(outcome(result, "timing")).toBe("warn");
    expect(result.qualified).toBe(true);
  });
});

describe("meetsCreditRequirement", () => {
  it("scores the bands the way the rentals site did", () => {
    expect(meetsCreditRequirement("excellent", 740)).toBe(true);
    expect(meetsCreditRequirement("fair", 680)).toBe(false);
  });

  it("treats not-sure as 600 rather than as a pass", () => {
    expect(meetsCreditRequirement("not_sure", 650)).toBe(false);
    expect(meetsCreditRequirement("not_sure", 580)).toBe(true);
  });
});

describe("an incomplete profile", () => {
  it("cannot be qualified, and says what is missing rather than failing silently", () => {
    const result = qualifyForListing(
      { householdIncome: null, creditEstimate: null, hasPets: false, earliestMoveDate: null },
      listing,
    );
    expect(result.answerable).toBe(false);
    expect(result.qualified).toBe(false);
    expect(result.checks).toEqual([]);
    expect(result.missing).toEqual([
      "your household income",
      "your credit estimate",
      "when you could move",
    ]);
  });

  it("is not treated as qualified just because nothing failed", () => {
    // The old flag was set by hand, so an empty profile could read as
    // pre-screened. Now the same three fields decide it in both places.
    const empty = { householdIncome: null, creditEstimate: null, hasPets: null, earliestMoveDate: null };
    expect(isPreScreened(empty)).toBe(false);
    expect(qualifyForListing(empty, listing).qualified).toBe(false);
  });

  it("is answerable as soon as the three fields are there", () => {
    expect(isPreScreened(profile)).toBe(true);
    expect(qualifyForListing(profile, listing).answerable).toBe(true);
  });
});
