
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AdminUserRow } from "@/types/admin";
import { countUsersByRole } from "./counters";

export interface UserStats {
  total: number;
  tenants: number;
  agents: number;
  landlords: number;
  admins: number;
}

export const useUserStats = () => {
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats>({
    total: 0,
    tenants: 0,
    agents: 0,
    landlords: 0,
    admins: 0,
  });
  const [recentUsers, setRecentUsers] = useState<AdminUserRow[]>([]);

  const fetchUserStats = async () => {
    try {
      // Fetch user stats
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("role");

      if (usersError) throw usersError;
      
      const counts = countUsersByRole(users ?? []);

      setUserStats({
        total: counts.total,
        tenants: counts.tenants,
        agents: counts.agents,
        landlords: counts.landlords,
        admins: counts.admins,
      });

      // Fetch recent users
      const { data: recentUsersData, error: recentUsersError } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (recentUsersError) throw recentUsersError;
      setRecentUsers(recentUsersData ?? []);

    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    userStats,
    recentUsers,
    loading,
    fetchUserStats,
  };
};
