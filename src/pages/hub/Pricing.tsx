import { Link } from "react-router-dom";
import { Check } from "lucide-react";

import SiteLayout from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { PRICING_TIERS } from "@/features/hub/content";
import { cn } from "@/lib/utils";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/** Carried across from `Good Tenants Hub/src/routes/pricing.tsx`. */
const Pricing = () => {
  useDocumentMeta({
    title: "Pricing — Good Tenants EZ Living",
    description: "Free for renters. Landlord and Realtor plans coming soon.",
  });

  return (
    <SiteLayout>
      <section className="bg-clay-soft">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-espresso sm:text-5xl">
            Pricing
          </h1>
          <p className="mt-3 text-espresso-muted">
            Renters always free. Partner plans coming soon.
          </p>
        </div>
      </section>

      <section className="bg-background">
        <div className="page-shell grid gap-6 py-16 md:grid-cols-3">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "flex flex-col rounded-3xl border p-8 shadow-sm",
                tier.featured ? "border-espresso bg-clay-soft" : "border-clay/50 bg-card",
              )}
            >
              <h2 className="text-lg font-bold text-espresso">{tier.name}</h2>
              <p className="mt-2 text-3xl font-extrabold text-espresso">{tier.price}</p>
              <p className="mt-3 text-sm text-espresso-muted">{tier.body}</p>

              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-espresso">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={cn(
                  "mt-8 w-full",
                  tier.featured
                    ? "bg-espresso text-sand hover:bg-espresso/90"
                    : "border border-clay bg-transparent text-espresso hover:bg-sand",
                )}
              >
                <Link to={tier.to}>{tier.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
};

export default Pricing;
