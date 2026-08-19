// Who has staff access, and changing it.
//
// Roles live in `user_roles`, one row per grant, and the display details live
// in `profiles`. Both are admin-readable, so this joins them in one query
// rather than reading the `users` view — the view collapses a person to their
// single highest role, which is the wrong shape for a screen whose whole job is
// showing and changing individual grants.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type StaffRole = "admin" | "editor";

export type StaffMember = {
  id: string;
  email: string | null;
  display_name: string | null;
  role: StaffRole;
};

const STAFF_KEY = ["admin", "staff"] as const;

type StaffRow = {
  user_id: string;
  role: string;
  profiles: { email: string | null; display_name: string | null } | null;
};

export function useStaff() {
  return useQuery({
    queryKey: STAFF_KEY,
    queryFn: async (): Promise<StaffMember[]> => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role, profiles!user_roles_user_id_fkey(email, display_name)")
        .in("role", ["admin", "editor"]);
      if (error) throw new Error(error.message);

      return ((data ?? []) as unknown as StaffRow[])
        .map((row) => ({
          id: row.user_id,
          email: row.profiles?.email ?? null,
          display_name: row.profiles?.display_name ?? null,
          role: row.role as StaffRole,
        }))
        // Admins first, then by whatever name we can show.
        .sort((a, b) =>
          a.role === b.role
            ? (a.email ?? "").localeCompare(b.email ?? "")
            : a.role === "admin"
              ? -1
              : 1,
        );
    },
  });
}

export function useGrantEditor() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => {
      const { data: profile, error: lookupError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      if (lookupError) throw new Error(lookupError.message);
      if (!profile) {
        throw new Error(`No account for ${email}. They need to sign up first.`);
      }

      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: profile.id, role: "editor" });
      if (error) {
        // A duplicate grant is not a failure worth alarming anyone about.
        if (error.code === "23505") return;
        throw new Error(error.message);
      }
    },
    onSuccess: () => client.invalidateQueries({ queryKey: STAFF_KEY }),
  });
}

export function useRevokeRole() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: StaffRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: STAFF_KEY }),
  });
}
