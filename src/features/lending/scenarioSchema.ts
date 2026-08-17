import * as z from "zod";

import { SCENARIO_PRODUCTS, SECURITY_TYPES, TRANSACTION_TYPES } from "./products";

/**
 * One schema for the whole scenario, not one per step.
 *
 * A scenario is saved as a draft from the first step onward, so almost
 * everything is optional here: an incomplete draft must be storable, or the
 * stepper becomes a wizard you cannot leave. What "complete" means is a
 * separate question, answered by the per-section counters, and submission is
 * where the real requirements are enforced.
 */

const money = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value));

export const propertySchema = z.object({
  address: z.string().trim().optional(),
  description: z.string().trim().optional(),
  securityType: z.enum(SECURITY_TYPES).optional(),
  propertyUse: z.string().trim().optional(),
  landSizeSqm: money,
  estimatedValue: money,
  currentDebt: money,
  comments: z.string().trim().max(10_000).optional(),
});

export const guarantorSchema = z.object({
  fullName: z.string().trim().optional(),
  employmentType: z.string().trim().optional(),
  propertyAssets: money,
  propertyLiabilities: money,
  otherAssets: money,
  otherLiabilities: money,
  outstandingTax: z.boolean().optional(),
  creditImpairments: z.boolean().optional(),
  comments: z.string().trim().max(10_000).optional(),
});

export const scenarioSchema = z.object({
  product: z.enum(SCENARIO_PRODUCTS),
  transactionType: z.enum(TRANSACTION_TYPES).optional(),

  properties: z.array(propertySchema).min(1).max(6),

  loanAmount: money,
  loanTermMonths: z.string().trim().optional(),
  interestPaymentMethod: z.string().trim().optional(),
  brokerFeePercent: z.string().trim().optional(),
  loanPurpose: z.string().trim().max(10_000).optional(),
  exitStrategy: z.string().trim().max(10_000).optional(),

  borrowingEntityType: z.string().trim().optional(),
  borrowingEntityName: z.string().trim().optional(),
  borrowingEntityAcn: z.string().trim().optional(),

  turnaroundToSettlement: z.string().trim().optional(),
  preferredValuer: z.string().trim().optional(),

  guarantors: z.array(guarantorSchema).max(6),

  additionalComments: z.string().trim().max(10_000).optional(),
});

export type ScenarioFormValues = z.infer<typeof scenarioSchema>;
export type PropertyValues = z.infer<typeof propertySchema>;
export type GuarantorValues = z.infer<typeof guarantorSchema>;

export const EMPTY_PROPERTY: PropertyValues = {
  address: "",
  description: "",
  securityType: undefined,
  propertyUse: "",
  landSizeSqm: "",
  estimatedValue: "",
  currentDebt: "",
  comments: "",
};

export const EMPTY_GUARANTOR: GuarantorValues = {
  fullName: "",
  employmentType: "",
  propertyAssets: "",
  propertyLiabilities: "",
  otherAssets: "",
  otherLiabilities: "",
  outstandingTax: undefined,
  creditImpairments: undefined,
  comments: "",
};

/** Digits only, so "1,250,000" and "$1.25m " do not reach the database. */
export function toNumber(value: string | undefined | null): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[^0-9.-]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * How many of a section's fields are filled, for the "3 of 6 complete"
 * counters. Counting is honest: a field is complete when it holds something,
 * not when it has been visited.
 */
export function countComplete(values: readonly (unknown | undefined)[]): {
  done: number;
  total: number;
} {
  const done = values.filter((value) => {
    if (value === undefined || value === null) return false;
    if (typeof value === "string") return value.trim() !== "";
    return true;
  }).length;
  return { done, total: values.length };
}

/** Net position, computed the same way the database computes it. */
export function guarantorTotals(guarantor: GuarantorValues) {
  const propertyAssets = toNumber(guarantor.propertyAssets) ?? 0;
  const otherAssets = toNumber(guarantor.otherAssets) ?? 0;
  const propertyLiabilities = toNumber(guarantor.propertyLiabilities) ?? 0;
  const otherLiabilities = toNumber(guarantor.otherLiabilities) ?? 0;

  const totalAssets = propertyAssets + otherAssets;
  const totalLiabilities = propertyLiabilities + otherLiabilities;

  return { totalAssets, totalLiabilities, netPosition: totalAssets - totalLiabilities };
}
