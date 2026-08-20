import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";

import ListingCard from "@/components/rentals/ListingCard";
import { Button } from "@/components/ui/button";
import { EMPTY_FILTERS, rentalsQuery, retentionDaysQuery } from "@/hooks/rentals/useRentals";
import { isPubliclyListed } from "@/features/rentals/listing";

const SHOWN = 6;
const SKELETONS = 3;

/**
 * Carried across from `comingsoonhomrentals-com/src/components/home/
 * FeaturedListings.tsx`: `max-w-6xl`, a three-up grid at `gap-6`, six
 * listings, and a "View All" link sitting opposite the heading.
 *
 * One departure. That component returns null when there is nothing to show,
 * which on an empty database leaves the page with no listings row at all and
 * no explanation. A rental site with no inventory should say so and offer the
 * thing that helps — filling in a profile before anything lands — rather than
 * quietly omitting the section.
 */
export const RentalsSection = () => {
  const { data: retentionDays = 30 } = useQuery(retentionDaysQuery);
  const { data = [], isLoading } = useQuery(rentalsQuery(EMPTY_FILTERS, retentionDays));
  const listings = data.filter(isPubliclyListed).slice(0, SHOWN);

  if (isLoading) {
    return (
      <section id="rentals" className="bg-background px-4 py-16">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="mb-8 text-2xl font-bold text-foreground md:text-3xl">
            Featured Listings
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: SKELETONS }, (_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (listings.length === 0) {
    return (
      <section id="rentals" className="bg-background px-4 py-16">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
            Featured Listings
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            Nothing is listed at this moment. Build your profile now and you will be first in line
            the day something suits you.
          </p>
          <Button
            asChild
            className="rounded-lg bg-cta-qualify px-8 py-3 text-lg font-semibold text-cta-qualify-foreground shadow-lg hover:bg-cta-qualify/90"
          >
            <Link to="/prequalify">Get Pre-Qualified</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section id="rentals" className="bg-background px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">Featured Listings</h2>
          <Link
            to="/rentals"
            className="flex items-center gap-1 font-medium text-cta-browse-ink hover:underline"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RentalsSection;
