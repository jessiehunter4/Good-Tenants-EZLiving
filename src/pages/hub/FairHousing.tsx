import { Home } from "lucide-react";

import SiteLayout from "@/components/site/SiteLayout";
import { FAIR_HOUSING } from "@/features/hub/content";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/**
 * Carried across from `Good Tenants Hub/src/routes/fair-housing.tsx`.
 *
 * The statement is verbatim. It names the protected classes and says what the
 * platform will not do with them, and that is a commitment the business made —
 * not copy to be improved. The one thing this page adds is that the commitment
 * is now enforced in code as well as stated: see
 * `features/compliance/fairHousing.ts`, which blocks copy describing who a home
 * would suit before it can be published.
 */
const FairHousing = () => {
  useDocumentMeta({
    title: "Equal opportunity housing — Good Tenants EZ Living",
    description: FAIR_HOUSING.statement.slice(0, 180),
  });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <div className="flex items-center gap-3">
          <Home className="h-8 w-8 text-espresso" aria-hidden="true" />
          <h1 className="text-4xl font-extrabold tracking-tight text-espresso">
            {FAIR_HOUSING.heading}
          </h1>
        </div>

        <p className="mt-4 text-lg font-semibold text-espresso">{FAIR_HOUSING.standfirst}</p>
        <p className="mt-4 leading-relaxed text-espresso-muted">{FAIR_HOUSING.statement}</p>

        <h2 className="mt-10 text-xl font-bold text-espresso">
          {FAIR_HOUSING.practiceHeading}
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-espresso-muted">
          {FAIR_HOUSING.practice.map((item) => (
            <li key={item}>{item}</li>
          ))}
          <li>
            Listing and article copy is checked automatically before it is published: wording that
            describes who a home would suit, rather than the home, is refused.
          </li>
        </ul>

        <p className="mt-10 text-espresso-muted">
          {FAIR_HOUSING.complaintLead}{" "}
          <a
            href={FAIR_HOUSING.complaintUrl}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-espresso underline"
          >
            {FAIR_HOUSING.complaintLabel}
          </a>
          .
        </p>
      </div>
    </SiteLayout>
  );
};

export default FairHousing;
