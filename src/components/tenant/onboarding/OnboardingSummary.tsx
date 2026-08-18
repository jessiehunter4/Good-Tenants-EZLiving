import { Home } from "lucide-react";

import { formatCurrency } from "@/features/lending/products";

interface OnboardingSummaryProps {
  displayName: string | null;
  email: string | null;
  city: string | null;
  budget: number | null;
  moveDate: string | null;
}

const initials = (name: string | null, email: string | null) => {
  const source = name?.trim() || email?.split("@")[0] || "";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
};

const formatDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

/**
 * What this person is setting up, above the rail.
 *
 * Each line is omitted rather than shown empty: "Budget —" tells you nothing and
 * makes the panel look broken before the form has been filled in.
 */
export const OnboardingSummary = ({
  displayName,
  email,
  city,
  budget,
  moveDate,
}: OnboardingSummaryProps) => {
  const facts = [
    city ? { label: "Looking in", value: city } : null,
    budget ? { label: "Budget", value: `${formatCurrency(budget)} per month` } : null,
    moveDate ? { label: "Move date", value: formatDate(moveDate) } : null,
  ].filter((fact): fact is { label: string; value: string } => fact !== null);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-role-tenant/10 text-sm font-semibold text-role-tenant">
          {initials(displayName, email)}
        </span>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Welcome,</p>
          <p className="truncate font-semibold">{displayName || email || "there"}</p>
        </div>
      </div>

      {facts.length > 0 ? (
        <dl className="space-y-3 border-t pt-5">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                {fact.label}
              </dt>
              <dd className="font-medium">{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="flex items-start gap-3 border-t pt-5 text-sm text-muted-foreground">
          <Home className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>Fill in your preferences and a summary of your search appears here.</p>
        </div>
      )}
    </div>
  );
};

export default OnboardingSummary;
