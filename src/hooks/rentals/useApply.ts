// Applying to a listing.
//
// Carried across from the rentals site's Prescreen flow. That flow asked for
// contact details and the whole screening questionnaire on every listing, then
// provisioned an account afterwards. Here the renter already has a profile —
// that is the premise of the merge — so applying reads what they have already
// answered and records the verdict against the listing.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Row } from "@/hooks/admin/crud";
import type { QualificationResult } from "@/features/tenant/qualification";

export type ScreeningRow = Row<"tenant_screenings">;

const applicationsKey = ["rentals", "applications", "mine"] as const;

/** The listings this renter has already applied to. */
export function useMyApplications() {
  return useQuery({
    queryKey: applicationsKey,
    queryFn: async (): Promise<ScreeningRow[]> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return [];

      // The read policy joins through tenant_contacts, so this returns only
      // screenings belonging to contacts belonging to this renter.
      const { data, error } = await supabase
        .from("tenant_screenings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
}

export type ApplyInput = {
  listingId: string;
  listingAddress: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  numAdults: number;
  hasPets: boolean;
  numPets: number;
  creditEstimate: string;
  earliestMoveDate: string;
  latestMoveDate: string | null;
  householdIncome: number;
  result: QualificationResult;
};

export function useApplyToListing() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (input: ApplyInput) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("You need to be signed in to apply.");

      // The contact record is what the screening hangs off, and what the RLS
      // policy uses to decide the screening is this renter's.
      const { data: contact, error: contactError } = await supabase
        .from("tenant_contacts")
        .insert({
          listing_id: input.listingId,
          user_id: auth.user.id,
          full_name: input.fullName,
          email: input.email,
          mobile_number: input.mobileNumber,
        })
        .select("id")
        .single();
      if (contactError) throw new Error(contactError.message);

      const { error } = await supabase.from("tenant_screenings").insert({
        tenant_contact_id: contact.id,
        listing_id: input.listingId,
        num_tenants_over_18: input.numAdults,
        has_pets: input.hasPets,
        num_pets: input.numPets,
        credit_score_estimate: input.creditEstimate,
        earliest_move_date: input.earliestMoveDate,
        // The column is NOT NULL on the source's shape; when a renter gave no
        // latest date, the earliest one stands for both.
        latest_move_date: input.latestMoveDate ?? input.earliestMoveDate,
        total_household_income: input.householdIncome,
        qualification_result: input.result.qualified ? "qualified" : "not_qualified",
        // Stored so the verdict stays explicable later, rather than being
        // recomputed under whatever the rule says next year.
        qualification_reasons: input.result.checks.map(
          (c) => `${c.outcome}: ${c.message}`,
        ),
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: applicationsKey }),
  });
}
