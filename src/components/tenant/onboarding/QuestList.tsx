import { Check, Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { FIELD_POINTS } from "@/features/tenant/profileScore";
import { QUESTS, questPoints } from "@/features/tenant/onboardingQuests";

interface QuestListProps {
  activeIndex: number;
  /** How many of each quest's fields are answered. */
  progressByQuest: Record<string, { done: number; total: number }>;
  onSelect: (index: number) => void;
}

export const QuestList = ({ activeIndex, progressByQuest, onSelect }: QuestListProps) => (
  <ol className="space-y-2">
    {QUESTS.map((quest, index) => {
      const progress = progressByQuest[quest.id] ?? { done: 0, total: quest.fields.length };
      const complete = progress.done === progress.total;
      const isActive = index === activeIndex;
      // Nothing is truly locked — jumping ahead is allowed — but a quest with
      // no answers yet is shown as not started.
      const untouched = progress.done === 0 && !isActive;

      return (
        <li key={quest.id}>
          <button
            type="button"
            onClick={() => onSelect(index)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
              isActive && "border-primary bg-primary/5",
              !isActive && complete && "border-success/30 bg-success/5",
              !isActive && !complete && "border-border hover:bg-muted/60",
            )}
            aria-current={isActive ? "step" : undefined}
          >
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                complete && "bg-success text-success-foreground",
                !complete && isActive && "bg-primary text-primary-foreground",
                !complete && !isActive && "bg-muted text-muted-foreground",
              )}
            >
              {complete ? <Check className="h-4 w-4" /> : untouched ? <Lock className="h-3 w-3" /> : index + 1}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{quest.title}</span>
              <span className="block text-xs text-muted-foreground">
                {progress.done}/{progress.total} answered
              </span>
            </span>

            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
                complete ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
              )}
            >
              {questPoints(quest, FIELD_POINTS)} pts
            </span>
          </button>
        </li>
      );
    })}
  </ol>
);

export default QuestList;
