import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { bucketSignups, type TrendPoint } from "./signupTrend";

export type { TrendPoint };

const DAYS = 30;

/**
 * Signups per day for the last month.
 *
 * The counters elsewhere answer "how many"; this answers "is it growing", which
 * a total cannot. The bucketing happens here rather than in SQL because the
 * numbers are small and a client-side group-by avoids a database function that
 * would then need its own migration and its own grant.
 *
 * Days with no signups are kept as zeroes. Dropping them would draw a line
 * between two distant points and imply steady growth across a gap where nothing
 * happened.
 */
export const useSignupTrend = () => {
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrend = useCallback(async () => {
    const since = new Date();
    since.setDate(since.getDate() - (DAYS - 1));
    since.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("users")
      .select("created_at, role")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Could not load the signup trend:", error);
      setLoading(false);
      return;
    }

    setTrend(bucketSignups(data ?? [], DAYS, new Date()));
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchTrend();
  }, [fetchTrend]);

  return { trend, loading, refreshTrend: fetchTrend };
};

export default useSignupTrend;
