import { STATS } from "@/features/landing/content";

/**
 * Carried across from `comingsoonhomrentals-com/src/components/home/
 * StatsSection.tsx`.
 *
 * These numbers are that site's, unverified — see the note in content.ts. After
 * the merge the database that could confirm them is in the same app, so they
 * should be computed rather than typed.
 */
export const StatsSection = () => (
  <section className="bg-background py-12">
    <div className="page-shell">
      <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="p-4">
            <div className="text-3xl font-extrabold text-cta-browse md:text-4xl">{stat.value}</div>
            <div className="mt-1 text-sm text-espresso-muted md:text-base">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;
