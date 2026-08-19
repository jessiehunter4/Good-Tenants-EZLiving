import SiteLayout from "@/components/site/SiteLayout";
import PageHeading from "@/components/daily/PageHeading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ContactForm from "@/components/site/ContactForm";
import { Link } from "react-router-dom";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/**
 * Carried across from `Irvine Living Daily/src/routes/contact.tsx`.
 *
 * That page listed an address and pointed at the two other sites. There are no
 * other sites now, so it points at the two things a person actually wants:
 * asking a question, and starting a profile.
 */
const Contact = () => {
  useDocumentMeta({
    title: "Contact — Good Tenants EZ Living",
    description: "How to reach the Jessie Hunter Team and Good Tenants.",
  });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <PageHeading
          eyebrow="Contact"
          title="Get in touch"
          intro="A leasing specialist answers questions personally, usually within one business day."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-espresso">Ask a question</h2>
            <p className="mt-2 text-sm text-espresso-muted">
              About a listing, an application, or renting in Irvine generally. Answers are
              published so the next person can find them.
            </p>
            <Button asChild className="mt-4 bg-espresso text-sand hover:bg-espresso/90">
              <Link to="/ask">Ask Good Tenants</Link>
            </Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold text-espresso">Talk about your move</h2>
            <p className="mt-2 text-sm text-espresso-muted">
              Fifteen minutes with the Jessie Hunter Team to map out timing, budget and
              neighbourhoods.
            </p>
            <Button asChild variant="outline" className="mt-4 border-clay text-espresso">
              <Link to="/start?intent=strategy-call">Book a call</Link>
            </Button>
          </Card>
        </div>

        <Card className="mt-8 p-6">
          <h2 className="text-lg font-bold text-espresso">Send us a message</h2>
          <p className="mt-1 text-sm text-espresso-muted">
            Anything that does not fit the two boxes above.
          </p>
          <div className="mt-4">
            <ContactForm />
          </div>
        </Card>

        <p className="mt-8 text-sm text-espresso-muted">
          Landlord or agent with a property to list?{" "}
          <Link to="/register?role=landlord" className="font-semibold text-espresso underline">
            Start here
          </Link>
          .
        </p>
      </div>
    </SiteLayout>
  );
};

export default Contact;
