import { Link } from "react-router-dom";

import SiteLayout from "@/components/site/SiteLayout";
import { ACCESSIBILITY, COMPANY } from "@/features/hub/content";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/** Carried across from `Good Tenants Hub/src/routes/accessibility.tsx`. */
const Accessibility = () => {
  useDocumentMeta({
    title: "Accessibility — Good Tenants EZ Living",
    description: ACCESSIBILITY.intro,
  });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-espresso">
          {ACCESSIBILITY.heading}
        </h1>
        <p className="mt-4 leading-relaxed text-espresso-muted">{ACCESSIBILITY.intro}</p>

        <h2 className="mt-10 text-xl font-bold text-espresso">
          {ACCESSIBILITY.practiceHeading}
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-espresso-muted">
          {ACCESSIBILITY.practice.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2 className="mt-10 text-xl font-bold text-espresso">{ACCESSIBILITY.helpHeading}</h2>
        <p className="mt-3 text-espresso-muted">
          {ACCESSIBILITY.helpBody} Call{" "}
          <a
            href={`tel:${COMPANY.phone.replace(/[^\d]/g, "")}`}
            className="font-semibold text-espresso underline"
          >
            {COMPANY.phone}
          </a>{" "}
          or use the{" "}
          <Link to="/contact" className="font-semibold text-espresso underline">
            contact page
          </Link>
          .
        </p>
      </div>
    </SiteLayout>
  );
};

export default Accessibility;
