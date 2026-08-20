import { Link } from "react-router-dom";

/**
 * Carried across from `comingsoonhomrentals-com/src/components/home/
 * FinalCTA.tsx`: two cards at `p-8` in a `max-w-5xl` grid with `gap-8`, each
 * ending in the source's `py-3 px-8` button.
 */
export const FinalCtaSection = () => (
  <section className="bg-muted/50 px-4 py-16">
    <div className="mx-auto max-w-5xl">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-8 text-center shadow-md">
          <h3 className="mb-3 text-xl font-bold text-foreground md:text-2xl">
            Ready to Find Your Next Home?
          </h3>
          <p className="mb-6 text-muted-foreground">
            Get pre-qualified today and be first in line for the best rentals.
          </p>
          <Link
            to="/prequalify"
            className="inline-block rounded-lg bg-cta-qualify px-8 py-3 font-semibold text-cta-qualify-foreground shadow-lg transition hover:bg-cta-qualify/90"
          >
            Get Pre-Qualified
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-card p-8 text-center shadow-md">
          <h3 className="mb-3 text-xl font-bold text-foreground md:text-2xl">
            Ready to Fill Your Vacancy?
          </h3>
          <p className="mb-6 text-muted-foreground">
            Access pre-qualified and prescreened tenants and list your property.
          </p>
          <Link
            to="/register?role=landlord"
            className="inline-block rounded-lg bg-cta-browse px-8 py-3 font-semibold text-cta-browse-foreground shadow-lg transition hover:bg-cta-browse/90"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default FinalCtaSection;
