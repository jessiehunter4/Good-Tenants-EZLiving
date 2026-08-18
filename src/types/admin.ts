import type { Database } from "@/integrations/supabase/types";

/**
 * Shapes the admin screens actually receive.
 *
 * Built on the generated row types rather than restated by hand, so a column
 * that changes in the database shows up here as a compile error instead of as
 * undefined at runtime. This file exists because the admin hooks previously
 * passed `any[]` around — which is how a null role reached `role.charAt(0)` and
 * took the user table down.
 */

type Row<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type ProfileStatus = Database["public"]["Enums"]["profile_status"];

/** The account row as the `users` view returns it — every column nullable. */
export interface AdminUserRow {
  id: string | null;
  email: string | null;
  role: string | null;
  created_at: string | null;
  updated_at?: string | null;
}

/** What an embedded `profiles` lookup contributes. */
interface EmbeddedEmail {
  users?: { email: string | null } | null;
}

export type TenantProfileRow = Row<"tenant_profiles"> & EmbeddedEmail;
export type LandlordProfileRow = Row<"landlord_profiles"> & EmbeddedEmail;
export type RealtorProfileRow = Row<"realtor_profiles"> & EmbeddedEmail;

/** A profile flattened for display: email lifted out of the embed. */
export type TenantProfileListItem = TenantProfileRow & { email?: string | null };

/** Any role's profile, flattened, with the role attached for a mixed table. */
export type UnverifiedUser = (TenantProfileRow | LandlordProfileRow | RealtorProfileRow) & {
  email?: string | null;
  role: "tenant" | "agent" | "landlord";
};

/* UserStats stays declared in useUserStats, which owns it. Re-exported here so
   consumers have one import path for admin shapes. */
export type { UserStats } from "@/hooks/admin/useUserStats";

export type { ProfileStats, StatusCounts } from "@/hooks/admin/useProfileStats";

export interface InviteStats {
  total: number;
  pending: number;
  accepted: number;
  declined: number;
}

export const EMPTY_STATUS_COUNTS = {
  incomplete: 0,
  basic: 0,
  verified: 0,
  premium: 0,
} as const;
