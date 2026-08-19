import { AlertTriangle, ShieldCheck } from "lucide-react";

import { lintFairHousing, type FairHousingFinding } from "@/features/compliance/fairHousing";

/**
 * What the fair housing lint found in this draft.
 *
 * Shown while writing rather than on save, because the point is to change the
 * sentence, not to be refused at the end. A blocking finding does stop the
 * publish; a review finding never does — it needs a person, and a person is
 * already here.
 */
export const FairHousingNotice = ({ copy }: { copy: string }) => {
  const findings = lintFairHousing(copy);
  if (copy.trim() === "") return null;

  const blocking = findings.filter((f) => f.severity === "block");
  const review = findings.filter((f) => f.severity === "review");

  if (findings.length === 0) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-espresso-muted">
        <ShieldCheck className="h-3.5 w-3.5 text-success" />
        Nothing flagged by the fair housing check.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {blocking.length > 0 && (
        <FindingList
          findings={blocking}
          tone="destructive"
          heading="Cannot be published as written"
        />
      )}
      {review.length > 0 && (
        <FindingList findings={review} tone="warning" heading="Worth a second look" />
      )}
    </div>
  );
};

const FindingList = ({
  findings,
  tone,
  heading,
}: {
  findings: FairHousingFinding[];
  tone: "destructive" | "warning";
  heading: string;
}) => (
  <div
    className={
      tone === "destructive"
        ? "rounded-lg border border-destructive/40 bg-destructive/5 p-3"
        : "rounded-lg border border-warning/40 bg-warning/5 p-3"
    }
  >
    <p
      className={
        tone === "destructive"
          ? "flex items-center gap-1.5 text-xs font-bold text-destructive"
          : "flex items-center gap-1.5 text-xs font-bold text-warning"
      }
    >
      <AlertTriangle className="h-3.5 w-3.5" />
      {heading}
    </p>
    <ul className="mt-1.5 space-y-1">
      {findings.map((finding, i) => (
        <li key={`${finding.phrase}-${i}`} className="text-xs text-espresso">
          <span className="font-semibold">“{finding.phrase}”</span> — {finding.reason}
        </li>
      ))}
    </ul>
  </div>
);

export default FairHousingNotice;
