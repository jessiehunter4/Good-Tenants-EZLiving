import { STATS } from "@/features/landing/content";

/**
 * Carried across from `comingsoonhomrentals-com/src/components/home/
 * StatsSection.tsx`: `py-12`, `max-w-5xl`, two columns rising to four.
 *
 * The numbers are that site's and unverified — see the note in content.ts.
 */
export const StatsSection = () => (
  <section className="bg-background px-4 py-12">
    <div className="mx-auto max-w-5xl">
      <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="p-4">
            <div className="mb-1 text-3xl font-bold text-cta-browse-ink md:text-4xl">
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground md:text-base">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;
