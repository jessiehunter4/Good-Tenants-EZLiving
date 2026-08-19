import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/** Carried across from `comingsoonhomrentals-com/src/components/home/FinalCTA.tsx`. */
export const FinalCtaSection = () => (
  <section className="bg-clay-soft py-16">
    <div className="page-shell grid max-w-5xl gap-8 md:grid-cols-2">
      <Card className="p-8 text-center">
        <h2 className="text-xl font-bold text-espresso md:text-2xl">
          Ready to find your next home?
        </h2>
        <p className="mt-3 text-espresso-muted">
          Get pre-qualified today and be first in line for the best rentals.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-6 bg-cta-qualify px-8 text-cta-qualify-foreground hover:bg-cta-qualify/90"
        >
          <Link to="/prequalify">Get pre-qualified</Link>
        </Button>
      </Card>

      <Card className="p-8 text-center">
        <h2 className="text-xl font-bold text-espresso md:text-2xl">Ready to fill a vacancy?</h2>
        <p className="mt-3 text-espresso-muted">
          Reach pre-qualified, prescreened tenants and list your property.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-6 bg-cta-browse px-8 text-cta-browse-foreground hover:bg-cta-browse/90"
        >
          <Link to="/register?role=landlord">Get started</Link>
        </Button>
      </Card>
    </div>
  </section>
);

export default FinalCtaSection;
