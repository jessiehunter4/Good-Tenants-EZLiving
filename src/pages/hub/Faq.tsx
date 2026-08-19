import { Link } from "react-router-dom";

import SiteLayout from "@/components/site/SiteLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { COMPANY, HUB_FAQ } from "@/features/hub/content";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/**
 * Carried across from `Good Tenants Hub/src/routes/faq.tsx`, which is the
 * renter-and-partner FAQ. The landing page's FAQ is a different one, from the
 * rentals site, about finding a home rather than about the service.
 */
const Faq = () => {
  useDocumentMeta({
    title: "FAQ — Good Tenants EZ Living",
    description: "How the application package, the readiness review and referrals work.",
  });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-espresso">
          Frequently asked questions
        </h1>

        <Accordion type="single" collapsible className="mt-8">
          {HUB_FAQ.map((item, i) => (
            <AccordionItem key={item.q} value={`q-${i}`}>
              <AccordionTrigger className="text-left font-semibold text-espresso">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-espresso-muted">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 rounded-2xl border border-clay bg-clay-soft p-6 text-center">
          <p className="font-semibold text-espresso">Still stuck?</p>
          <p className="mt-1 text-sm text-espresso-muted">
            Call {COMPANY.phone}, or ask and we will answer publicly so the next person finds it.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Button asChild className="bg-espresso text-sand hover:bg-espresso/90">
              <Link to="/ask">Ask a question</Link>
            </Button>
            <Button asChild variant="outline" className="border-clay text-espresso">
              <Link to="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
};

export default Faq;
