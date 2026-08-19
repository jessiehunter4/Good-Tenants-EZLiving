import { Link } from "react-router-dom";

import SiteLayout from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { REFERRAL_PROGRAM } from "@/features/hub/content";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/** Carried across from `Good Tenants Hub/src/routes/referral-program.tsx`. */
const ReferralProgram = () => {
  useDocumentMeta({
    title: "Referral programme — Good Tenants EZ Living",
    description: REFERRAL_PROGRAM.standfirst,
  });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-espresso">
          {REFERRAL_PROGRAM.heading}
        </h1>
        <p className="mt-4 text-lg text-espresso-muted">{REFERRAL_PROGRAM.standfirst}</p>

        <h2 className="mt-10 text-xl font-bold text-espresso">Ways it will work</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-espresso-muted">
          {REFERRAL_PROGRAM.ways.map((way) => (
            <li key={way}>{way}</li>
          ))}
        </ul>

        <Card className="mt-8 border-clay bg-clay-soft p-5">
          <p className="text-sm text-espresso-muted">{REFERRAL_PROGRAM.caveat}</p>
        </Card>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild className="bg-espresso text-sand hover:bg-espresso/90">
            <Link to="/register?role=agent">Join as an agent</Link>
          </Button>
          <Button asChild variant="outline" className="border-clay text-espresso">
            <Link to="/contact">Tell me when it launches</Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
};

export default ReferralProgram;
