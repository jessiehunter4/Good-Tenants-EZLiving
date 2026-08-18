import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export interface TrendPoint {
  /** ISO date, used as the key. */
  date: string;
  /** Short label for the axis. */
  label: string;
  tenants: number;
  landlords: number;
  agents: number;
  total: number;
  cumulative: number;
}

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

    // Every day in the window, so gaps stay visible as gaps.
    const buckets = new Map<string, TrendPoint>();
    for (let index = 0; index < DAYS; index += 1) {
      const day = new Date(since);
      day.setDate(since.getDate() + index);
      const key = day.toISOString().slice(0, 10);
      buckets.set(key, {
        date: key,
        label: day.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        tenants: 0,
        landlords: 0,
        agents: 0,
        total: 0,
        cumulative: 0,
      });
    }

    for (const row of data ?? []) {
      if (!row.created_at) continue;
      const key = new Date(row.created_at).toISOString().slice(0, 10);
      const point = buckets.get(key);
      if (!point) continue;

      if (row.role === "tenant") point.tenants += 1;
      else if (row.role === "landlord") point.landlords += 1;
      else if (row.role === "agent") point.agents += 1;
      point.total += 1;
    }

    let running = 0;
    const points = Array.from(buckets.values()).map((point) => {
      running += point.total;
      return { ...point, cumulative: running };
    });

    setTrend(points);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchTrend();
  }, [fetchTrend]);

  return { trend, loading, refreshTrend: fetchTrend };
};

export default useSignupTrend;
