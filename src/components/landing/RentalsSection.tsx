import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import ListingCard from "@/components/rentals/ListingCard";
import { rentalsQuery, retentionDaysQuery, EMPTY_FILTERS } from "@/hooks/rentals/useRentals";
import { isPubliclyListed } from "@/features/rentals/listing";

const SHOWN = 3;

/**
 * Live listings, or an honest empty state.
 *
 * This used to read the platform's own `listings` table — the one a landlord
 * fills in about their own property, which has nothing in it. The inventory the
 * business actually runs on arrives from the MLS feed, so that is what "available
 * now" now shows, through the same compliance layer as the rentals pages: a
 * suppressed listing never reaches the browser, a masked address stays masked,
 * and a listing past its retention window is not shown at all.
 *
 * The empty state stays. Filling this row with invented properties would not be
 * a placeholder, it would be a false advertisement.
 */
export const RentalsSection = () => {
  const { data: retentionDays = 30 } = useQuery(retentionDaysQuery);
  const { data = [], isLoading } = useQuery(rentalsQuery(EMPTY_FILTERS, retentionDays));

  const listings = data.filter(isPubliclyListed).slice(0, SHOWN);

  return (
    <section id="rentals" className="bg-background py-20 sm:py-28">
      <div className="page-shell">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-espresso sm:text-4xl">
          Available now
        </h2>

        {isLoading && (
          <p className="mt-10 text-center font-medium text-espresso-muted">Loading…</p>
        )}

        {!isLoading && listings.length === 0 && (
          <div className="mx-auto mt-10 max-w-xl rounded-2xl bg-clay p-10 text-center">
            <p className="font-bold text-espresso">No properties listed yet</p>
            <p className="mt-2 font-medium text-espresso-muted">
              Build your profile now and you will be ready to apply the day something suits you.
            </p>
            <Button asChild className="mt-6 bg-espresso text-sand hover:bg-espresso/90">
              <Link to="/register?role=tenant">Build my profile</Link>
            </Button>
          </div>
        )}

        {listings.length > 0 && (
          <>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Button asChild className="bg-espresso text-sand hover:bg-espresso/90">
                <Link to="/rentals">See every rental</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default RentalsSection;
