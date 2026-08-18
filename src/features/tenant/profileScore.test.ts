import { describe, expect, it } from "vitest";

import { FIELD_POINTS, LEVELS, MAX_POINTS, isAnswered, scoreProfile } from "./profileScore";
import { QUESTS } from "./onboardingQuests";

describe("isAnswered", () => {
  it("treats zero and false as answers, because they are", () => {
    expect(isAnswered(0)).toBe(true);
    expect(isAnswered(false)).toBe(true);
  });

  it("does not count blanks, whitespace or empty lists", () => {
    expect(isAnswered("")).toBe(false);
    expect(isAnswered("   ")).toBe(false);
    expect(isAnswered([])).toBe(false);
    expect(isAnswered(null)).toBe(false);
    expect(isAnswered(undefined)).toBe(false);
  });
});

describe("scoreProfile", () => {
  it("starts at zero", () => {
    const score = scoreProfile({});
    expect(score.points).toBe(0);
    expect(score.percent).toBe(0);
    expect(score.level.name).toBe("Getting started");
  });

  it("reaches exactly 100 percent when everything is answered", () => {
    const full = Object.fromEntries(Object.keys(FIELD_POINTS).map((field) => [field, "x"]));
    const score = scoreProfile(full);

    expect(score.points).toBe(MAX_POINTS);
    expect(score.percent).toBe(100);
    expect(score.nextLevel).toBeNull();
    expect(score.toNextLevel).toBe(0);
  });

  it("never reports a level above the points earned", () => {
    const score = scoreProfile({ max_monthly_rent: 3200, desired_cities: ["Irvine"] });
    expect(score.percent).toBeLessThan(LEVELS[2].at);
    expect(score.level.at).toBeLessThanOrEqual(score.percent);
  });

  it("counts the fields answered, not just the points", () => {
    const score = scoreProfile({ household_size: 3, bio: "hello" });
    expect(score.answered).toBe(2);
    expect(score.total).toBe(Object.keys(FIELD_POINTS).length);
  });
});

describe("quests", () => {
  // A field in a quest but missing from the scoring table would be worth zero,
  // so filling it in would move nothing and the meter would look broken.
  it("only asks for fields that carry points", () => {
    for (const quest of QUESTS) {
      for (const field of quest.fields) {
        expect(FIELD_POINTS[field], `${field} in "${quest.title}"`).toBeGreaterThan(0);
      }
    }
  });

  it("covers every scored field exactly once", () => {
    const asked = QUESTS.flatMap((quest) => quest.fields);
    expect(new Set(asked).size).toBe(asked.length);
    expect([...asked].sort()).toEqual(Object.keys(FIELD_POINTS).sort());
  });
});
