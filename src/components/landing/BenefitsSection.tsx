import { Calendar, Clock, Repeat, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { BENEFITS } from "@/features/landing/content";
import { BRAND } from "@/config/brand";

const ICONS: Record<string, LucideIcon> = {
  clock: Clock,
  repeat: Repeat,
  shield: Shield,
  calendar: Calendar,
};

/**
 * Carried across from `comingsoonhomrentals-com/src/components/home/
 * TenantBenefits.tsx`: a muted band, `max-w-5xl`, two columns at `gap-6`, and
 * a 12×12 rounded icon tile beside left-aligned text.
 */
export const BenefitsSection = () => (
  <section className="bg-muted px-4 py-16">
    <div className="mx-auto max-w-5xl text-center">
      <h2 className="mb-10 text-2xl font-bold text-foreground md:text-3xl">
        Why Tenants Choose {BRAND.name}
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {BENEFITS.map((benefit) => {
          const Icon = ICONS[benefit.icon] ?? Clock;
          return (
            <div
              key={benefit.title}
              className="flex items-start gap-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-cta-browse/10">
                <Icon className="h-6 w-6 text-cta-browse-ink" />
              </div>
              <div className="text-left">
                <h3 className="mb-1 text-lg font-semibold text-foreground">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default BenefitsSection;
