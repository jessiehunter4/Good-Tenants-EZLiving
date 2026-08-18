import { describe, expect, it } from "vitest";

import { countInvitesByStatus, countProfilesByStatus, countUsersByRole } from "./counters";

describe("countUsersByRole", () => {
  it("counts each role", () => {
    const counts = countUsersByRole([
      { role: "tenant" },
      { role: "tenant" },
      { role: "agent" },
      { role: "landlord" },
      { role: "admin" },
    ]);

    expect(counts).toEqual({
      total: 5,
      tenants: 2,
      agents: 1,
      landlords: 1,
      admins: 1,
      unassigned: 0,
    });
  });

  // The regression this file exists for: the old reducer did acc[null]++ and
  // left NaN in the total, which rendered as a broken dashboard.
  it("counts an account with no role as unassigned, and keeps the total finite", () => {
    const counts = countUsersByRole([{ role: null }, { role: "tenant" }]);

    expect(counts.unassigned).toBe(1);
    expect(counts.total).toBe(2);
    expect(Number.isNaN(counts.total)).toBe(false);
  });

  it("does not lose a role it has never seen", () => {
    const counts = countUsersByRole([{ role: "lender" }, { role: "editor" }]);

    expect(counts.total).toBe(2);
    expect(counts.unassigned).toBe(2);
  });

  it("returns zeroes for no rows", () => {
    expect(countUsersByRole([]).total).toBe(0);
  });
});

describe("countInvitesByStatus", () => {
  it("counts the three known states", () => {
    const counts = countInvitesByStatus([
      { status: "pending" },
      { status: "accepted" },
      { status: "accepted" },
      { status: "declined" },
    ]);

    expect(counts).toEqual({ total: 4, pending: 1, accepted: 2, declined: 1 });
  });

  it("counts an unknown status in the total without inventing a bucket", () => {
    const counts = countInvitesByStatus([{ status: "expired" }, { status: null }]);

    expect(counts.total).toBe(2);
    expect(counts.pending + counts.accepted + counts.declined).toBe(0);
  });
});

describe("countProfilesByStatus", () => {
  it("tallies the profile stages", () => {
    const counts = countProfilesByStatus([
      { status: "incomplete" },
      { status: "incomplete" },
      { status: "verified" },
      { status: "premium" },
    ]);

    expect(counts).toEqual({ incomplete: 2, basic: 0, verified: 1, premium: 1 });
  });

  it("ignores a status outside the enum rather than adding a key", () => {
    const counts = countProfilesByStatus([{ status: "archived" }, { status: null }]);

    expect(counts).toEqual({ incomplete: 0, basic: 0, verified: 0, premium: 0 });
  });
});
