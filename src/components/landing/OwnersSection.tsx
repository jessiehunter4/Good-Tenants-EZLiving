import { Link } from "react-router-dom";
import { Check } from "lucide-react";

import { OWNERS } from "@/features/landing/content";

/**
 * Carried across from `comingsoonhomrentals-com/src/components/home/
 * LandlordSection.tsx`: the navy band, `max-w-5xl` centred, a `max-w-2xl`
 * checklist at `space-y-4`, and two buttons at `py-3 px-8`.
 *
 * Its buttons went to `/verify` and a CSV upload screen. The first exists here;
 * the second does not, so that one goes to agent registration instead.
 */
export const OwnersSection = () => (
  <section id="owners" className="bg-landlord-navy px-4 py-16">
    <div className="mx-auto max-w-5xl text-center">
      <h2 className="mb-3 text-2xl font-bold text-landlord-navy-foreground md:text-3xl">
        {OWNERS.heading}
      </h2>
      <h3 className="mb-6 text-xl text-landlord-navy-foreground/90">{OWNERS.subheading}</h3>
      <p className="mx-auto mb-8 max-w-3xl text-landlord-navy-foreground/80">{OWNERS.intro}</p>

      <div className="mx-auto mb-10 max-w-2xl space-y-4">
        {OWNERS.points.map((point) => (
          <div key={point} className="flex items-start gap-3 text-left">
            <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-cta-qualify" />
            <span className="text-landlord-navy-foreground/90">{point}</span>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link
          to="/verify"
          className="rounded-lg bg-background px-8 py-3 font-semibold text-foreground shadow-lg transition hover:bg-background/90"
        >
          Get Verified
        </Link>
        <Link
          to="/register?role=landlord"
          className="rounded-lg border-2 border-landlord-navy-foreground px-8 py-3 font-semibold text-landlord-navy-foreground transition hover:bg-white/10"
        >
          Upload Listings
        </Link>
      </div>

      <p className="text-sm text-landlord-navy-foreground/70">
        Need full-service leasing?{" "}
        <Link to="/landlords" className="underline transition hover:text-landlord-navy-foreground">
          Inquire about our leasing services
        </Link>
      </p>
    </div>
  </section>
);

export default OwnersSection;
