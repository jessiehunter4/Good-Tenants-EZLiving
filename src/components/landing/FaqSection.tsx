import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ } from "@/features/landing/content";

/** Coming Soon Home Rentals' questions, which are the ones people actually ask. */
export const FaqSection = () => (
  <section id="faq" className="bg-sand py-20 sm:py-28">
    <div className="page-shell max-w-3xl">
      <h2 className="text-center text-3xl font-extrabold tracking-tight text-espresso sm:text-4xl">
        Questions people ask
      </h2>

      <Accordion type="single" collapsible className="mt-10">
        {FAQ.map((item) => (
          <AccordionItem key={item.question} value={item.question} className="border-espresso/10">
            <AccordionTrigger className="text-left font-bold text-espresso hover:no-underline">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="font-medium leading-relaxed text-espresso-muted">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default FaqSection;
