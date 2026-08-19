import { Link } from "react-router-dom";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { OWNERS } from "@/features/landing/content";

/**
 * Carried across from `comingsoonhomrentals-com/src/components/home/
 * LandlordSection.tsx`. Its two buttons went to `/verify` and an upload screen;
 * here they go to the registration this app actually has.
 */
export const OwnersSection = () => (
  <section id="owners" className="bg-espresso py-16">
    <div className="page-shell text-center">
      <h2 className="text-2xl font-extrabold tracking-tight text-sand md:text-3xl">
        {OWNERS.heading}
      </h2>
      <h3 className="mt-3 text-xl text-sand/90">{OWNERS.subheading}</h3>
      <p className="mx-auto mt-6 max-w-3xl text-sand/80">{OWNERS.intro}</p>

      <div className="mx-auto mt-8 max-w-2xl space-y-4">
        {OWNERS.points.map((point) => (
          <div key={point} className="flex items-start gap-3 text-left">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-cta-qualify-foreground" />
            <span className="text-sand/90">{point}</span>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button asChild size="lg" className="bg-sand px-8 text-espresso hover:bg-sand/90">
          <Link to="/register?role=landlord">List a property</Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="border-sand bg-transparent px-8 text-sand hover:bg-sand/10 hover:text-sand"
        >
          <Link to="/register?role=agent">Join as an agent</Link>
        </Button>
      </div>
    </div>
  </section>
);

export default OwnersSection;
