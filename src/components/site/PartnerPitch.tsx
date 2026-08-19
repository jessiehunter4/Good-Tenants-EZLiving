import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import SiteLayout from "@/components/site/SiteLayout";
import ContactForm from "@/components/site/ContactForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export type Pitch = {
  eyebrow: string;
  heading: string;
  intro: string;
  benefitsHeading: string;
  benefits: readonly string[];
  noneHeading: string;
  noneBody: string;
  contactHeading: string;
  contactBody: string;
};

type PartnerPitchProps = {
  pitch: Pitch;
  role: "landlord" | "agent";
  registerLabel: string;
};

/**
 * The landlord and realtor pitches, which are the same page with different
 * words — carried across from the hub's `/landlords` and `/realtors`.
 *
 * The fair housing note is not decoration here. Both pages promise access to a
 * directory of people, which is exactly the context where the promise has to be
 * made in writing.
 */
export const PartnerPitch = ({ pitch, role, registerLabel }: PartnerPitchProps) => {
  useDocumentMeta({ title: `${pitch.heading} — Good Tenants EZ Living`, description: pitch.intro });

  return (
    <SiteLayout>
      <section className="bg-espresso">
        <div className="page-shell py-20">
          <p className="text-sm font-bold uppercase tracking-widest text-sand/80">
            {pitch.eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-sand sm:text-5xl">
            {pitch.heading}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-sand/90">{pitch.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-sand px-8 text-espresso hover:bg-sand/90">
              <Link to={`/register?role=${role}`}>{registerLabel}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-sand bg-transparent px-8 text-sand hover:bg-sand/10 hover:text-sand"
            >
              <Link to="/tenants">Browse the directory</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="page-shell py-20">
          <h2 className="text-3xl font-extrabold tracking-tight text-espresso sm:text-4xl">
            {pitch.benefitsHeading}
          </h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {pitch.benefits.map((benefit) => (
              <li key={benefit}>
                <Card className="h-full p-5 text-sm text-espresso">{benefit}</Card>
              </li>
            ))}
          </ul>

          <Card className="mt-8 flex items-start gap-3 border-clay bg-clay-soft p-5">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-espresso" />
            <p className="text-sm text-espresso-muted">
              The directory cannot be filtered or sorted by any protected class, and public
              profiles carry no protected-class information. Partners agree to follow all
              applicable fair-housing laws.{" "}
              <Link to="/fair-housing" className="font-semibold text-espresso underline">
                Read the full statement
              </Link>
              .
            </p>
          </Card>
        </div>
      </section>

      <section className="bg-sand">
        <div className="page-shell py-20">
          <h2 className="text-3xl font-extrabold tracking-tight text-espresso sm:text-4xl">
            {pitch.noneHeading}
          </h2>
          <p className="mt-3 max-w-3xl text-espresso-muted">{pitch.noneBody}</p>

          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            <div>
              <h3 className="text-xl font-bold text-espresso">{pitch.contactHeading}</h3>
              <p className="mt-2 text-sm text-espresso-muted">{pitch.contactBody}</p>
            </div>
            <Card className="p-6">
              <ContactForm defaultRole={role} submitLabel="Send" />
            </Card>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default PartnerPitch;
