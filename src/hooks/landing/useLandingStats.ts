import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export interface LandingStats {
  activeListings: number;
  loading: boolean;
}

/**
 * The only number this page can honestly show a stranger.
 *
 * Listings are publicly readable; tenant and agent counts are not, and inventing
 * "8K+ homes" for a platform with none is both untrue and disproved by scrolling
 * down. When there is nothing to count, the section says nothing.
 */
export const useLandingStats = (): LandingStats => {
  const [activeListings, setActiveListings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { count, error } = await supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true);

      if (error) console.error("Could not count listings:", error);
      setActiveListings(count ?? 0);
      setLoading(false);
    };

    void load();
  }, []);

  return { activeListings, loading };
};

export default useLandingStats;
