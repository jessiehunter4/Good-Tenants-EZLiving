import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bath, BedDouble, CalendarDays, PawPrint, Square } from "lucide-react";

import SiteLayout from "@/components/site/SiteLayout";
import ListingAttribution from "@/components/rentals/ListingAttribution";
import QualificationPanel from "@/components/rentals/QualificationPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { rentalBySlugQuery, retentionDaysQuery } from "@/hooks/rentals/useRentals";
import { formatRent, type RentalListing } from "@/features/rentals/listing";
import { STATUS_LABEL } from "@/features/rentals/listingStatus";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/** Carried across from the rentals site's listing detail page. */
const RentalDetail = () => {
  const { slug = "" } = useParams();
  const { data: retentionDays = 30 } = useQuery(retentionDaysQuery);
  const { data: listing, isLoading } = useQuery(rentalBySlugQuery(slug, retentionDays));

  useDocumentMeta({
    title: listing
      ? `${listing.displayAddress} — Good Tenants EZ Living`
      : "Rental — Good Tenants EZ Living",
    description: listing?.description ?? undefined,
    image: listing?.photos[0],
  });

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="page-shell py-16">
          <div className="h-72 animate-pulse rounded-2xl bg-clay/30" />
        </div>
      </SiteLayout>
    );
  }

  if (!listing) {
    return (
      <SiteLayout>
        <div className="page-shell py-24 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-espresso">
            This rental isn't available
          </h1>
          <p className="mt-3 text-espresso-muted">
            It may have been leased, or taken off the market.
          </p>
          <Button asChild className="mt-6 bg-espresso text-sand hover:bg-espresso/90">
            <Link to="/rentals">See what's available</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <article className="page-shell py-10">
        <Gallery listing={listing} />

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <Badge className="bg-espresso text-sand">{STATUS_LABEL[listing.status]}</Badge>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-espresso sm:text-4xl">
              {listing.displayAddress}
            </h1>
            <p className="mt-2 text-2xl font-bold text-espresso">{formatRent(listing.rent)}</p>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-espresso-muted">
              {listing.bedrooms != null && (
                <span className="flex items-center gap-1.5">
                  <BedDouble className="h-4 w-4" /> {listing.bedrooms} bedrooms
                </span>
              )}
              {listing.bathrooms != null && (
                <span className="flex items-center gap-1.5">
                  <Bath className="h-4 w-4" /> {listing.bathrooms} bathrooms
                </span>
              )}
              {listing.sqft != null && (
                <span className="flex items-center gap-1.5">
                  <Square className="h-4 w-4" /> {listing.sqft.toLocaleString("en-US")} sqft
                </span>
              )}
              {listing.petsAllowed != null && (
                <span className="flex items-center gap-1.5">
                  <PawPrint className="h-4 w-4" />
                  {listing.petsAllowed ? "Pets allowed" : "No pets"}
                </span>
              )}
              {listing.dateAvailable && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" /> Available {listing.dateAvailable}
                </span>
              )}
            </div>

            {listing.description && (
              <div className="article-content mt-8">
                {listing.description.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            )}

            <div className="mt-10">
              <ListingAttribution attribution={listing.attribution} />
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <QualificationPanel
              listing={{
                rent: listing.rent,
                minCreditScore: listing.minCreditScore,
                petsAllowed: listing.petsAllowed,
                dateAvailable: listing.dateAvailable,
                incomeMultiplier: listing.incomeMultiplier,
              }}
            />

            <Card className="p-6">
              <h2 className="text-lg font-bold text-espresso">Want to see it?</h2>

              {listing.showingAllowed ? (
                <>
                  <p className="mt-2 text-sm text-espresso-muted">
                    Prove you qualify once, then book a viewing here and reuse the same profile on
                    every other rental.
                  </p>
                  <Button
                    asChild
                    className="mt-4 w-full bg-espresso text-sand hover:bg-espresso/90"
                  >
                    <Link to="/prequalify">Check if I qualify</Link>
                  </Button>
                </>
              ) : (
                /*
                 * The feed forbids showings on this listing. Saying so is the
                 * honest move: offering a booking that has to be refused later
                 * wastes the renter's time and breaks the terms besides.
                 */
                <p className="mt-2 text-sm text-espresso-muted">
                  The listing agent isn't taking showing requests through third parties for this
                  home. You can still build a renter profile so you're ready for the next one.
                </p>
              )}

            </Card>
          </aside>
        </div>
      </article>
    </SiteLayout>
  );
};

const Gallery = ({ listing }: { listing: RentalListing }) => {
  if (listing.photos.length === 0) {
    return (
      <div className="flex aspect-[21/9] items-center justify-center rounded-2xl bg-sand-deep text-sm text-espresso-muted">
        No photos available for this listing
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-4">
      <img
        src={listing.photos[0]}
        alt=""
        className="aspect-[4/3] w-full rounded-2xl object-cover sm:col-span-4 sm:aspect-[21/9]"
      />
      {listing.photos.slice(1, 5).map((photo) => (
        <img
          key={photo}
          src={photo}
          alt=""
          loading="lazy"
          className="aspect-[4/3] w-full rounded-xl object-cover"
        />
      ))}
    </div>
  );
};

export default RentalDetail;
