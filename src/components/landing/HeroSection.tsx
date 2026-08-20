import { Link } from "react-router-dom";

import HeroSlider from "./HeroSlider";
import ListingIdSearch from "./ListingIdSearch";
import { HERO } from "@/features/landing/content";

/**
 * Carried across from `comingsoonhomrentals-com/src/components/home/
 * HeroSection.tsx`, `ListingIdSearch.tsx` and `PrimaryCTAs.tsx`, which are
 * three components and one block of the page.
 *
 * The measurements are the source's, not chosen again here: a 60vh slider
 * rising to 70vh, `pt-8 pb-8` under it, the heading stepping 3xl/4xl/5xl, and
 * calls to action at `py-3 px-8` with `text-lg`. Anything that reads as a
 * decision — spacing, weight, order — was already made on a page that has seen
 * real traffic.
 */
export const HeroSection = () => (
  <>
    <section className="relative w-full">
      <HeroSlider />

      <div className="px-4 pb-8 pt-8 text-center">
        <h1 className="mb-4 text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl">
          {HERO.title}
        </h1>
        <p className="mx-auto mb-3 max-w-2xl text-lg text-muted-foreground md:text-xl">
          {HERO.subtitle}
        </p>
        <p className="mx-auto max-w-2xl text-base font-semibold text-foreground md:text-lg">
          {HERO.promise} <span className="text-cta-browse-ink">{HERO.promiseParts[0]}</span>{" "}
          <span className="text-cta-qualify-ink">{HERO.promiseParts[1]}</span>{" "}
          <span className="text-cta-browse-ink">{HERO.promiseParts[2]}</span>
        </p>
      </div>
    </section>

    <section className="bg-muted/30 px-4 py-6">
      <p className="mb-3 text-center text-sm text-muted-foreground">
        Have a listing ID? Look it up instantly.
      </p>
      <ListingIdSearch />
    </section>

    <section className="flex flex-col items-center justify-center px-4 py-8">
      <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
        <Link
          to="/rentals"
          className="rounded-lg bg-cta-browse px-8 py-3 text-lg font-semibold text-cta-browse-foreground shadow-lg transition hover:bg-cta-browse/90"
        >
          Browse Listings
        </Link>
        <Link
          to="/prequalify"
          className="rounded-lg bg-cta-qualify px-8 py-3 text-lg font-semibold text-cta-qualify-foreground shadow-lg transition hover:bg-cta-qualify/90"
        >
          Get Pre-Qualified Now
        </Link>
      </div>
      <p className="mt-4 text-center text-muted-foreground">
        Already pre-qualified? You get first access to new listings.
      </p>
    </section>
  </>
);

export default HeroSection;
