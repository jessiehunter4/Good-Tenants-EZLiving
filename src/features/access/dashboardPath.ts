/**
 * Where a signed-in account belongs.
 *
 * This switch was written out five times — in `useRedirectAuthenticated`,
 * `Auth`, `Dashboard`, `CreateProperty` and the onboarding hook — and they had
 * already drifted: two of them sent an admin to `/admin-dashboard`, one had no
 * admin case at all and dropped them on the generic `/dashboard`, and one
 * treated an unknown role as a tenant. A rule copied five times is a rule with
 * five chances to be wrong, and nothing in the type system was watching any of
 * them.
 *
 * It lives in `features/` and takes an argument rather than reading context,
 * so the routing decision can be tested without a database, a session or a
 * render — which is the whole point of the split.
 */

/** The dashboard for an account with no role, or a role we do not know. */
export const FALLBACK_DASHBOARD = '/dashboard';

/**
 * Roles that have a dashboard of their own.
 *
 * `admin` is here even though it is not self-assignable at registration: the
 * question this map answers is "where does this account land", not "may this
 * account exist".
 */
const DASHBOARD_BY_ROLE: Readonly<Record<string, string>> = {
  tenant: '/dashboard-tenant',
  agent: '/dashboard-agent',
  landlord: '/dashboard-landlord',
  admin: '/admin-dashboard',
  lender: '/lender',
};

/**
 * The path this role should land on.
 *
 * An unknown or absent role returns the generic dashboard rather than guessing
 * at one: sending someone to the wrong role's screen is worse than sending them
 * somewhere plain, because a role-guarded route will bounce them straight back
 * out and the loop is invisible to whoever is stuck in it.
 */
export function dashboardPathFor(role: string | null | undefined): string {
  if (role === null || role === undefined) return FALLBACK_DASHBOARD;
  return DASHBOARD_BY_ROLE[role] ?? FALLBACK_DASHBOARD;
}

/**
 * Whether a path is one of the role dashboards.
 *
 * Used to keep a redirect from firing when the visitor is already where they
 * belong, which would otherwise replace their history entry on every render.
 */
export function isDashboardPath(path: string): boolean {
  return path === FALLBACK_DASHBOARD || Object.values(DASHBOARD_BY_ROLE).includes(path);
}
