/**
 * Profile strength, as points.
 *
 * Onboarding was a single form of sixteen fields with a progress bar that only
 * moved when the whole thing was saved. Points move on every answer, which is
 * the difference between filling in a form and getting somewhere.
 *
 * Weights are not arbitrary: a field is worth what it unlocks. Budget and cities
 * decide whether we can match anyone at all, so they score highest; a bio is
 * nice and scores least.
 */

export const FIELD_POINTS: Record<string, number> = {
  household_size: 8,
  household_income: 14,
  desired_cities: 14,
  desired_state: 6,
  desired_zip_code: 4,
  preferred_locations: 6,
  desired_property_types: 8,
  min_bedrooms: 6,
  min_bathrooms: 6,
  pets: 4,
  pets_allowed: 4,
  max_monthly_rent: 14,
  desired_move_date: 10,
  move_date_flexibility: 6,
  bio: 10,
};

export const MAX_POINTS = Object.values(FIELD_POINTS).reduce((sum, n) => sum + n, 0);

export interface Level {
  name: string;
  /** Points needed to reach it. */
  at: number;
  /** What the tenant can do once they are here. */
  unlocks: string;
}

export const LEVELS: readonly Level[] = [
  { name: "Getting started", at: 0, unlocks: "Save your search and come back to it" },
  { name: "Searcher", at: 25, unlocks: "See properties matched to your budget" },
  { name: "Applicant", at: 55, unlocks: "Apply without retyping any of this" },
  { name: "Verified renter", at: 80, unlocks: "Landlords can be shown your profile — with your approval" },
  { name: "Move-in ready", at: 100, unlocks: "Front of the queue on new listings" },
] as const;

/** A field counts when it holds an answer. Zero and false are answers. */
export const isAnswered = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return !Number.isNaN(value);
  return true;
};

export interface ProfileScore {
  points: number;
  max: number;
  percent: number;
  level: Level;
  nextLevel: Level | null;
  /** Points still needed for the next level, 0 at the top. */
  toNextLevel: number;
  answered: number;
  total: number;
}

export const scoreProfile = (values: Record<string, unknown>): ProfileScore => {
  let points = 0;
  let answered = 0;

  for (const [field, worth] of Object.entries(FIELD_POINTS)) {
    if (isAnswered(values[field])) {
      points += worth;
      answered += 1;
    }
  }

  const percent = Math.round((points / MAX_POINTS) * 100);

  // The highest level whose threshold has been passed.
  const level = [...LEVELS].reverse().find((candidate) => percent >= candidate.at) ?? LEVELS[0];
  const nextLevel = LEVELS.find((candidate) => candidate.at > percent) ?? null;

  return {
    points,
    max: MAX_POINTS,
    percent,
    level,
    nextLevel,
    toNextLevel: nextLevel ? nextLevel.at - percent : 0,
    answered,
    total: Object.keys(FIELD_POINTS).length,
  };
};
