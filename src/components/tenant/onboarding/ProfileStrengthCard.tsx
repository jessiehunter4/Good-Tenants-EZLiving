import { Sparkles, Trophy } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ProfileScore } from "@/features/tenant/profileScore";

interface ProfileStrengthCardProps {
  score: ProfileScore;
  /** Points gained since the last save, shown as a floating +N. */
  gained: number | null;
}

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * The score, as a ring that fills.
 *
 * A progress bar that only moves on save tells you nothing while you type. This
 * moves on every answer, names the level you are at, and says what the next one
 * gives you — the reason to keep going rather than the fact that you have not
 * finished.
 */
export const ProfileStrengthCard = ({ score, gained }: ProfileStrengthCardProps) => {
  const offset = CIRCUMFERENCE - (score.percent / 100) * CIRCUMFERENCE;

  return (
    <div className="relative rounded-2xl bg-card p-6 text-center shadow-sm ring-1 ring-border">
      {gained !== null && gained > 0 && (
        <span
          key={gained}
          className="pointer-events-none absolute right-6 top-6 animate-in fade-in slide-in-from-bottom-4 text-sm font-bold text-success duration-500"
        >
          +{gained}
        </span>
      )}

      <div className="relative mx-auto h-32 w-32">
        <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
          <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold tabular-nums">{score.percent}%</span>
          <span className="text-xs text-muted-foreground">
            {score.answered}/{score.total} answered
          </span>
        </div>
      </div>

      <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
        <Trophy className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        <span className="text-sm font-bold text-primary">{score.level.name}</span>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">{score.level.unlocks}</p>

      {score.nextLevel ? (
        <p
          className={cn(
            "mt-4 rounded-lg bg-muted px-3 py-2 text-xs font-medium",
            score.toNextLevel <= 10 && "bg-success/10 text-success",
          )}
        >
          {score.toNextLevel}% more to reach{" "}
          <span className="font-bold">{score.nextLevel.name}</span>
        </p>
      ) : (
        <p className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-success/10 px-3 py-2 text-xs font-bold text-success">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Profile complete
        </p>
      )}
    </div>
  );
};

export default ProfileStrengthCard;
