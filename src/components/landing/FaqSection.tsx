import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FAQ } from "@/features/landing/content";

/**
 * Carried across from `comingsoonhomrentals-com/src/components/home/
 * FAQSection.tsx`, including the part I dropped the first time: every answer
 * ends in a way forward. That page's FAQ is part of the funnel rather than a
 * help article, and the buttons are the reason.
 *
 * Measurements are the source's — a muted band at `py-16`, `max-w-3xl`, items
 * as separate cards at `space-y-2` with `px-4`.
 */
export const FaqSection = () => (
  <section id="faq" className="bg-muted px-4 py-16">
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-8 text-center text-2xl font-bold text-foreground md:text-3xl">
        Frequently Asked Questions
      </h2>

      <Accordion type="single" collapsible className="w-full space-y-2">
        {FAQ.map((item, index) => (
          <AccordionItem
            key={item.question}
            value={`item-${index}`}
            className="rounded-lg border border-border bg-card px-4"
          >
            <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-muted-foreground">
              <p className="mb-4">{item.answer}</p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild size="sm" className="gap-1">
                  <Link to={item.primary.to}>
                    {item.primary.text}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                {item.secondary && (
                  <Button asChild variant="outline" size="sm" className="gap-1">
                    <Link to={item.secondary.to}>{item.secondary.text}</Link>
                  </Button>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default FaqSection;
