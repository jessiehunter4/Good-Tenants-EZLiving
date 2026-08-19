import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { myRenterProfileQuery, toQualifiable } from "@/hooks/tenant/useRenterProfile";
import { qualifyForListing, type QualifiableListing } from "@/features/tenant/qualification";

/**
 * Where a signed-in renter stands on this listing.
 *
 * This is the payoff of phase 03. The rentals site asked for income, credit and
 * dates on every property; the answers now live on the renter's one profile, so
 * a listing can say where they stand without asking anything.
 */
export const QualificationPanel = ({
  listing,
  applyTo,
}: {
  listing: QualifiableListing;
  /** The slug to apply against. Omitted where there is nothing to apply to. */
  applyTo?: string;
}) => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useQuery({
    ...myRenterProfileQuery,
    enabled: Boolean(user),
  });

  if (!user) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-bold text-espresso">Do you qualify?</h2>
        <p className="mt-2 text-sm text-espresso-muted">
          Answer three questions once and every listing will tell you where you stand — including
          this one.
        </p>
        <Button asChild className="mt-4 w-full bg-espresso text-sand hover:bg-espresso/90">
          <Link to="/register?role=tenant">Build my renter profile</Link>
        </Button>
      </Card>
    );
  }

  if (isLoading || !profile) {
    return <div className="h-40 animate-pulse rounded-xl bg-clay/30" />;
  }

  const result = qualifyForListing(toQualifiable(profile), listing);

  if (!result.answerable) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-bold text-espresso">Almost there</h2>
        <p className="mt-2 text-sm text-espresso-muted">
          To tell you where you stand on this home we still need {result.missing.join(", ")}.
        </p>
        <Button asChild className="mt-4 w-full bg-espresso text-sand hover:bg-espresso/90">
          <Link to="/prequalify">Finish my profile</Link>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold text-espresso">
        {result.qualified ? "You qualify for this home" : "You fall short on this one"}
      </h2>

      <ul className="mt-3 space-y-2">
        {result.checks.map((check) => (
          <li key={check.id} className="flex items-start gap-2 text-sm text-espresso-muted">
            {check.outcome === "pass" && <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />}
            {check.outcome === "fail" && <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />}
            {check.outcome === "warn" && (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            )}
            {check.message}
          </li>
        ))}
      </ul>

      {applyTo && (
        <Button asChild className="mt-4 w-full bg-espresso text-sand hover:bg-espresso/90">
          <Link to={`/rentals/${applyTo}/apply`}>Apply with my profile</Link>
        </Button>
      )}

      <p className="mt-4 text-xs text-espresso-muted">
        Based on the profile you already filled in. Nothing here is shared with a landlord until
        you approve it.
      </p>
    </Card>
  );
};

export default QualificationPanel;
