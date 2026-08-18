export type StepState = "done" | "current" | "pending";

export interface OnboardingStep {
  id: string;
  label: string;
  /** What this step is for, shown when it is the current one. */
  detail: string;
  state: StepState;
}

/** Only the fields the progress depends on, so this stays testable. */
export interface TenantProgressInput {
  hasAccount: boolean;
  desiredCities: string[] | null;
  maxMonthlyRent: number | null;
  moveDate: string | null;
  householdSize: number | null;
  householdIncome: number | null;
  documentCount: number;
  status: string | null;
  isPreScreened: boolean | null;
}

const STEP_DEFINITIONS = [
  {
    id: "account",
    label: "Account",
    detail: "Your sign-in and contact details.",
    isDone: (input: TenantProgressInput) => input.hasAccount,
  },
  {
    id: "preferences",
    label: "Rental preferences",
    detail: "Where you want to live, your budget, and when you need to move.",
    isDone: (input: TenantProgressInput) =>
      Boolean(input.desiredCities?.length) && input.maxMonthlyRent !== null && Boolean(input.moveDate),
  },
  {
    id: "household",
    label: "Your household",
    detail: "Who is moving in, and what you earn — the figures a landlord asks for.",
    isDone: (input: TenantProgressInput) =>
      input.householdSize !== null && input.householdIncome !== null,
  },
  {
    id: "documents",
    label: "Documents",
    detail: "Payslips, references, identification. Uploaded once, reused everywhere.",
    isDone: (input: TenantProgressInput) => input.documentCount > 0,
  },
  {
    id: "verification",
    label: "Verification",
    detail: "We check your documents. Nothing is shared with a landlord until you approve it.",
    isDone: (input: TenantProgressInput) =>
      input.status === "verified" || input.status === "premium" || input.isPreScreened === true,
  },
] as const;

/**
 * The steps, and which one you are on.
 *
 * Exactly one step is "current": the first that is not done. Everything before
 * it is done, everything after is pending — so the rail cannot show two active
 * states or none, which is the failure people notice.
 */
export const buildTenantSteps = (input: TenantProgressInput): OnboardingStep[] => {
  const completion = STEP_DEFINITIONS.map((step) => step.isDone(input));
  const currentIndex = completion.indexOf(false);

  return STEP_DEFINITIONS.map((step, index) => ({
    id: step.id,
    label: step.label,
    detail: step.detail,
    state:
      completion[index] ? "done" : index === currentIndex ? "current" : "pending",
  }));
};

/** For the "3 of 5 complete" line. */
export const countDone = (steps: readonly OnboardingStep[]): number =>
  steps.filter((step) => step.state === "done").length;
