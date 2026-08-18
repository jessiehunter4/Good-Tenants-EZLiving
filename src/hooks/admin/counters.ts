/**
 * Counting, separated from fetching.
 *
 * These were inline reducers inside the hooks, which made them untestable
 * without a database — and both were wrong in the same way: they did
 * acc[value]++, so a null role or an unexpected status incremented an undefined
 * key and left NaN in a total. Neither threw. A dashboard showing NaN looks
 * broken; a dashboard showing an undercount looks fine, which is worse.
 */

export interface RoleCounts {
  total: number;
  tenants: number;
  agents: number;
  landlords: number;
  admins: number;
  /** Accounts holding no role, or one this build does not know about. */
  unassigned: number;
}

export interface InviteCounts {
  total: number;
  pending: number;
  accepted: number;
  declined: number;
}

export interface StatusCounts {
  incomplete: number;
  basic: number;
  verified: number;
  premium: number;
}

export const countUsersByRole = (rows: readonly { role: string | null }[]): RoleCounts => {
  const counts: RoleCounts = {
    total: 0,
    tenants: 0,
    agents: 0,
    landlords: 0,
    admins: 0,
    unassigned: 0,
  };

  for (const row of rows) {
    counts.total += 1;
    switch (row.role) {
      case "tenant":
        counts.tenants += 1;
        break;
      case "agent":
        counts.agents += 1;
        break;
      case "landlord":
        counts.landlords += 1;
        break;
      case "admin":
        counts.admins += 1;
        break;
      default:
        // Includes null: an account with no role is a real state, not an error.
        counts.unassigned += 1;
    }
  }

  return counts;
};

export const countInvitesByStatus = (
  rows: readonly { status: string | null }[],
): InviteCounts => {
  const counts: InviteCounts = { total: 0, pending: 0, accepted: 0, declined: 0 };

  for (const row of rows) {
    counts.total += 1;
    if (row.status === "pending") counts.pending += 1;
    else if (row.status === "accepted") counts.accepted += 1;
    else if (row.status === "declined") counts.declined += 1;
  }

  return counts;
};

export const countProfilesByStatus = (
  rows: readonly { status: string | null }[],
): StatusCounts => {
  const counts: StatusCounts = { incomplete: 0, basic: 0, verified: 0, premium: 0 };

  for (const row of rows) {
    if (row.status && row.status in counts) {
      counts[row.status as keyof StatusCounts] += 1;
    }
  }

  return counts;
};
