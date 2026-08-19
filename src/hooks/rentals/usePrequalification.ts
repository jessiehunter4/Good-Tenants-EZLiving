// The renter's prequalification profile.
//
// Carried across from `comingsoonhomrentals-com/src/hooks/
// usePrequalificationProfile.ts`. The source keyed anonymous prequalifications
// by a browser session id and later claimed them onto an account. That flow
// needs a service-role path to write on behalf of someone with no session, so
// what is here is the signed-in half: a renter's own row, which RLS already
// lets them read and update.
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Row } from "@/hooks/admin/crud";
import type { PrequalifyForm } from "@/features/rentals/prequalifySchema";
import type {
  CreditEstimate,
  QualificationProfile,
} from "@/features/rentals/qualification";

export type PrequalificationRow = Row<"tenant_prequalification_profiles">;

export const myPrequalificationQuery = queryOptions({
  queryKey: ["rentals", "prequalification", "mine"],
  queryFn: async (): Promise<PrequalificationRow | null> => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return null;

    const { data, error } = await supabase
      .from("tenant_prequalification_profiles")
      .select("*")
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  },
});

export function useSavePrequalification() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (values: PrequalifyForm) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("You need to be signed in to save this.");

      const payload = {
        user_id: auth.user.id,
        household_income: values.householdIncome,
        credit_score_estimate: values.creditEstimate,
        num_adults: values.numAdults,
        num_children: values.numChildren,
        has_pets: values.hasPets,
        num_pets: values.hasPets ? values.numPets : 0,
        earliest_move_date: values.earliestMoveDate,
        latest_move_date: values.latestMoveDate || null,
        max_rent: values.maxRent,
        min_bedrooms: values.minBedrooms,
      };

      // A renter has one prequalification, so this updates in place when one
      // exists rather than accumulating a row per visit.
      const { data: existing, error: lookupError } = await supabase
        .from("tenant_prequalification_profiles")
        .select("id")
        .eq("user_id", auth.user.id)
        .maybeSingle();
      if (lookupError) throw new Error(lookupError.message);

      if (existing) {
        const { error } = await supabase
          .from("tenant_prequalification_profiles")
          .update(payload)
          .eq("id", existing.id);
        if (error) throw new Error(error.message);
        return existing.id;
      }

      const { data, error } = await supabase
        .from("tenant_prequalification_profiles")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return data.id;
    },
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ["rentals", "prequalification"] }),
  });
}

/** The stored row, in the shape the qualification rule works on. */
export function toQualificationProfile(
  row: PrequalificationRow,
): QualificationProfile {
  return {
    householdIncome: Number(row.household_income),
    creditEstimate: row.credit_score_estimate as CreditEstimate,
    hasPets: row.has_pets ?? false,
    earliestMoveDate: row.earliest_move_date,
  };
}
