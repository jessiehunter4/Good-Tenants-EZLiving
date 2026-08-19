import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Check, X } from "lucide-react";
import { toast } from "sonner";

import SiteLayout from "@/components/site/SiteLayout";
import PageHeading from "@/components/daily/PageHeading";
import EditorField from "@/components/admin/editor/EditorField";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { errorMessage } from "@/hooks/admin/crud";
import { rentalBySlugQuery, retentionDaysQuery } from "@/hooks/rentals/useRentals";
import { myRenterProfileQuery, toQualifiable } from "@/hooks/tenant/useRenterProfile";
import { useApplyToListing, useMyApplications } from "@/hooks/rentals/useApply";
import { qualifyForListing } from "@/features/tenant/qualification";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/**
 * Applying to a listing.
 *
 * Carried across from `comingsoonhomrentals-com/src/pages/Prescreen.tsx`, which
 * asked a renter for their contact details and their whole household situation
 * on every property. Here the profile already holds all of it, so the only
 * thing this page asks for is how to reach them — and it shows the verdict
 * before they commit, rather than after.
 */
const Apply = () => {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: retentionDays = 30 } = useQuery(retentionDaysQuery);
  const { data: listing, isLoading: listingLoading } = useQuery(
    rentalBySlugQuery(slug, retentionDays),
  );
  const { data: profile, isLoading: profileLoading } = useQuery({
    ...myRenterProfileQuery,
    enabled: Boolean(user),
  });
  const { data: applications = [] } = useMyApplications();
  const apply = useApplyToListing();

  const [contact, setContact] = useState({ fullName: "", email: "", mobileNumber: "" });

  useEffect(() => {
    if (user?.email) setContact((c) => (c.email ? c : { ...c, email: user.email ?? "" }));
  }, [user]);

  useDocumentMeta({
    title: listing ? `Apply — ${listing.displayAddress}` : "Apply",
    noindex: true,
  });

  if (listingLoading || profileLoading) {
    return (
      <SiteLayout>
        <div className="page-shell py-16">
          <div className="h-64 animate-pulse rounded-2xl bg-clay/30" />
        </div>
      </SiteLayout>
    );
  }

  if (!listing) {
    return (
      <SiteLayout>
        <div className="page-shell py-24 text-center">
          <h1 className="text-3xl font-extrabold text-espresso">This rental isn't available</h1>
          <Button asChild className="mt-6 bg-espresso text-sand hover:bg-espresso/90">
            <Link to="/rentals">See what's available</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const criteria = {
    rent: listing.rent,
    minCreditScore: listing.minCreditScore,
    petsAllowed: listing.petsAllowed,
    dateAvailable: listing.dateAvailable,
    incomeMultiplier: listing.incomeMultiplier,
  };

  const result = profile ? qualifyForListing(toQualifiable(profile), criteria) : null;
  const alreadyApplied = applications.some((a) => a.listing_id === listing.id);

  // A profile that cannot answer the question cannot make an application worth
  // recording — send them to finish it rather than storing an empty verdict.
  if (!profile || !result?.answerable) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
          <PageHeading
            eyebrow="Apply"
            title="Finish your profile first"
            intro={
              result?.missing.length
                ? `To apply we still need ${result.missing.join(", ")}. You only answer this once.`
                : "You only answer these questions once, and then they work on every listing."
            }
          />
          <Button asChild className="bg-espresso text-sand hover:bg-espresso/90">
            <Link to="/prequalify">Finish my profile</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const submit = () => {
    if (!contact.fullName.trim() || !contact.email.trim() || !contact.mobileNumber.trim()) {
      toast.error("We need a name, an email and a phone number to pass on.");
      return;
    }

    apply.mutate(
      {
        listingId: listing.id,
        listingAddress: listing.displayAddress,
        fullName: contact.fullName,
        email: contact.email,
        mobileNumber: contact.mobileNumber,
        numAdults: profile.household_size ?? 1,
        hasPets: profile.pets ?? false,
        numPets: profile.num_pets ?? 0,
        creditEstimate: profile.credit_score_estimate ?? "not_sure",
        earliestMoveDate:
          profile.earliest_move_date ?? profile.move_in_date ?? new Date().toISOString().slice(0, 10),
        latestMoveDate: profile.desired_move_date,
        householdIncome: Number(profile.household_income ?? 0),
        result,
      },
      {
        onSuccess: () => {
          toast.success("Application sent");
          navigate(`/rentals/${slug}`);
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
        <PageHeading
          eyebrow="Apply"
          title={listing.displayAddress}
          intro="Everything below comes from the profile you already filled in. Check it, tell us how to reach you, and send."
        />

        <Card className="p-6">
          <h2 className="text-lg font-bold text-espresso">
            {result.qualified ? "You qualify for this home" : "You fall short on this one"}
          </h2>
          <ul className="mt-3 space-y-2">
            {result.checks.map((check) => (
              <li key={check.id} className="flex items-start gap-2 text-sm text-espresso-muted">
                {check.outcome === "pass" && (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                )}
                {check.outcome === "fail" && (
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                )}
                {check.outcome === "warn" && (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                )}
                {check.message}
              </li>
            ))}
          </ul>

          {!result.qualified && (
            /*
             * Falling short does not block the application. The rule reads
             * self-reported numbers against a landlord's stated preference, and
             * neither is the last word — a co-signer, savings or a conversation
             * can change the answer. Refusing here would be the site deciding
             * something that is the landlord's to decide.
             */
            <p className="mt-4 rounded-lg bg-sand p-3 text-xs text-espresso-muted">
              You can still apply. These are the landlord's stated preferences against your own
              figures — a co-signer or a conversation can change the outcome.
            </p>
          )}
        </Card>

        {alreadyApplied ? (
          <Card className="mt-6 border-dashed p-8 text-center">
            <p className="font-semibold text-espresso">You have already applied to this home</p>
            <p className="mt-1 text-sm text-espresso-muted">
              The Jessie Hunter Team will be in touch. Applying twice will not move you up.
            </p>
            <Button asChild variant="outline" className="mt-4 border-clay text-espresso">
              <Link to="/rentals">Keep looking</Link>
            </Button>
          </Card>
        ) : (
          <Card className="mt-6 space-y-4 p-6">
            <h2 className="text-lg font-bold text-espresso">How should we reach you?</h2>

            <EditorField label="Full name" htmlFor="apply-name">
              <Input
                id="apply-name"
                value={contact.fullName}
                onChange={(e) => setContact({ ...contact, fullName: e.target.value })}
              />
            </EditorField>

            <div className="grid gap-3 sm:grid-cols-2">
              <EditorField label="Email" htmlFor="apply-email">
                <Input
                  id="apply-email"
                  type="email"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                />
              </EditorField>
              <EditorField label="Mobile" htmlFor="apply-phone">
                <Input
                  id="apply-phone"
                  type="tel"
                  value={contact.mobileNumber}
                  onChange={(e) => setContact({ ...contact, mobileNumber: e.target.value })}
                />
              </EditorField>
            </div>

            <Button
              onClick={submit}
              disabled={apply.isPending}
              className="w-full bg-espresso text-sand hover:bg-espresso/90"
            >
              {apply.isPending ? "Sending…" : "Send my application"}
            </Button>

            <p className="text-xs text-espresso-muted">
              Your profile is shared with this listing's agent so they can consider you. Nothing
              goes to anyone else.
            </p>
          </Card>
        )}
      </div>
    </SiteLayout>
  );
};

export default Apply;
