import { Quote } from "lucide-react";

import { TESTIMONIALS } from "@/features/landing/content";

/**
 * Carried across from `comingsoonhomrentals-com/src/components/home/
 * TestimonialsSection.tsx`: `max-w-6xl`, three columns at `gap-6`, the quote
 * mark sitting 4 from the top-right of each card.
 *
 * See the note in content.ts — these are live on that site, unverified here.
 */
export const TestimonialsSection = () => (
  <section className="bg-background px-4 py-16">
    <div className="mx-auto max-w-6xl">
      <h2 className="mb-10 text-center text-2xl font-bold text-foreground md:text-3xl">
        What Our Users Say
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((testimonial) => (
          <div
            key={testimonial.name}
            className="relative rounded-xl border border-border bg-card p-6 shadow-md"
          >
            <Quote className="absolute right-4 top-4 h-8 w-8 text-cta-browse/20" aria-hidden="true" />
            <p className="mb-6 italic text-muted-foreground">“{testimonial.quote}”</p>
            <div className="border-t border-border pt-4">
              <p className="font-semibold text-foreground">{testimonial.name}</p>
              <p className="text-sm text-cta-browse-ink">{testimonial.role}</p>
              <p className="text-xs text-muted-foreground">{testimonial.location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
