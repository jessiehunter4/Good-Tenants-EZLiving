import { describe, expect, it } from "vitest";
import {
  countByStatus,
  LEAD_STATUSES,
  nextStatuses,
  QUESTION_STATUSES,
} from "./inboxStatus";

describe("nextStatuses", () => {
  it("never offers to move a row to the status it is already in", () => {
    expect(nextStatuses(QUESTION_STATUSES, "new")).toEqual(["triaged", "answered", "spam"]);
  });

  it("offers everything when the current status is unrecognised", () => {
    expect(nextStatuses(QUESTION_STATUSES, "")).toHaveLength(QUESTION_STATUSES.length);
  });
});

describe("countByStatus", () => {
  it("counts every status, including the ones with nothing in them", () => {
    const counts = countByStatus(
      [{ status: "new" }, { status: "new" }, { status: "converted" }],
      LEAD_STATUSES,
    );
    expect(counts).toEqual({ new: 2, contacted: 0, converted: 1, archived: 0 });
  });

  it("ignores a status the table should not contain rather than counting NaN", () => {
    // The daily's dashboard did `acc[row.status]++` on an unseeded key and
    // rendered NaN. Starting from zero for every known status is the fix.
    const counts = countByStatus([{ status: "bogus" }], LEAD_STATUSES);
    expect(counts.new).toBe(0);
    expect(Object.values(counts).every(Number.isFinite)).toBe(true);
  });
});
