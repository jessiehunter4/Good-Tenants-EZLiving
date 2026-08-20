import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import HeroSlider from "./HeroSlider";
import { HERO } from "@/features/landing/content";

/** Carried across from `comingsoonhomrentals-com/src/components/home/HeroSection.tsx`. */
export const HeroSection = () => (
  <section className="relative w-full">
    <HeroSlider />

    <div className="page-shell py-10 text-center">
      <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-espresso md:text-4xl lg:text-5xl">
        {HERO.title}
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-lg text-espresso-muted md:text-xl">
        {HERO.subtitle}
      </p>
      <p className="mx-auto mt-3 max-w-2xl text-base font-semibold text-espresso md:text-lg">
        {HERO.promise}{" "}
        <span className="text-cta-browse-ink">{HERO.promiseParts[0]}</span>{" "}
        <span className="text-cta-qualify-ink">{HERO.promiseParts[1]}</span>{" "}
        <span className="text-cta-browse-ink">{HERO.promiseParts[2]}</span>
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button
          asChild
          size="lg"
          className="bg-cta-browse px-8 text-cta-browse-foreground hover:bg-cta-browse/90"
        >
          <Link to="/rentals">Browse listings</Link>
        </Button>
        <Button
          asChild
          size="lg"
          className="bg-cta-qualify px-8 text-cta-qualify-foreground hover:bg-cta-qualify/90"
        >
          <Link to="/prequalify">Get pre-qualified</Link>
        </Button>
      </div>

      <p className="mt-4 text-sm text-espresso-muted">
        Already pre-qualified? You get first access to new listings.
      </p>
    </div>
  </section>
);

export default HeroSection;
