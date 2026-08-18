import { describe, expect, it } from "vitest";

import { buildTenantSteps, countDone, type TenantProgressInput } from "./onboardingSteps";

const base: TenantProgressInput = {
  hasAccount: true,
  desiredCities: null,
  maxMonthlyRent: null,
  moveDate: null,
  householdSize: null,
  householdIncome: null,
  documentCount: 0,
  status: "incomplete",
  isPreScreened: false,
};

describe("buildTenantSteps", () => {
  it("marks exactly one step as current", () => {
    const states = buildTenantSteps(base).map((step) => step.state);
    expect(states.filter((state) => state === "current")).toHaveLength(1);
  });

  it("puts the current step immediately after the last done one", () => {
    const steps = buildTenantSteps({
      ...base,
      desiredCities: ["Irvine"],
      maxMonthlyRent: 3200,
      moveDate: "2026-10-01",
    });

    expect(steps[1].state).toBe("done");
    expect(steps[2].state).toBe("current");
    expect(steps[3].state).toBe("pending");
  });

  it("has no current step once everything is done", () => {
    const steps = buildTenantSteps({
      hasAccount: true,
      desiredCities: ["Irvine"],
      maxMonthlyRent: 3200,
      moveDate: "2026-10-01",
      householdSize: 3,
      householdIncome: 92000,
      documentCount: 2,
      status: "verified",
      isPreScreened: true,
    });

    expect(countDone(steps)).toBe(5);
    expect(steps.some((step) => step.state === "current")).toBe(false);
  });

  it("does not count preferences as done when only part is filled", () => {
    const steps = buildTenantSteps({ ...base, desiredCities: ["Irvine"] });
    expect(steps[1].state).toBe("current");
  });
});
