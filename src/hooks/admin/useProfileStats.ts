
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { TenantProfileListItem, UnverifiedUser } from "@/types/admin";
import { countProfilesByStatus } from "./counters";

/* Named for what it holds. It was `ProfileStatus`, which reads as a status and
   is actually a tally of them — and collided with the real enum. */
export interface StatusCounts {
  incomplete: number;
  basic: number;
  verified: number;
  premium: number;
}

export interface ProfileStats {
  tenants: StatusCounts;
  agents: StatusCounts;
  landlords: StatusCounts;
}

export const useProfileStats = () => {
  const [loading, setLoading] = useState(true);
  const [profileStats, setProfileStats] = useState<ProfileStats>({
    tenants: { incomplete: 0, basic: 0, verified: 0, premium: 0 },
    agents: { incomplete: 0, basic: 0, verified: 0, premium: 0 },
    landlords: { incomplete: 0, basic: 0, verified: 0, premium: 0 },
  });
  const [recentTenants, setRecentTenants] = useState<TenantProfileListItem[]>([]);
  const [unverifiedUsers, setUnverifiedUsers] = useState<UnverifiedUser[]>([]);

  const fetchProfileStats = async () => {
    try {
      // Fetch profile stats
      const fetchStatusCounts = async (table: "tenant_profiles" | "realtor_profiles" | "landlord_profiles") => {
        const { data, error } = await supabase
          .from(table)
          .select("status");
        
        if (error) throw error;
        
        return countProfilesByStatus(data ?? []);
      };

      const tenantProfileStats = await fetchStatusCounts("tenant_profiles");
      const agentProfileStats = await fetchStatusCounts("realtor_profiles");
      const landlordProfileStats = await fetchStatusCounts("landlord_profiles");

      setProfileStats({
        tenants: tenantProfileStats,
        agents: agentProfileStats,
        landlords: landlordProfileStats,
      });

      // Fetch recent tenant profiles with their user data
      const { data: recentTenantsData, error: recentTenantsError } = await supabase
        .from("tenant_profiles")
        .select(`
          *,
          users:profiles!tenant_profiles_id_fkey (email)
        `)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (recentTenantsError) throw recentTenantsError;
      
      // Format the data to include email from the users table
      const formattedTenants = recentTenantsData.map((tenant) => ({
        ...tenant,
        email: tenant.users?.email
      }));
      
      setRecentTenants(formattedTenants);

      // Fetch unverified users
      await fetchUnverifiedUsers();
      
    } catch (error) {
      console.error("Error fetching profile stats:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchUnverifiedUsers = async () => {
    try {
      // Fetch tenant profiles
      const { data: unverifiedTenants, error: unverifiedTenantsError } = await supabase
        .from("tenant_profiles")
        .select(`
          *,
          users:profiles!tenant_profiles_id_fkey (email)
        `)
        .in('status', ['incomplete', 'basic'])
        .order("created_at", { ascending: false });
      
      if (unverifiedTenantsError) throw unverifiedTenantsError;

      // Fetch agent profiles
      const { data: unverifiedAgents, error: unverifiedAgentsError } = await supabase
        .from("realtor_profiles")
        .select(`
          *,
          users:profiles!realtor_profiles_id_fkey (email)
        `)
        .in('status', ['incomplete', 'basic'])
        .order("created_at", { ascending: false });
      
      if (unverifiedAgentsError) throw unverifiedAgentsError;

      // Fetch landlord profiles
      const { data: unverifiedLandlords, error: unverifiedLandlordsError } = await supabase
        .from("landlord_profiles")
        .select(`
          *,
          users:profiles!landlord_profiles_id_fkey (email)
        `)
        .in('status', ['incomplete', 'basic'])
        .order("created_at", { ascending: false });
      
      if (unverifiedLandlordsError) throw unverifiedLandlordsError;

      // Format all the unverified users to include email and role
      const formattedUnverifiedTenants = unverifiedTenants.map((tenant) => ({
        ...tenant,
        email: tenant.users?.email,
        role: 'tenant' as const,
      }));

      const formattedUnverifiedAgents = unverifiedAgents.map((agent) => ({
        ...agent,
        email: agent.users?.email,
        role: 'agent' as const,
      }));

      const formattedUnverifiedLandlords = unverifiedLandlords.map((landlord) => ({
        ...landlord,
        email: landlord.users?.email,
        role: 'landlord' as const,
      }));

      // Combine all unverified users
      const allUnverifiedUsers = [
        ...formattedUnverifiedTenants,
        ...formattedUnverifiedAgents,
        ...formattedUnverifiedLandlords
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setUnverifiedUsers(allUnverifiedUsers);
    } catch (error) {
      console.error("Error fetching unverified users:", error);
      throw error;
    }
  };

  return {
    profileStats,
    recentTenants,
    unverifiedUsers,
    loading,
    fetchProfileStats,
  };
};
