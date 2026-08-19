import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { STATS } from "@/features/landing/content";

/**
 * The owner side, from Coming Soon Home Rentals.
 *
 * The figures are that platform's published claims, carried across rather than
 * invented — and they describe its network, not the merged database. They are
 * worth confirming before this page goes anywhere near production.
 */
export const OwnersSection = () => (
  <section id="owners" className="bg-background py-20 sm:py-28">
    <div className="page-shell grid items-center gap-12 lg:grid-cols-2">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-espresso sm:text-4xl">
          Letting a property?
        </h2>
        <p className="mt-5 max-w-lg text-lg font-medium text-espresso-muted">
          Promote your coming-soon properties to qualified applicants first. New listings go
          out to a pre-qualified, prescreened network the moment they are posted.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="bg-espresso text-sand hover:bg-espresso/90">
            <Link to="/register?role=landlord">List a property</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-espresso/20 text-espresso">
            <Link to="/register?role=agent">Join as an agent</Link>
          </Button>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-6 rounded-2xl bg-clay p-8">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <dt className="text-3xl font-extrabold text-espresso">{stat.value}</dt>
            <dd className="mt-1 text-sm font-medium text-espresso-muted">{stat.label}</dd>
          </div>
        ))}
      </dl>
    </div>
  </section>
);

export default OwnersSection;
