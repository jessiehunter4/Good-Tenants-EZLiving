import type { Session, User } from "@supabase/supabase-js";

/**
 * Local-only bypass of sign-in.
 *
 * This app's Supabase project no longer exists, so signing in is impossible:
 * the auth endpoint does not resolve, and Register fails for the same reason.
 * The bypass exists so the dashboards and onboarding flows can be reviewed for
 * what Phase 5 should carry across.
 *
 * Two independent conditions, both required:
 *
 *   1. `import.meta.env.DEV` must be true. Vite sets this to false in any
 *      production build, so a deployed bundle fails the check whatever the
 *      environment claims.
 *   2. `VITE_DEV_BYPASS_AUTH` must be exactly "1". Nothing is bypassed by
 *      default.
 *
 * Either alone would be a footgun. The variable alone means one copied config
 * unlocks every route in a real deployment; the DEV check alone unlocks every
 * developer's machine without asking. Together it takes a dev server and a
 * deliberate opt-in.
 *
 * Anything rendered under this must say so on screen. An unauthenticated view
 * that looks identical to a real one is how a misconfiguration survives review.
 */

export type BypassRole = "tenant" | "agent" | "landlord" | "admin";

const DEFAULT_ROLE: BypassRole = "admin";
const VALID_ROLES: readonly BypassRole[] = ["tenant", "agent", "landlord", "admin"];

export function isDevAuthBypass(): boolean {
  return import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH === "1";
}

/** Role to impersonate. Set VITE_DEV_BYPASS_ROLE to switch dashboards. */
export function devBypassRole(): BypassRole {
  const requested = import.meta.env.VITE_DEV_BYPASS_ROLE as string | undefined;
  return VALID_ROLES.includes(requested as BypassRole)
    ? (requested as BypassRole)
    : DEFAULT_ROLE;
}

const STUB_USER_ID = "00000000-0000-4000-8000-00000000dev0";

/**
 * A user object shaped like Supabase's, enough to satisfy the auth context.
 *
 * Cast rather than fully constructed: Supabase's User type carries a couple of
 * dozen fields this stub has no meaningful value for, and inventing them would
 * make the fake look more real than it is. The cast is confined to this file
 * and this file never runs in a production build.
 */
export function devBypassUser(): User {
  const role = devBypassRole();
  return {
    id: STUB_USER_ID,
    email: `dev-${role}@localhost.invalid`,
    app_metadata: { provider: "dev-bypass" },
    user_metadata: { role, full_name: `Development ${role}` },
    aud: "authenticated",
    created_at: new Date(0).toISOString(),
  } as unknown as User;
}

export function devBypassSession(): Session {
  return {
    access_token: "dev-bypass",
    refresh_token: "dev-bypass",
    expires_in: 3600,
    token_type: "bearer",
    user: devBypassUser(),
  } as unknown as Session;
}
