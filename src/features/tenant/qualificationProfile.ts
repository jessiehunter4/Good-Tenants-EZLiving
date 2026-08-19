import type { Row } from "@/hooks/admin/crud";
import type { CreditEstimate, QualifiableProfile } from "./qualification";

/**
 * The one profile, in the shape the one rule reads.
 *
 * Two adapters, because two tables can still supply the answers: the renter's
 * own profile, and the anonymous prequalification a visitor leaves before they
 * have an account. There is still only one rule and one stored result per
 * person — this is only about where the answers are read from.
 */
export function fromTenantProfile(row: Row<"tenant_profiles">): QualifiableProfile {
  return {
    householdIncome: row.household_income == null ? null : Number(row.household_income),
    creditEstimate: (row.credit_score_estimate as CreditEstimate | null) ?? null,
    hasPets: row.pets,
    // `earliest_move_date` is the one a landlord cares about; the others are
    // preferences. Falling back keeps a profile written before this field
    // existed from looking unanswerable.
    earliestMoveDate: row.earliest_move_date ?? row.move_in_date ?? row.desired_move_date,
  };
}

export function fromPrequalification(
  row: Row<"tenant_prequalification_profiles">,
): QualifiableProfile {
  return {
    householdIncome: row.household_income == null ? null : Number(row.household_income),
    creditEstimate: (row.credit_score_estimate as CreditEstimate | null) ?? null,
    hasPets: row.has_pets,
    earliestMoveDate: row.earliest_move_date,
  };
}
