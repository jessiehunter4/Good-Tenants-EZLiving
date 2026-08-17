/**
 * The lending vocabulary, in one place.
 *
 * Every list here is also an enum in the database (scenario_product,
 * security_type, transaction_type). Where a value is stored it uses the
 * database spelling; the label is what a person reads. Adding an option means
 * adding it in both places — deliberately, because a value the database will
 * reject is worse than a missing option.
 */

export const SCENARIO_PRODUCTS = ["first_mortgage", "second_mortgage", "construction"] as const;
export type ScenarioProduct = (typeof SCENARIO_PRODUCTS)[number];

export const SECURITY_TYPES = [
  "residential",
  "commercial",
  "industrial",
  "agriculture_farming",
  "development_site",
  "vacant_land",
  "specialised",
  "residual_stock",
  "mid_construction",
] as const;
export type SecurityType = (typeof SECURITY_TYPES)[number];

export const SECURITY_TYPE_LABELS: Record<SecurityType, string> = {
  residential: "Residential",
  commercial: "Commercial",
  industrial: "Industrial",
  agriculture_farming: "Agriculture & farming",
  development_site: "Development site",
  vacant_land: "Vacant land",
  specialised: "Specialised",
  residual_stock: "Residual stock",
  mid_construction: "Mid-construction",
};

export const TRANSACTION_TYPES = [
  "purchase",
  "refinance",
  "equity_release",
  "development",
  "land_subdivision",
] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  purchase: "Purchase",
  refinance: "Refinance",
  equity_release: "Equity release",
  development: "Development",
  land_subdivision: "Land subdivision",
};

export interface ProductOption {
  value: ScenarioProduct;
  title: string;
  summary: string;
  /** Offered on the transaction-type control for this product. */
  transactions: readonly TransactionType[];
  /** Offered as security for this product. */
  securities: readonly SecurityType[];
  accentClass: string;
  badgeClass: string;
}

export const PRODUCT_OPTIONS: readonly ProductOption[] = [
  {
    value: "first_mortgage",
    title: "First mortgage",
    summary: "Refinance, purchase & equity release",
    transactions: ["refinance", "purchase", "equity_release"],
    securities: [
      "residential",
      "commercial",
      "industrial",
      "agriculture_farming",
      "development_site",
      "vacant_land",
      "specialised",
      "residual_stock",
    ],
    accentClass: "bg-role-tenant text-role-tenant-foreground hover:bg-role-tenant/90",
    badgeClass: "border-role-tenant bg-canvas-elevated text-role-tenant",
  },
  {
    value: "second_mortgage",
    title: "Second mortgage",
    summary: "Refinance & equity release",
    transactions: ["refinance", "equity_release"],
    securities: [
      "residential",
      "commercial",
      "industrial",
      "agriculture_farming",
      "development_site",
      "vacant_land",
      "specialised",
      "residual_stock",
    ],
    accentClass: "bg-role-landlord text-role-landlord-foreground hover:bg-role-landlord/90",
    badgeClass: "border-role-landlord bg-canvas-elevated text-role-landlord",
  },
  {
    value: "construction",
    title: "Construction",
    summary: "Development & land subdivision",
    transactions: ["development", "land_subdivision", "purchase"],
    securities: ["residential", "commercial", "industrial", "specialised", "mid_construction"],
    accentClass: "bg-role-agent text-role-agent-foreground hover:bg-role-agent/90",
    badgeClass: "border-role-agent bg-canvas-elevated text-role-agent",
  },
] as const;

export function findProduct(value: ScenarioProduct | null): ProductOption | undefined {
  return PRODUCT_OPTIONS.find((option) => option.value === value);
}

export function isScenarioProduct(value: string | null): value is ScenarioProduct {
  return value !== null && (SCENARIO_PRODUCTS as readonly string[]).includes(value);
}

export const LOAN_TERMS = [3, 6, 9, 12, 18, 24, 36] as const;

export const INTEREST_METHODS = [
  "Serviced monthly (interest only)",
  "Capitalised",
  "Prepaid",
  "Part serviced, part capitalised",
] as const;

export const BROKER_FEES = [0, 0.25, 0.5, 0.75, 1, 1.5, 2] as const;

export const BORROWING_ENTITY_TYPES = [
  "Corporate borrower",
  "Corporate trustee for a trust",
  "Individual",
  "Partnership",
  "SMSF",
] as const;

export const TURNAROUND_OPTIONS = [
  "Within a week",
  "Two to three weeks",
  "Within a month",
  "More than a month",
] as const;

export const EMPLOYMENT_TYPES = [
  "Self-employed",
  "PAYG full time",
  "PAYG part time",
  "Contractor",
  "Retired",
  "Not employed",
] as const;

export const PROPERTY_USES = [
  "Owner occupied",
  "Investment",
  "Vacant",
  "Under construction",
  "Mixed use",
] as const;

/** Reference shown to people: SC-000123. */
export function scenarioReference(reference: number | null | undefined): string {
  if (!reference) return "Draft";
  return `SC-${String(reference).padStart(6, "0")}`;
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "$0";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}
