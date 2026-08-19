import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import SiteLayout from "@/components/site/SiteLayout";
import PageHeading from "@/components/daily/PageHeading";
import ListingCard from "@/components/rentals/ListingCard";
import RentalFiltersBar from "@/components/rentals/RentalFiltersBar";
import { Card } from "@/components/ui/card";
import {
  EMPTY_FILTERS,
  rentalsQuery,
  retentionDaysQuery,
  type RentalFilters,
} from "@/hooks/rentals/useRentals";
import { isPubliclyListed } from "@/features/rentals/listing";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

const SKELETON_COUNT = 6;

/**
 * The rentals search, carried across from the rentals site's home and search
 * pages. Suppressed listings never arrive — the read policy sees to that — and
 * dropped ones are filtered here, because the retention window is a setting
 * rather than a column.
 */
const Rentals = () => {
  const [filters, setFilters] = useState<RentalFilters>(EMPTY_FILTERS);
  const { data: retentionDays = 30 } = useQuery(retentionDaysQuery);
  const { data = [], isLoading, error } = useQuery(rentalsQuery(filters, retentionDays));

  const listings = useMemo(() => data.filter(isPubliclyListed), [data]);

  useDocumentMeta({
    title: "Rentals — Good Tenants EZ Living",
    description:
      "Irvine rentals, including homes listed as coming soon before they reach the open market.",
  });

  return (
    <SiteLayout>
      <div className="page-shell py-14">
        <PageHeading
          eyebrow="Rentals"
          title="Homes for rent in Irvine"
          intro="Including coming-soon listings you will not find on the big portals yet."
        />

        <RentalFiltersBar filters={filters} onChange={setFilters} />

        <p className="mt-4 text-sm text-espresso-muted">
          {isLoading
            ? "Loading…"
            : `${listings.length} ${listings.length === 1 ? "home" : "homes"}`}
        </p>

        <div className="mt-6">
          {error ? (
            <Card className="border-destructive/40 bg-destructive/5 p-6">
              <p className="font-semibold text-destructive">Couldn't load listings.</p>
              <p className="mt-1 text-sm text-espresso-muted">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </Card>
          ) : isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: SKELETON_COUNT }, (_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-clay/50 bg-card">
                  <div className="aspect-[4/3] animate-pulse bg-clay/40" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-28 animate-pulse rounded bg-clay/40" />
                    <div className="h-4 w-4/5 animate-pulse rounded bg-clay/30" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <Card className="border-dashed p-12 text-center">
              <p className="font-semibold text-espresso">Nothing matches those filters yet.</p>
              <p className="mt-1 text-sm text-espresso-muted">
                Widen the search, or build a renter profile and we'll tell you when something lands.
              </p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
};

export default Rentals;
