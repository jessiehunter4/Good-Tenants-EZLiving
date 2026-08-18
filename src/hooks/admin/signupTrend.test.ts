import { describe, expect, it } from "vitest";

import { bucketSignups } from "./signupTrend";

const NOW = new Date("2026-08-18T12:00:00Z");
const iso = (day: string) => `${day}T09:00:00Z`;

describe("bucketSignups", () => {
  it("returns one point per day in the window", () => {
    expect(bucketSignups([], 30, NOW)).toHaveLength(30);
  });

  it("keeps empty days as zeroes rather than dropping them", () => {
    const points = bucketSignups([{ created_at: iso("2026-08-18"), role: "tenant" }], 7, NOW);

    expect(points).toHaveLength(7);
    expect(points.slice(0, 6).every((point) => point.total === 0)).toBe(true);
    expect(points[6].total).toBe(1);
  });

  it("accumulates across the window", () => {
    const points = bucketSignups(
      [
        { created_at: iso("2026-08-16"), role: "tenant" },
        { created_at: iso("2026-08-18"), role: "agent" },
        { created_at: iso("2026-08-18"), role: "landlord" },
      ],
      7,
      NOW,
    );

    expect(points[points.length - 1].cumulative).toBe(3);
    // Cumulative never goes down.
    const values = points.map((point) => point.cumulative);
    expect([...values].sort((a, b) => a - b)).toEqual(values);
  });

  it("splits a day by role", () => {
    const points = bucketSignups(
      [
        { created_at: iso("2026-08-18"), role: "tenant" },
        { created_at: iso("2026-08-18"), role: "tenant" },
        { created_at: iso("2026-08-18"), role: "landlord" },
        { created_at: iso("2026-08-18"), role: "admin" },
      ],
      3,
      NOW,
    );
    const today = points[points.length - 1];

    expect(today.tenants).toBe(2);
    expect(today.landlords).toBe(1);
    expect(today.agents).toBe(0);
    // An admin still counts towards the total even though it has no series.
    expect(today.total).toBe(4);
  });

  it("ignores rows outside the window instead of clamping them to the edge", () => {
    const points = bucketSignups(
      [
        { created_at: iso("2026-01-01"), role: "tenant" },
        { created_at: iso("2026-08-18"), role: "tenant" },
      ],
      7,
      NOW,
    );

    expect(points[0].total).toBe(0);
    expect(points[points.length - 1].cumulative).toBe(1);
  });

  it("skips rows with no timestamp", () => {
    const points = bucketSignups([{ created_at: null, role: "tenant" }], 7, NOW);

    expect(points[points.length - 1].cumulative).toBe(0);
  });
});
