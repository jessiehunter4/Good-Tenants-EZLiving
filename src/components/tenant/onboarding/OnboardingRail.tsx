import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { OnboardingStep } from "@/features/tenant/onboardingSteps";

interface OnboardingRailProps {
  steps: OnboardingStep[];
}

/**
 * The vertical progress rail.
 *
 * Three states, told apart without relying on colour alone: done carries a tick,
 * current is a filled ring with its label in full contrast, pending is an empty
 * ring and muted. Someone who cannot distinguish green from grey still reads the
 * tick and the weight.
 */
export const OnboardingRail = ({ steps }: OnboardingRailProps) => (
  <ol className="relative space-y-1">
    {steps.map((step, index) => {
      const isLast = index === steps.length - 1;

      return (
        <li key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
          {!isLast && (
            <span
              className={cn(
                "absolute left-[15px] top-8 h-full w-px",
                step.state === "done" ? "bg-role-agent" : "bg-border",
              )}
              aria-hidden="true"
            />
          )}

          <span
            className={cn(
              "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-background transition-colors",
              step.state === "done" && "border-role-agent bg-role-agent text-white",
              step.state === "current" && "border-primary",
              step.state === "pending" && "border-border",
            )}
          >
            {step.state === "done" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  step.state === "current" ? "bg-primary" : "bg-transparent",
                )}
                aria-hidden="true"
              />
            )}
          </span>

          <div className="min-w-0 pt-1">
            <p
              className={cn(
                "text-xs font-semibold uppercase tracking-wide",
                step.state === "current" && "text-foreground",
                step.state === "done" && "text-muted-foreground",
                step.state === "pending" && "text-muted-foreground/70",
              )}
            >
              {step.label}
              <span className="sr-only">
                {step.state === "done" ? " — complete" : step.state === "current" ? " — in progress" : " — not started"}
              </span>
            </p>
            {step.state === "current" && (
              <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
            )}
          </div>
        </li>
      );
    })}
  </ol>
);

export default OnboardingRail;
