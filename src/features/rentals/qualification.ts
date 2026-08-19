/**
 * Whether a renter qualifies for a listing.
 *
 * Carried across from `comingsoonhomrentals-com/src/lib/qualification.ts`,
 * which calls itself the single source of truth for the rentals side. It is
 * carried here as-is, deliberately, even though phase 03 exists to reconcile
 * it with the Good Tenants screening package: moving it unchanged first means
 * the reconciliation is a decision made on purpose rather than a difference
 * that got lost in a port.
 *
 * One thing did change. The source returned a mixed list of strings where a
 * met requirement and a failed one read the same, so a caller had to guess
 * which was which from the wording. Reasons now say whether they passed.
 */
export type CreditEstimate = "excellent" | "good" | "fair" | "poor" | "not_sure";

export type QualificationProfile = {
  householdIncome: number;
  creditEstimate: CreditEstimate;
  hasPets: boolean;
  earliestMoveDate: string;
};

export type QualificationListing = {
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
  qualified: boolean;
  checks: QualificationCheck[];
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

const money = (value: number) => `$${Math.round(value).toLocaleString("en-US")}`;

export function requiredIncomeFor(listing: QualificationListing): number {
  const multiplier = listing.incomeMultiplier ?? DEFAULT_INCOME_MULTIPLIER;
  return (listing.rent ?? 0) * multiplier;
}

export function creditScoreFor(estimate: CreditEstimate): number {
  return CREDIT_BANDS[estimate] ?? CREDIT_BANDS.not_sure;
}

export function meetsCreditRequirement(estimate: CreditEstimate, required: number): boolean {
  return creditScoreFor(estimate) >= required;
}

export function qualifyForListing(
  profile: QualificationProfile,
  listing: QualificationListing,
): QualificationResult {
  const checks: QualificationCheck[] = [];

  const required = requiredIncomeFor(listing);
  const incomeMet = profile.householdIncome >= required;
  checks.push({
    id: "income",
    outcome: incomeMet ? "pass" : "fail",
    message: incomeMet
      ? "Income requirement met"
      : `Income requirement not met — this home looks for ${money(required)} a month`,
  });

  if (listing.minCreditScore) {
    const creditMet = meetsCreditRequirement(profile.creditEstimate, listing.minCreditScore);
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

  // Timing never disqualifies. A renter who can move later than the property
  // is free is still a fit; it is a note, not a refusal.
  if (listing.dateAvailable) {
    const available = new Date(listing.dateAvailable);
    const earliest = new Date(profile.earliestMoveDate);
    const aligned = !(earliest > available);
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
    checks,
  };
}
