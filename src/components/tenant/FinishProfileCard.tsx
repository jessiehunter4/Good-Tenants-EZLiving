import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { myRenterProfileQuery } from "@/hooks/tenant/useRenterProfile";
import { scoreProfile } from "@/features/tenant/profileScore";

/**
 * The prompt that used to be a redirect.
 *
 * Signing in with an unfinished profile sent a tenant to the onboarding form
 * and nowhere else — they could not reach their own dashboard until they
 * finished it. Landing on the dashboard is right; being told what is still
 * missing, and getting there in one click, is what the redirect was actually
 * for. It disappears once the profile is complete.
 */
export const FinishProfileCard = () => {
  const { data: profile, isLoading } = useQuery(myRenterProfileQuery);
  if (isLoading || !profile) return null;

  const score = scoreProfile(profile as unknown as Record<string, unknown>);
  if (score.percent >= 100) return null;

  return (
    <Card className="mb-6 border-primary/30 bg-primary/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold text-foreground">
            {score.percent === 0
              ? "Start your renter profile"
              : `Your profile is ${score.percent}% complete`}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {score.answered} of {score.total} answered.{" "}
            {score.nextLevel
              ? `${score.toNextLevel} points more to reach ${score.nextLevel.name} — ${score.nextLevel.unlocks.toLowerCase()}.`
              : "A complete profile is what lets a landlord say yes."}
          </p>
          <Progress value={score.percent} className="mt-3 h-2 max-w-sm" />
        </div>

        <Button asChild>
          <Link to="/onboard-tenant">
            Continue <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
};

export default FinishProfileCard;
