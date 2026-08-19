import { Calendar, Clock, Repeat, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { BENEFITS } from "@/features/landing/content";
import { BRAND } from "@/config/brand";

const ICONS: Record<string, LucideIcon> = {
  clock: Clock,
  repeat: Repeat,
  shield: Shield,
  calendar: Calendar,
};

/** Carried across from `comingsoonhomrentals-com/src/components/home/TenantBenefits.tsx`. */
export const BenefitsSection = () => (
  <section className="bg-sand py-16">
    <div className="page-shell text-center">
      <h2 className="text-2xl font-extrabold tracking-tight text-espresso md:text-3xl">
        Why renters choose {BRAND.name}
      </h2>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {BENEFITS.map((benefit) => {
          const Icon = ICONS[benefit.icon] ?? Clock;
          return (
            <Card key={benefit.title} className="flex items-start gap-4 p-6 text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-cta-browse/10">
                <Icon className="h-6 w-6 text-cta-browse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-espresso">{benefit.title}</h3>
                <p className="mt-1 text-espresso-muted">{benefit.description}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  </section>
);

export default BenefitsSection;
