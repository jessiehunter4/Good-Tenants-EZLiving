/**
 * Moved.
 *
 * There were two definitions of "qualified": this one, which ran on the rentals
 * site against a specific MLS listing, and a hand-set `is_pre_screened` flag on
 * the Good Tenants profile. Phase 03 made them one, and the one lives with the
 * renter rather than with the listings, because it is a fact about a person.
 *
 * Re-exported so nothing had to change in the same commit that moved it.
 */
export {
  CREDIT_LABELS,
  CREDIT_OPTIONS,
  DEFAULT_INCOME_MULTIPLIER,
  creditScoreFor,
  isPreScreened,
  meetsCreditRequirement,
  missingForQualification,
  qualifyForListing,
  requiredIncomeFor,
  type CheckOutcome,
  type CreditEstimate,
  type QualificationCheck,
  type QualificationResult,
  type QualifiableListing as QualificationListing,
  type QualifiableProfile as QualificationProfile,
} from "@/features/tenant/qualification";
