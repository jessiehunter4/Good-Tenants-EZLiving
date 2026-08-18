import { describe, expect, it } from "vitest";

import { EMPTY_GUARANTOR, countComplete, guarantorTotals, toNumber } from "./scenarioSchema";

describe("toNumber", () => {
  it("strips formatting people actually type", () => {
    expect(toNumber("3,200")).toBe(3200);
    expect(toNumber("$1,250,000")).toBe(1250000);
    expect(toNumber(" 450 ")).toBe(450);
  });

  it("returns null rather than NaN for anything that is not a number", () => {
    // A signup or a scenario must not fail because someone typed a word into a
    // money field, and NaN must never reach a numeric column.
    expect(toNumber("lots")).toBeNull();
    expect(toNumber("")).toBeNull();
    expect(toNumber(null)).toBeNull();
    expect(toNumber(undefined)).toBeNull();
    expect(toNumber("-")).toBeNull();
    expect(toNumber(".")).toBeNull();
  });

  it("keeps decimals and negatives", () => {
    expect(toNumber("2.5")).toBe(2.5);
    expect(toNumber("-1200")).toBe(-1200);
  });
});

describe("guarantorTotals", () => {
  it("adds assets and liabilities and nets them", () => {
    const totals = guarantorTotals({
      ...EMPTY_GUARANTOR,
      propertyAssets: "1,500,000",
      otherAssets: "250000",
      propertyLiabilities: "900000",
      otherLiabilities: "50,000",
    });

    expect(totals.totalAssets).toBe(1750000);
    expect(totals.totalLiabilities).toBe(950000);
    expect(totals.netPosition).toBe(800000);
  });

  it("treats blanks as zero rather than NaN", () => {
    const totals = guarantorTotals(EMPTY_GUARANTOR);

    expect(totals.totalAssets).toBe(0);
    expect(totals.netPosition).toBe(0);
  });

  it("reports a negative net position rather than clamping it", () => {
    const totals = guarantorTotals({
      ...EMPTY_GUARANTOR,
      otherAssets: "100",
      otherLiabilities: "500",
    });

    expect(totals.netPosition).toBe(-400);
  });
});

describe("countComplete", () => {
  it("counts a field as done only when it holds something", () => {
    expect(countComplete(["Irvine", "", undefined, 3200])).toEqual({ done: 2, total: 4 });
  });

  it("does not count whitespace as an answer", () => {
    expect(countComplete(["   "])).toEqual({ done: 0, total: 1 });
  });

  it("counts false and zero as answers, because they are", () => {
    expect(countComplete([false, 0])).toEqual({ done: 2, total: 2 });
  });
});
