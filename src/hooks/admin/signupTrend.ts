export interface TrendPoint {
  date: string;
  label: string;
  tenants: number;
  landlords: number;
  agents: number;
  total: number;
  cumulative: number;
}

export interface SignupRow {
  created_at: string | null;
  role: string | null;
}

/**
 * Signups bucketed by day, with every day in the window present.
 *
 * Pure so the arithmetic can be tested without a database or a clock: `now` is
 * passed in rather than read. Empty days are kept as zeroes — dropping them
 * draws a straight line across a gap where nothing happened and implies growth
 * that did not occur.
 */
/**
 * A day key in the viewer's own timezone.
 *
 * toISOString() was used for this originally, which converts to UTC — so the
 * buckets were built at local midnight and then labelled with UTC dates. Every
 * bucket was shifted by the offset, and east of Greenwich a signup landed in the
 * wrong day. Only visible outside UTC, which is exactly the kind of bug that
 * ships.
 */
const dayKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

export const bucketSignups = (
  rows: readonly SignupRow[],
  days: number,
  now: Date,
): TrendPoint[] => {
  const since = new Date(now);
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const buckets = new Map<string, TrendPoint>();
  for (let index = 0; index < days; index += 1) {
    const day = new Date(since);
    day.setDate(since.getDate() + index);
    const key = dayKey(day);
    buckets.set(key, {
      date: key,
      label: day.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      tenants: 0,
      landlords: 0,
      agents: 0,
      total: 0,
      cumulative: 0,
    });
  }

  for (const row of rows) {
    if (!row.created_at) continue;
    const point = buckets.get(dayKey(new Date(row.created_at)));
    // Rows outside the window are ignored rather than clamped into the edges,
    // which would put a spike on day one that never happened.
    if (!point) continue;

    if (row.role === "tenant") point.tenants += 1;
    else if (row.role === "landlord") point.landlords += 1;
    else if (row.role === "agent") point.agents += 1;
    point.total += 1;
  }

  let running = 0;
  return Array.from(buckets.values()).map((point) => {
    running += point.total;
    return { ...point, cumulative: running };
  });
};
