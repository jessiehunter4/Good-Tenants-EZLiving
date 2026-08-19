import { CheckCircle, Eye, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { URGENCY } from "@/features/landing/content";

const ICONS: Record<string, LucideIcon> = { eye: Eye, file: FileText, check: CheckCircle };

/** Carried across from `comingsoonhomrentals-com/src/components/home/UrgencySection.tsx`. */
export const UrgencySection = () => (
  <section className="bg-clay-soft py-16">
    <div className="page-shell text-center">
      <h2 className="text-2xl font-extrabold tracking-tight text-espresso md:text-3xl">
        {URGENCY.heading}
      </h2>
      <p className="mx-auto mt-4 max-w-3xl text-lg text-espresso-muted">{URGENCY.intro}</p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {URGENCY.cards.map((card) => {
          const Icon = ICONS[card.icon] ?? Eye;
          return (
            <Card key={card.title} className="p-6 transition-shadow hover:shadow-lg">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cta-browse/10">
                <Icon className="h-7 w-7 text-cta-browse" />
              </div>
              <h3 className="text-xl font-bold text-espresso">{card.title}</h3>
              <p className="mt-2 text-espresso-muted">{card.description}</p>
            </Card>
          );
        })}
      </div>
    </div>
  </section>
);

export default UrgencySection;
