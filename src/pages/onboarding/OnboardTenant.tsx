import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import ProfileForm from "@/components/shared/form/ProfileForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import OnboardingRail from "@/components/tenant/onboarding/OnboardingRail";
import OnboardingSummary from "@/components/tenant/onboarding/OnboardingSummary";
import { useAuth } from "@/contexts/AuthContext";
import { useTenantOnboarding } from "@/hooks/useTenantOnboarding";
import useTenantProgress from "@/hooks/tenant/useTenantProgress";
import { countDone } from "@/features/tenant/onboardingSteps";
import { getTenantOnboardingFields } from "@/config/tenantOnboardingFields";

/**
 * Tenant onboarding: the form, with the whole journey visible beside it.
 *
 * The form alone answered "what do you want from me now" but never "how much of
 * this is left", which is the question that decides whether someone finishes.
 * The rail is derived from the profile itself, so it cannot claim a step is done
 * when the data behind it is missing.
 */
const OnboardTenant = () => {
  const { user } = useAuth();
  const { form, onSubmit, isLoading, handleCancel } = useTenantOnboarding();
  const { steps, displayName, city, budget, moveDate, loading } = useTenantProgress();
  const formFields = getTenantOnboardingFields();

  const done = countDone(steps);
  const percent = Math.round((done / steps.length) * 100);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6 text-muted-foreground">
          <Link to="/">
            <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <Card>
              <CardContent className="space-y-8 p-6">
                <OnboardingSummary
                  displayName={displayName}
                  email={user?.email ?? null}
                  city={city}
                  budget={budget}
                  moveDate={moveDate}
                />

                <div className="space-y-3 border-t pt-5">
                  <div className="flex items-baseline justify-between">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Your progress
                    </p>
                    <p className="text-xs font-medium tabular-nums">
                      {done} of {steps.length}
                    </p>
                  </div>
                  <Progress value={percent} aria-label={`${percent}% complete`} />
                </div>

                {!loading && <OnboardingRail steps={steps} />}
              </CardContent>
            </Card>
          </aside>

          <div>
            <ProfileForm
              title="Your rental preferences"
              description="Where you want to live, what you can spend, and when you need to move. You can change all of it later."
              form={form}
              onSubmit={onSubmit}
              isSubmitting={isLoading}
              onCancel={handleCancel}
              fields={formFields}
              submitButtonText="Save and continue"
              cancelButtonText="Back"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardTenant;
