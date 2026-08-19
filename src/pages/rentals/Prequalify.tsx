import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Check, X } from "lucide-react";
import { toast } from "sonner";

import SiteLayout from "@/components/site/SiteLayout";
import PageHeading from "@/components/daily/PageHeading";
import EditorField from "@/components/admin/editor/EditorField";
import ListingCard from "@/components/rentals/ListingCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { errorMessage } from "@/hooks/admin/crud";
import { EMPTY_FILTERS, rentalsQuery, retentionDaysQuery } from "@/hooks/rentals/useRentals";
import {
  myRenterProfileQuery,
  toQualifiable,
  useSaveRenterProfile,
} from "@/hooks/tenant/useRenterProfile";
import { isPubliclyListed, type RentalListing } from "@/features/rentals/listing";
import {
  CREDIT_LABELS,
  CREDIT_OPTIONS,
  missingForQualification,
  qualifyForListing,
  type CreditEstimate,
  type QualifiableProfile,
} from "@/features/tenant/qualification";
import {
  PREQUALIFY_DEFAULTS,
  prequalifySchema,
  type PrequalifyForm,
} from "@/features/rentals/prequalifySchema";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/**
 * Prequalify once, then see which homes you actually qualify for.
 *
 * Carried across from `comingsoonhomrentals-com/src/pages/Prequalify.tsx`. The
 * rentals site asked these questions per property; asking once and reusing the
 * answer across every listing is the whole premise of the merge, so the results
 * below are every displayable listing scored against the same stored profile.
 */
const Prequalify = () => {
  const { data: saved, isLoading } = useQuery(myRenterProfileQuery);
  const { data: retentionDays = 30 } = useQuery(retentionDaysQuery);
  const { data: listings = [] } = useQuery(rentalsQuery(EMPTY_FILTERS, retentionDays));
  const save = useSaveRenterProfile();

  const form = useForm<PrequalifyForm>({
    resolver: zodResolver(prequalifySchema),
    defaultValues: PREQUALIFY_DEFAULTS,
  });

  // Fill the form once the stored profile arrives.
  useEffect(() => {
    if (!saved) return;
    form.reset({
      householdIncome: saved.household_income == null ? 0 : Number(saved.household_income),
      creditEstimate: (saved.credit_score_estimate as CreditEstimate | null) ?? "not_sure",
      numAdults: saved.household_size ?? 1,
      numChildren: 0,
      hasPets: saved.pets ?? false,
      numPets: saved.num_pets ?? 0,
      earliestMoveDate: saved.earliest_move_date ?? saved.move_in_date ?? "",
      latestMoveDate: saved.desired_move_date ?? "",
      maxRent: saved.max_monthly_rent == null ? null : Number(saved.max_monthly_rent),
      minBedrooms: saved.min_bedrooms,
    });
  }, [saved, form]);

  const profile: QualifiableProfile | null = useMemo(
    () => (saved ? toQualifiable(saved) : null),
    [saved],
  );

  useDocumentMeta({
    title: "Prequalify — Good Tenants EZ Living",
    description:
      "Answer once and see which Irvine rentals you qualify for, instead of re-entering it on every property.",
  });

  const submit = form.handleSubmit((values) => {
    save.mutate({
      household_income: values.householdIncome,
      credit_score_estimate: values.creditEstimate,
      household_size: values.numAdults + values.numChildren,
      pets: values.hasPets,
      num_pets: values.hasPets ? values.numPets : 0,
      earliest_move_date: values.earliestMoveDate,
      desired_move_date: values.latestMoveDate || null,
      max_monthly_rent: values.maxRent,
      min_bedrooms: values.minBedrooms,
    }, {
      onSuccess: () => toast.success("Saved. Your results are below."),
      onError: (e) => toast.error(errorMessage(e)),
    });
  });

  const hasPets = form.watch("hasPets");

  return (
    <SiteLayout>
      <div className="page-shell py-14">
        <PageHeading
          eyebrow="Renters"
          title="Prove you qualify, once"
          intro="Answer these once and every listing tells you where you stand — instead of filling in the same form on each property."
        />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <Card className="h-fit p-6">
            <form onSubmit={submit} className="space-y-4">
              <EditorField
                label="Monthly household income"
                htmlFor="pq-income"
                hint="Before tax, everyone who will be on the lease."
                error={form.formState.errors.householdIncome?.message}
              >
                <Input id="pq-income" type="number" inputMode="numeric" {...form.register("householdIncome")} />
              </EditorField>

              <EditorField label="Credit" htmlFor="pq-credit">
                <Select
                  value={form.watch("creditEstimate")}
                  onValueChange={(v) => form.setValue("creditEstimate", v as CreditEstimate)}
                >
                  <SelectTrigger id="pq-credit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CREDIT_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {CREDIT_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </EditorField>

              <div className="grid gap-3 sm:grid-cols-2">
                <EditorField label="Adults" htmlFor="pq-adults">
                  <Input id="pq-adults" type="number" {...form.register("numAdults")} />
                </EditorField>
                <EditorField label="Children" htmlFor="pq-children">
                  <Input id="pq-children" type="number" {...form.register("numChildren")} />
                </EditorField>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="pq-pets"
                  checked={hasPets}
                  onCheckedChange={(v) => form.setValue("hasPets", v)}
                />
                <Label htmlFor="pq-pets">I have pets</Label>
              </div>

              {hasPets && (
                <EditorField label="How many" htmlFor="pq-numpets">
                  <Input id="pq-numpets" type="number" {...form.register("numPets")} />
                </EditorField>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <EditorField
                  label="Earliest move"
                  htmlFor="pq-earliest"
                  error={form.formState.errors.earliestMoveDate?.message}
                >
                  <Input id="pq-earliest" type="date" {...form.register("earliestMoveDate")} />
                </EditorField>
                <EditorField label="Latest move" htmlFor="pq-latest">
                  <Input id="pq-latest" type="date" {...form.register("latestMoveDate")} />
                </EditorField>
              </div>

              <Button
                type="submit"
                disabled={save.isPending}
                className="w-full bg-espresso text-sand hover:bg-espresso/90"
              >
                {save.isPending ? "Saving…" : saved ? "Update my profile" : "Save my profile"}
              </Button>

              <p className="text-xs text-espresso-muted">
                Shared only with the landlords and agents you approve.
              </p>
            </form>
          </Card>

          <div className="min-w-0">
            {isLoading ? (
              <div className="h-40 animate-pulse rounded-2xl bg-clay/30" />
            ) : !profile || missingForQualification(profile).length > 0 ? (
              <Card className="border-dashed p-10 text-center">
                <p className="font-semibold text-espresso">Your results appear here</p>
                <p className="mt-1 text-sm text-espresso-muted">
                  {profile && missingForQualification(profile).length > 0
                    ? `Still needed: ${missingForQualification(profile).join(", ")}.`
                    : "Fill in the form and every available rental will tell you where you stand."}
                </p>
              </Card>
            ) : (
              <Results profile={profile} listings={listings.filter(isPubliclyListed)} />
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
};

const Results = ({
  profile,
  listings,
}: {
  profile: QualifiableProfile;
  listings: RentalListing[];
}) => {
  const scored = listings.map((listing) => ({
    listing,
    result: qualifyForListing(profile, {
      rent: listing.rent,
      minCreditScore: listing.minCreditScore,
      petsAllowed: listing.petsAllowed,
      dateAvailable: listing.dateAvailable,
      incomeMultiplier: listing.incomeMultiplier,
    }),
  }));

  const qualified = scored.filter((s) => s.result.qualified);
  const rest = scored.filter((s) => !s.result.qualified);

  if (scored.length === 0) {
    return (
      <Card className="border-dashed p-10 text-center">
        <p className="font-semibold text-espresso">Nothing is listed right now</p>
        <p className="mt-1 text-sm text-espresso-muted">
          Your profile is saved. It will be waiting when something lands.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-xl font-bold tracking-tight text-espresso">
          You qualify for {qualified.length} of {scored.length}
        </h2>
        {qualified.length === 0 ? (
          <Card className="border-dashed p-8 text-center text-sm text-espresso-muted">
            Nothing currently listed matches — the reasons are below, and they change as new homes
            arrive.
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {qualified.map(({ listing }) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      {rest.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold tracking-tight text-espresso">
            Where you fall short
          </h2>
          <div className="space-y-3">
            {rest.map(({ listing, result }) => (
              <Card key={listing.id} className="p-4">
                <Link
                  to={`/rentals/${listing.slug ?? listing.id}`}
                  className="font-semibold text-espresso hover:underline"
                >
                  {listing.displayAddress}
                </Link>
                <ul className="mt-2 space-y-1">
                  {result.checks.map((check) => (
                    <li
                      key={check.id}
                      className="flex items-start gap-2 text-sm text-espresso-muted"
                    >
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
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Prequalify;
