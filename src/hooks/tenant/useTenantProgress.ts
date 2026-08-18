import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  buildTenantSteps,
  type OnboardingStep,
  type TenantProgressInput,
} from "@/features/tenant/onboardingSteps";

interface TenantProgress {
  steps: OnboardingStep[];
  displayName: string | null;
  city: string | null;
  budget: number | null;
  moveDate: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

/** Fetches; the decisions live in features/tenant/onboardingSteps. */
export const useTenantProgress = (): TenantProgress => {
  const { user } = useAuth();
  const [input, setInput] = useState<TenantProgressInput | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const [{ data: profile }, { count }, { data: account }] = await Promise.all([
      supabase.from("tenant_profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase
        .from("application_documents")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", user.id),
      supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
    ]);

    setDisplayName(account?.display_name ?? null);
    setInput({
      hasAccount: true,
      desiredCities: profile?.desired_cities ?? null,
      maxMonthlyRent: profile?.max_monthly_rent ?? null,
      moveDate: profile?.desired_move_date ?? profile?.move_in_date ?? null,
      householdSize: profile?.household_size ?? null,
      householdIncome: profile?.household_income ?? null,
      documentCount: count ?? 0,
      status: profile?.status ?? null,
      isPreScreened: profile?.is_pre_screened ?? null,
    });
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const resolved = input ?? {
    hasAccount: Boolean(user),
    desiredCities: null,
    maxMonthlyRent: null,
    moveDate: null,
    householdSize: null,
    householdIncome: null,
    documentCount: 0,
    status: null,
    isPreScreened: null,
  };

  return {
    steps: buildTenantSteps(resolved),
    displayName,
    city: resolved.desiredCities?.[0] ?? null,
    budget: resolved.maxMonthlyRent,
    moveDate: resolved.moveDate,
    loading,
    refresh,
  };
};

export default useTenantProgress;
