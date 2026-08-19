import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ } from "@/features/landing/content";

/** Carried across from `comingsoonhomrentals-com/src/components/home/FAQSection.tsx`. */
export const FaqSection = () => (
  <section id="faq" className="bg-background py-16">
    <div className="mx-auto max-w-3xl px-5 sm:px-8">
      <h2 className="text-center text-2xl font-extrabold tracking-tight text-espresso md:text-3xl">
        Questions people ask
      </h2>

      <Accordion type="single" collapsible className="mt-8">
        {FAQ.map((item, i) => (
          <AccordionItem key={item.question} value={`faq-${i}`}>
            <AccordionTrigger className="text-left font-semibold text-espresso">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-espresso-muted">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default FaqSection;
