export interface Quest {
  id: string;
  title: string;
  blurb: string;
  /** Field names from the onboarding config, in the order they appear. */
  fields: readonly string[];
  /** Awarded on top of the fields' own points, for finishing the set. */
  bonus: number;
}

/**
 * The form, cut into five short asks.
 *
 * Sixteen questions on one screen reads as paperwork; three at a time reads as
 * progress. The grouping follows what a person is thinking about at that moment
 * — where, then what, then how much — rather than the order of the columns in
 * the table.
 *
 * move_in_date is deliberately absent. It duplicates desired_move_date and was
 * shown as "Flexible Move-In Date (Legacy)", which is a column name leaking
 * into a question.
 */
export const QUESTS: readonly Quest[] = [
  {
    id: "household",
    title: "Your household",
    blurb: "Who is moving, and what you earn. This is what a landlord asks first.",
    fields: ["household_size", "household_income"],
    bonus: 10,
  },
  {
    id: "where",
    title: "Where you want to live",
    blurb: "Name the places you would actually say yes to.",
    fields: ["desired_cities", "desired_state", "desired_zip_code", "preferred_locations"],
    bonus: 10,
  },
  {
    id: "home",
    title: "The home itself",
    blurb: "Size, type, and whether a pet is coming with you.",
    fields: ["desired_property_types", "min_bedrooms", "min_bathrooms", "pets", "pets_allowed"],
    bonus: 10,
  },
  {
    id: "budget",
    title: "Budget and timing",
    blurb: "The two numbers that decide what we can show you.",
    fields: ["max_monthly_rent", "desired_move_date", "move_date_flexibility"],
    bonus: 15,
  },
  {
    id: "about",
    title: "About you",
    blurb: "A short introduction. Landlords read this before anything else.",
    fields: ["bio"],
    bonus: 5,
  },
] as const;

export const questPoints = (quest: Quest, pointsFor: Record<string, number>): number =>
  quest.fields.reduce((sum, field) => sum + (pointsFor[field] ?? 0), 0) + quest.bonus;
