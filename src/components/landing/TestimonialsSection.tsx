import { Quote } from "lucide-react";

import { Card } from "@/components/ui/card";
import { TESTIMONIALS } from "@/features/landing/content";

/**
 * Carried across from `comingsoonhomrentals-com/src/components/home/
 * TestimonialsSection.tsx`. See the note in content.ts: these are live on that
 * site, but nobody here has confirmed they are attributable.
 */
export const TestimonialsSection = () => (
  <section className="bg-sand py-16">
    <div className="page-shell">
      <h2 className="text-center text-2xl font-extrabold tracking-tight text-espresso md:text-3xl">
        What people say
      </h2>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((testimonial) => (
          <Card key={testimonial.name} className="relative p-6">
            <Quote className="absolute right-4 top-4 h-8 w-8 text-clay" aria-hidden="true" />
            <p className="italic text-espresso-muted">“{testimonial.quote}”</p>
            <div className="mt-6 border-t border-clay/50 pt-4">
              <p className="font-semibold text-espresso">{testimonial.name}</p>
              <p className="text-sm text-cta-browse">{testimonial.role}</p>
              <p className="text-xs text-espresso-muted">{testimonial.location}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
