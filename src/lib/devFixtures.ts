/**
 * Sample rows for the development stub.
 *
 * These exist so the dashboards can be evaluated as interfaces. Empty tables
 * show you the column headers and nothing else: not how a status badge renders,
 * not whether a long name wraps, not what the verification queue looks like
 * with items in it. Those are the questions worth asking of this app before
 * deciding what Phase 5 should rebuild.
 *
 * ---------------------------------------------------------------------------
 * These are fabricated. Every row below is invented.
 * ---------------------------------------------------------------------------
 * The amber banner across the top of the app says so on every screen, which is
 * the only reason it is acceptable to show them at all. If you screenshot a
 * dashboard for anyone, the banner has to stay in the frame.
 *
 * Dev only. Never reachable from a production build.
 */

const DAY = 86_400_000;

/** Dates relative to now, so the data never looks stale. */
function daysAgo(days: number): string {
  return new Date(Date.now() - days * DAY).toISOString();
}

/**
 * Names drawn from a wide range of origins, as a real Irvine tenant base would
 * be. Placeholder data that is all one demographic quietly shapes how the
 * people reading it picture the users.
 */
const USERS = [
  { id: "u-01", email: "amara.okafor@example.com", role: "tenant", created_at: daysAgo(2), updated_at: daysAgo(2) },
  { id: "u-02", email: "j.almeida@example.com", role: "tenant", created_at: daysAgo(5), updated_at: daysAgo(1) },
  { id: "u-03", email: "wei.zhang@example.com", role: "tenant", created_at: daysAgo(9), updated_at: daysAgo(9) },
  { id: "u-04", email: "s.mahmoud@example.com", role: "tenant", created_at: daysAgo(14), updated_at: daysAgo(3) },
  { id: "u-05", email: "priya.raghunathan@example.com", role: "agent", created_at: daysAgo(31), updated_at: daysAgo(4) },
  { id: "u-06", email: "devon.ashworth@example.com", role: "agent", created_at: daysAgo(48), updated_at: daysAgo(6) },
  { id: "u-07", email: "m.okonkwo@example.com", role: "landlord", created_at: daysAgo(60), updated_at: daysAgo(8) },
  { id: "u-08", email: "t.lindqvist@example.com", role: "landlord", created_at: daysAgo(72), updated_at: daysAgo(12) },
  { id: "u-09", email: "r.castellanos@example.com", role: "landlord", created_at: daysAgo(88), updated_at: daysAgo(20) },
  { id: "u-10", email: "ops@goodtenants.example", role: "admin", created_at: daysAgo(120), updated_at: daysAgo(1) },
];

const TENANT_PROFILES = [
  { id: "u-01", status: "verified", is_pre_screened: true, screening_status: "approved", household_income: 9200, household_size: 2, max_monthly_rent: 3600, desired_cities: ["Irvine"], move_in_date: daysAgo(-30), created_at: daysAgo(2), updated_at: daysAgo(2) },
  { id: "u-02", status: "premium", is_pre_screened: true, screening_status: "approved", household_income: 14500, household_size: 3, max_monthly_rent: 5200, desired_cities: ["Irvine", "Tustin"], move_in_date: daysAgo(-14), created_at: daysAgo(5), updated_at: daysAgo(1) },
  { id: "u-03", status: "basic", is_pre_screened: false, screening_status: "pending", household_income: 6800, household_size: 1, max_monthly_rent: 2600, desired_cities: ["Irvine"], move_in_date: daysAgo(-45), created_at: daysAgo(9), updated_at: daysAgo(9) },
  { id: "u-04", status: "incomplete", is_pre_screened: false, screening_status: "not_started", household_income: null, household_size: null, max_monthly_rent: null, desired_cities: [], move_in_date: null, created_at: daysAgo(14), updated_at: daysAgo(3) },
];

const LISTINGS = [
  { id: "l-01", title: "Two bedroom condo, Woodbridge", price: 3850, is_active: true, city: "Irvine", bedrooms: 2, bathrooms: 2, created_at: daysAgo(4) },
  { id: "l-02", title: "Four bedroom house, Northwood", price: 5200, is_active: true, city: "Irvine", bedrooms: 4, bathrooms: 3, created_at: daysAgo(11) },
  { id: "l-03", title: "Townhouse, Turtle Rock", price: 4400, is_active: true, city: "Irvine", bedrooms: 3, bathrooms: 2.5, created_at: daysAgo(18) },
  { id: "l-04", title: "Condo, Quail Hill", price: 4100, is_active: false, city: "Irvine", bedrooms: 2, bathrooms: 2, created_at: daysAgo(64) },
];

const INVITES = [
  { id: "i-01", email: "n.varga@example.com", status: "pending", created_at: daysAgo(1) },
  { id: "i-02", email: "k.osei@example.com", status: "pending", created_at: daysAgo(3) },
  { id: "i-03", email: "l.fontaine@example.com", status: "accepted", created_at: daysAgo(16) },
  { id: "i-04", email: "h.nakamura@example.com", status: "accepted", created_at: daysAgo(29) },
  { id: "i-05", email: "b.kowalczyk@example.com", status: "declined", created_at: daysAgo(41) },
];

const INTEGRATIONS = [
  { id: "int-01", name: "Screening provider", status: "active", created_at: daysAgo(90) },
  { id: "int-02", name: "Rent reporting", status: "active", created_at: daysAgo(55) },
  { id: "int-03", name: "Document storage", status: "inactive", created_at: daysAgo(140) },
];

const INTEGRATION_REQUESTS = [
  { id: "ir-01", integration_id: "int-01", status: "pending", created_at: daysAgo(2) },
  { id: "ir-02", integration_id: "int-02", status: "approved", created_at: daysAgo(21) },
];

const FIXTURES: Readonly<Record<string, readonly unknown[]>> = {
  users: USERS,
  tenant_profiles: TENANT_PROFILES,
  realtor_profiles: USERS.filter((u) => u.role === "agent"),
  landlord_profiles: USERS.filter((u) => u.role === "landlord"),
  listings: LISTINGS,
  invites: INVITES,
  integrations: INTEGRATIONS,
  integration_requests: INTEGRATION_REQUESTS,
  integration_usage: [],
  integration_audit_log: [],
};

/** Rows for a table, or an empty list when nothing is defined for it. */
export function fixturesFor(table: string): readonly unknown[] {
  return FIXTURES[table] ?? [];
}
