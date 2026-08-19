import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { DOORS } from "@/features/landing/content";

/**
 * One family, three doors in.
 *
 * Irvine Living Daily's own section, kept because it is the clearest statement
 * of what this platform is: three products people already arrive through,
 * behind one account. Post-merge they are areas of one site rather than
 * separate sites, so the links stay internal.
 */
export const DoorsSection = () => (
  <section id="doors" className="bg-background py-20 sm:py-24">
    <div className="page-shell">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-espresso sm:text-4xl">
          One family, three ways in
        </h2>
        <p className="mt-4 text-lg font-medium text-espresso-muted">
          The listings, the daily, and the profile that ties them together — now one account
          instead of three.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {DOORS.map((door) => (
          <Link
            key={door.name}
            to={door.href}
            className="group flex flex-col rounded-2xl bg-clay p-7 transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-espresso-muted">
              {door.role}
            </span>
            <span className="mt-3 text-xl font-bold text-espresso">{door.name}</span>
            <span className="mt-3 flex-1 font-medium leading-relaxed text-espresso-muted">
              {door.blurb}
            </span>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-espresso">
              Open
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default DoorsSection;
