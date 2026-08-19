import { Link } from "react-router-dom";

import SiteLayout from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { COMPANY, MISSION } from "@/features/hub/content";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/** Carried across from `Good Tenants Hub/src/routes/about.tsx`. */
const About = () => {
  useDocumentMeta({
    title: "About — Good Tenants EZ Living",
    description: MISSION.intro,
  });

  return (
    <SiteLayout>
      <section className="bg-espresso">
        <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
          <p className="text-sm font-bold uppercase tracking-widest text-sand/80">
            {MISSION.eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-sand sm:text-5xl">
            {MISSION.heading}
          </h1>
          <p className="mt-6 text-lg text-sand/90">{MISSION.intro}</p>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto grid max-w-5xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold tracking-tight text-espresso">{MISSION.lead}</h2>
            <p className="mt-3 text-espresso-muted">{MISSION.leadBody}</p>

            <h3 className="mt-10 text-xl font-bold text-espresso">
              {MISSION.accomplishmentsHeading}
            </h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-espresso-muted">
              {MISSION.accomplishments.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h3 className="mt-10 text-xl font-bold text-espresso">{MISSION.otherHeading}</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-espresso-muted">
              {MISSION.other.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <aside>
            <Card className="p-6">
              <h2 className="text-lg font-bold text-espresso">Who we are</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-espresso-muted">Company</dt>
                  <dd className="font-semibold text-espresso">{COMPANY.legalName}</dd>
                </div>
                <div>
                  <dt className="text-espresso-muted">Broker</dt>
                  <dd className="font-semibold text-espresso">{COMPANY.broker}</dd>
                </div>
                <div>
                  <dt className="text-espresso-muted">Licence</dt>
                  <dd className="font-semibold text-espresso">{COMPANY.dre}</dd>
                </div>
                <div>
                  <dt className="text-espresso-muted">Phone</dt>
                  <dd className="font-semibold text-espresso">
                    <a href={`tel:${COMPANY.phone.replace(/[^\d]/g, "")}`}>{COMPANY.phone}</a>
                  </dd>
                </div>
              </dl>
              <Button asChild className="mt-6 w-full bg-espresso text-sand hover:bg-espresso/90">
                <Link to="/contact">Get in touch</Link>
              </Button>
            </Card>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
};

export default About;
