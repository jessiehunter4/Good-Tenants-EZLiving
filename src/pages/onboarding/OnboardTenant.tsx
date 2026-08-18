import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, PartyPopper } from "lucide-react";

import ProfileForm from "@/components/shared/form/ProfileForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ProfileStrengthCard from "@/components/tenant/onboarding/ProfileStrengthCard";
import QuestList from "@/components/tenant/onboarding/QuestList";
import { useTenantOnboarding } from "@/hooks/useTenantOnboarding";
import { getTenantOnboardingFields } from "@/config/tenantOnboardingFields";
import { QUESTS, questPoints } from "@/features/tenant/onboardingQuests";
import { FIELD_POINTS, isAnswered, scoreProfile } from "@/features/tenant/profileScore";

/**
 * Tenant onboarding, as a run of short quests rather than one long form.
 *
 * Sixteen questions on a single screen is paperwork. Three at a time, with a
 * score that moves as you answer and a level that says what the next one gives
 * you, is progress you can feel — same fields, same table, different experience.
 */
const OnboardTenant = () => {
  const { form, onSubmit, isLoading, handleCancel } = useTenantOnboarding();
  const { toast } = useToast();
  const allFields = getTenantOnboardingFields();

  const [questIndex, setQuestIndex] = useState(0);
  const [gained, setGained] = useState<number | null>(null);
  const lastPoints = useRef(0);

  const values = form.watch();
  const score = useMemo(() => scoreProfile(values ?? {}), [values]);

  // A floating +N whenever the score rises, so answering a field visibly pays.
  if (score.points !== lastPoints.current) {
    const delta = score.points - lastPoints.current;
    lastPoints.current = score.points;
    if (delta > 0) setTimeout(() => setGained(delta), 0);
  }

  const progressByQuest = useMemo(() => {
    const entries = QUESTS.map((quest) => [
      quest.id,
      {
        done: quest.fields.filter((field) => isAnswered(values?.[field])).length,
        total: quest.fields.length,
      },
    ]);
    return Object.fromEntries(entries) as Record<string, { done: number; total: number }>;
  }, [values]);

  const quest = QUESTS[questIndex];
  const questFields = useMemo(
    () => allFields.filter((field) => quest.fields.includes(field.name)),
    [allFields, quest],
  );
  const isLastQuest = questIndex === QUESTS.length - 1;

  const advance = () => {
    const progress = progressByQuest[quest.id];
    if (progress.done === progress.total) {
      toast({
        title: `${quest.title} complete`,
        description: `+${questPoints(quest, FIELD_POINTS)} points. ${
          score.nextLevel
            ? `${score.toNextLevel}% to ${score.nextLevel.name}.`
            : "Your profile is complete."
        }`,
      });
    }
    setQuestIndex((index) => Math.min(index + 1, QUESTS.length - 1));
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="page-shell py-8 lg:py-12">
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6 text-muted-foreground">
          <Link to="/">
            <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
            <ProfileStrengthCard score={score} gained={gained} />
            <QuestList
              activeIndex={questIndex}
              progressByQuest={progressByQuest}
              onSelect={setQuestIndex}
            />
          </aside>

          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-primary/5 p-4">
              <PartyPopper className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <p className="text-sm">
                <span className="font-semibold">Quest {questIndex + 1} of {QUESTS.length}</span>
                {" — "}
                <span className="text-muted-foreground">{quest.blurb}</span>
              </p>
            </div>

            <ProfileForm
              title={quest.title}
              description={`Worth ${questPoints(quest, FIELD_POINTS)} points.`}
              form={form}
              onSubmit={async (submitted) => {
                await onSubmit(submitted);
              }}
              isSubmitting={isLoading}
              onCancel={isLastQuest ? handleCancel : advance}
              fields={questFields}
              submitButtonText={isLastQuest ? "Finish and save" : "Save progress"}
              cancelButtonText={isLastQuest ? "Back to home" : "Next quest →"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardTenant;
