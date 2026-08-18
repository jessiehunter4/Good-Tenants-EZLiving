
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface InviteStats {
  total: number;
  pending: number;
  accepted: number;
  declined: number;
}

export const useInviteStats = () => {
  const [loading, setLoading] = useState(true);
  const [inviteStats, setInviteStats] = useState<InviteStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    declined: 0,
  });

  const fetchInviteStats = async () => {
    try {
      const { data: invites, error: invitesError } = await supabase
        .from("invites")
        .select("status");
      
      if (invitesError) throw invitesError;
      
      /* Explicit, for the same reason as the role counts: indexing an
         accumulator by a status string turns an unexpected value into NaN. */
      const counts = { total: 0, pending: 0, accepted: 0, declined: 0 };

      for (const invite of invites ?? []) {
        counts.total += 1;
        if (invite.status === "pending") counts.pending += 1;
        else if (invite.status === "accepted") counts.accepted += 1;
        else if (invite.status === "declined") counts.declined += 1;
      }

      setInviteStats(counts);
    } catch (error) {
      console.error("Error fetching invite stats:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    inviteStats,
    loading,
    fetchInviteStats,
  };
};
