import { describe, expect, it } from "vitest";

import {
  PRODUCT_OPTIONS,
  SECURITY_TYPE_LABELS,
  SECURITY_TYPES,
  findProduct,
  formatCurrency,
  isScenarioProduct,
  scenarioReference,
} from "./products";

describe("scenarioReference", () => {
  it("pads to a stable width so references line up in a list", () => {
    expect(scenarioReference(1)).toBe("SC-000001");
    expect(scenarioReference(123456)).toBe("SC-123456");
  });

  it("says Draft when there is no reference yet", () => {
    expect(scenarioReference(null)).toBe("Draft");
    expect(scenarioReference(undefined)).toBe("Draft");
  });
});

describe("formatCurrency", () => {
  it("formats an amount without cents", () => {
    expect(formatCurrency(1250000)).toContain("1,250,000");
  });

  it("shows zero rather than nothing for a missing amount", () => {
    expect(formatCurrency(null)).toBe("$0");
    expect(formatCurrency(undefined)).toBe("$0");
    expect(formatCurrency(Number.NaN)).toBe("$0");
  });
});

describe("product configuration", () => {
  it("recognises only the three products", () => {
    expect(isScenarioProduct("first_mortgage")).toBe(true);
    expect(isScenarioProduct("bridging")).toBe(false);
    expect(isScenarioProduct(null)).toBe(false);
  });

  it("finds a product by value", () => {
    expect(findProduct("construction")?.title).toBe("Construction");
    expect(findProduct(null)).toBeUndefined();
  });

  // The form renders these straight into selects, so a value the database would
  // reject must not be offerable.
  it("only offers security types the database accepts", () => {
    for (const product of PRODUCT_OPTIONS) {
      for (const security of product.securities) {
        expect(SECURITY_TYPES).toContain(security);
      }
    }
  });

  it("has a label for every security type", () => {
    for (const security of SECURITY_TYPES) {
      expect(SECURITY_TYPE_LABELS[security]).toBeTruthy();
    }
  });

  it("offers mid-construction only on the construction product", () => {
    for (const product of PRODUCT_OPTIONS) {
      const offered = product.securities.includes("mid_construction");
      expect(offered).toBe(product.value === "construction");
    }
  });
});
