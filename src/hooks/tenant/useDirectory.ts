// The tenant directory, and asking to see more of it.
//
// Carried across from Good Tenants Hub's /tenants and /search-tenants. It reads
// `tenant_directory`, a view that applies each renter's per-field switches in
// SQL — a band the renter did not share comes back null, so the page cannot
// show it even by accident.
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Row } from "@/hooks/admin/crud";

type DirectoryView = Database["public"]["Views"]["tenant_directory"]["Row"];

/** `id` is a primary key; a view just cannot say so. */
export type DirectoryTenant = Omit<DirectoryView, "id"> & { id: string };

export type AccessRequest = Row<"directory_access_requests">;
export type PrivatePackage = Row<"tenant_private_packages">;

export type DirectoryFilters = {
  city: string;
  minBedrooms: number | null;
  maxRent: number | null;
  preScreenedOnly: boolean;
};

export const EMPTY_DIRECTORY_FILTERS: DirectoryFilters = {
  city: "",
  minBedrooms: null,
  maxRent: null,
  preScreenedOnly: false,
};

export function directoryQuery(filters: DirectoryFilters) {
  return queryOptions({
    queryKey: ["directory", filters],
    queryFn: async (): Promise<DirectoryTenant[]> => {
      let query = supabase.from("tenant_directory").select("*");

      if (filters.city.trim()) {
        query = query.contains("desired_cities", [filters.city.trim()]);
      }
      if (filters.minBedrooms != null) query = query.gte("min_bedrooms", filters.minBedrooms);
      if (filters.preScreenedOnly) query = query.eq("is_pre_screened", true);
      // Rent is filtered in the browser: a renter who did not share their range
      // has null here, and dropping them from a rent-filtered search would leak
      // the fact that they are outside it.

      const { data, error } = await query.order("updated_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as DirectoryTenant[];
    },
  });
}

export function directoryTenantQuery(id: string) {
  return queryOptions({
    queryKey: ["directory", "tenant", id],
    queryFn: async (): Promise<DirectoryTenant | null> => {
      const { data, error } = await supabase
        .from("tenant_directory")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data as DirectoryTenant) ?? null;
    },
  });
}

/** The requests this partner has made, so a page can show where each stands. */
export const myAccessRequestsQuery = queryOptions({
  queryKey: ["directory", "requests", "mine"],
  queryFn: async (): Promise<AccessRequest[]> => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return [];
    const { data, error } = await supabase
      .from("directory_access_requests")
      .select("*")
      .eq("requester_id", auth.user.id);
    if (error) throw new Error(error.message);
    return data ?? [];
  },
});

/**
 * The private package. Returns null rather than throwing when the request has
 * not been granted — RLS simply returns no rows, which is not an error.
 */
export function privatePackageQuery(tenantId: string) {
  return queryOptions({
    queryKey: ["directory", "package", tenantId],
    queryFn: async (): Promise<PrivatePackage | null> => {
      const { data, error } = await supabase
        .from("tenant_private_packages")
        .select("*")
        .eq("user_id", tenantId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function useRequestAccess() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ tenantId, purpose }: { tenantId: string; purpose: string }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("You need to be signed in to ask.");

      const { error } = await supabase.from("directory_access_requests").insert({
        requester_id: auth.user.id,
        tenant_id: tenantId,
        purpose,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ["directory", "requests"] }),
  });
}

/** Requests waiting on this renter, and the ones they have already decided. */
export const requestsAboutMeQuery = queryOptions({
  queryKey: ["directory", "requests", "about-me"],
  queryFn: async (): Promise<AccessRequest[]> => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return [];
    const { data, error } = await supabase
      .from("directory_access_requests")
      .select("*")
      .eq("tenant_id", auth.user.id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
});

export function useDecideRequest() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, granted }: { id: string; granted: boolean }) => {
      const { error } = await supabase
        .from("directory_access_requests")
        .update({ consent_granted: granted, decided_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ["directory", "requests"] }),
  });
}
