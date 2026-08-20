import { CheckCircle, Eye, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { URGENCY } from "@/features/landing/content";

const ICONS: Record<string, LucideIcon> = { eye: Eye, file: FileText, check: CheckCircle };

/**
 * Carried across from `comingsoonhomrentals-com/src/components/home/
 * UrgencySection.tsx`, measurements included: `py-16 px-4`, a `max-w-6xl`
 * column, the heading at 2xl stepping to 3xl, a 14×14 icon disc above a 3-up
 * grid at `gap-6`.
 */
export const UrgencySection = () => (
  <section className="bg-muted px-4 py-16">
    <div className="mx-auto max-w-6xl text-center">
      <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">{URGENCY.heading}</h2>
      <p className="mx-auto mb-10 max-w-3xl text-lg text-muted-foreground">{URGENCY.intro}</p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {URGENCY.cards.map((card) => {
          const Icon = ICONS[card.icon] ?? Eye;
          return (
            <div
              key={card.title}
              className="rounded-xl border border-border bg-card p-6 shadow-md transition-shadow hover:shadow-lg"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cta-browse/10">
                <Icon className="h-7 w-7 text-cta-browse-ink" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">{card.title}</h3>
              <p className="text-muted-foreground">{card.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default UrgencySection;
