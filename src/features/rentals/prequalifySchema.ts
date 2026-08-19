import { z } from "zod";
import { CREDIT_LABELS, type CreditEstimate } from "./qualification";

/**
 * What the prequalify form asks.
 *
 * Carried across from the rentals site's Prequalify page and the shape of
 * `tenant_prequalification_profiles`. The fields the table declares NOT NULL
 * are the required ones here — a half-filled prequalification is not useful to
 * anyone, and the point of the form is that answering it once is enough.
 */
export const CREDIT_OPTIONS = Object.keys(CREDIT_LABELS) as CreditEstimate[];

export const prequalifySchema = z.object({
  householdIncome: z.coerce
    .number({ invalid_type_error: "Enter your monthly household income" })
    .positive("Enter your monthly household income")
    .max(10_000_000),
  creditEstimate: z.enum(["excellent", "good", "fair", "poor", "not_sure"]),
  numAdults: z.coerce.number().int().min(1).max(20),
  numChildren: z.coerce.number().int().min(0).max(20),
  hasPets: z.boolean(),
  numPets: z.coerce.number().int().min(0).max(20),
  earliestMoveDate: z.string().min(1, "When could you move?"),
  latestMoveDate: z.string(),
  maxRent: z.coerce.number().min(0).max(10_000_000).nullable(),
  minBedrooms: z.coerce.number().int().min(0).max(20).nullable(),
});

export type PrequalifyForm = z.infer<typeof prequalifySchema>;

export const PREQUALIFY_DEFAULTS: PrequalifyForm = {
  householdIncome: 0,
  creditEstimate: "not_sure",
  numAdults: 1,
  numChildren: 0,
  hasPets: false,
  numPets: 0,
  earliestMoveDate: "",
  latestMoveDate: "",
  maxRent: null,
  minBedrooms: null,
};
