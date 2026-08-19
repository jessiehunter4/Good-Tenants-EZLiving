// The renter's one profile.
//
// Phase 03. This replaces `usePrequalification`, which wrote a second row into
// `tenant_prequalification_profiles` holding answers `tenant_profiles` already
// had. A signed-in renter has one profile; the prequalification table is now
// only where an anonymous visitor's answers land before there is an account.
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Row } from "@/hooks/admin/crud";
import { fromTenantProfile } from "@/features/tenant/qualificationProfile";
import type { QualifiableProfile } from "@/features/tenant/qualification";

export type RenterProfile = Row<"tenant_profiles">;

export const myRenterProfileQuery = queryOptions({
  queryKey: ["tenant", "profile", "mine"],
  queryFn: async (): Promise<RenterProfile | null> => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return null;

    const { data, error } = await supabase
      .from("tenant_profiles")
      .select("*")
      .eq("id", auth.user.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  },
});

export type RenterProfilePatch = {
  household_income: number;
  credit_score_estimate: string;
  household_size: number;
  pets: boolean;
  num_pets: number;
  earliest_move_date: string;
  desired_move_date: string | null;
  max_monthly_rent: number | null;
  min_bedrooms: number | null;
};

export function useSaveRenterProfile() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (values: RenterProfilePatch) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("You need to be signed in to save this.");

      // The row is created by the sign-up trigger, so this is always an update.
      // `is_pre_screened` is not written: the database derives it from the three
      // fields the qualification rule needs.
      const { error } = await supabase
        .from("tenant_profiles")
        .update(values)
        .eq("id", auth.user.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ["tenant", "profile"] }),
  });
}

export function toQualifiable(profile: RenterProfile): QualifiableProfile {
  return fromTenantProfile(profile);
}
