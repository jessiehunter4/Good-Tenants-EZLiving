/**
 * The one definition of "qualified".
 *
 * Before this there were two. The rentals site asked whether a renter would be
 * approved for a specific property — income against rent, credit against a
 * minimum, pets, timing — and asked it again on every property. Good Tenants
 * asked whether a renter was "pre-screened", a flag somebody set by hand that
 * the landlord directory believed. Neither knew about the other, so a renter
 * could be qualified in one place and unknown in the other.
 *
 * This is that question, asked once, of the one profile. It came from
 * `comingsoonhomrentals-com/src/lib/qualification.ts` — the rule that was
 * actually running against live inventory — and it keeps that rule's numbers.
 * What changed is what it reads: one profile rather than a per-property form,
 * and any listing rather than only an MLS one.
 *
 * FIT IS A DIFFERENT QUESTION. `calculate_match_score` scores whether a home
 * suits what a renter asked for. This scores whether they would be approved for
 * it. A renter can qualify for a home that suits them badly and want one they
 * cannot afford, so the two stay apart.
 */
export type CreditEstimate = "excellent" | "good" | "fair" | "poor" | "not_sure";

/** What the rule needs. Any profile that can answer these can be qualified. */
export type QualifiableProfile = {
  householdIncome: number | null;
  creditEstimate: CreditEstimate | null;
  hasPets: boolean | null;
  earliestMoveDate: string | null;
};

/** What the rule needs of a home — either an MLS listing or an owner's own. */
export type QualifiableListing = {
  rent: number | null;
  minCreditScore: number | null;
  petsAllowed: boolean | null;
  dateAvailable: string | null;
  incomeMultiplier: number | null;
};

export type CheckOutcome = "pass" | "fail" | "warn";

export type QualificationCheck = {
  id: "income" | "credit" | "pets" | "timing";
  outcome: CheckOutcome;
  message: string;
};

export type QualificationResult = {
  /** True only when nothing failed. An incomplete profile is not qualified. */
  qualified: boolean;
  /** False when the profile cannot answer the question yet. */
  answerable: boolean;
  checks: QualificationCheck[];
  /** What is still missing, when the profile cannot answer. */
  missing: string[];
};

/** The authoritative default: a renter needs 2.5× the rent in monthly income. */
export const DEFAULT_INCOME_MULTIPLIER = 2.5;

/**
 * What a self-reported credit band is worth as a number. These are estimates a
 * renter picks from a list, not a pulled score — which is why a failure here is
 * phrased as "may not meet" rather than as a refusal.
 */
const CREDIT_BANDS: Record<CreditEstimate, number> = {
  excellent: 750,
  good: 700,
  fair: 650,
  poor: 550,
  not_sure: 600,
};

export const CREDIT_LABELS: Record<CreditEstimate, string> = {
  excellent: "Excellent (750+)",
  good: "Good (700–749)",
  fair: "Fair (650–699)",
  poor: "Below 650",
  not_sure: "I'm not sure",
};

export const CREDIT_OPTIONS = Object.keys(CREDIT_LABELS) as CreditEstimate[];

const money = (value: number) => `$${Math.round(value).toLocaleString("en-US")}`;

export function requiredIncomeFor(listing: QualifiableListing): number {
  const multiplier = listing.incomeMultiplier ?? DEFAULT_INCOME_MULTIPLIER;
  return (listing.rent ?? 0) * multiplier;
}

export function creditScoreFor(estimate: CreditEstimate): number {
  return CREDIT_BANDS[estimate] ?? CREDIT_BANDS.not_sure;
}

export function meetsCreditRequirement(estimate: CreditEstimate, required: number): boolean {
  return creditScoreFor(estimate) >= required;
}

/**
 * What a profile still needs before the question can be answered at all. This
 * is the same condition as `tenant_profiles.is_pre_screened`, which the
 * database derives from the same three fields.
 */
export function missingForQualification(profile: QualifiableProfile): string[] {
  const missing: string[] = [];
  if (profile.householdIncome == null) missing.push("your household income");
  if (!profile.creditEstimate) missing.push("your credit estimate");
  if (!profile.earliestMoveDate) missing.push("when you could move");
  return missing;
}

export function isPreScreened(profile: QualifiableProfile): boolean {
  return missingForQualification(profile).length === 0;
}

export function qualifyForListing(
  profile: QualifiableProfile,
  listing: QualifiableListing,
): QualificationResult {
  const missing = missingForQualification(profile);
  if (missing.length > 0) {
    return { qualified: false, answerable: false, checks: [], missing };
  }

  // Safe after the guard: missingForQualification checked all three.
  const income = profile.householdIncome as number;
  const credit = profile.creditEstimate as CreditEstimate;
  const earliestMove = profile.earliestMoveDate as string;

  const checks: QualificationCheck[] = [];

  const required = requiredIncomeFor(listing);
  const incomeMet = income >= required;
  checks.push({
    id: "income",
    outcome: incomeMet ? "pass" : "fail",
    message: incomeMet
      ? "Income requirement met"
      : `Income requirement not met — this home looks for ${money(required)} a month`,
  });

  if (listing.minCreditScore) {
    const creditMet = meetsCreditRequirement(credit, listing.minCreditScore);
    checks.push({
      id: "credit",
      outcome: creditMet ? "pass" : "fail",
      message: creditMet
        ? "Credit estimate meets the requirement"
        : `Credit estimate may not meet the requirement (${listing.minCreditScore}+)`,
    });
  }

  if (profile.hasPets) {
    const petsRefused = listing.petsAllowed === false;
    checks.push({
      id: "pets",
      outcome: petsRefused ? "fail" : "pass",
      message: petsRefused ? "Pets are not allowed at this property" : "Pets are allowed",
    });
  }

  // Timing never disqualifies. A renter who can move later than the property is
  // free is still a fit; it is a note, not a refusal.
  if (listing.dateAvailable) {
    const aligned = !(new Date(earliestMove) > new Date(listing.dateAvailable));
    checks.push({
      id: "timing",
      outcome: aligned ? "pass" : "warn",
      message: aligned
        ? "Availability lines up with your dates"
        : "Your earliest move is after this home is free",
    });
  }

  return {
    qualified: checks.every((c) => c.outcome !== "fail"),
    answerable: true,
    checks,
    missing: [],
  };
}
