import { Link } from "react-router-dom";

import { STEPS } from "@/features/landing/content";

/**
 * Carried across from `comingsoonhomrentals-com/src/components/home/
 * HowItWorks.tsx`: `max-w-5xl`, `mb-12` under the heading, numbered 12×12
 * discs, and the call to action at the source's `py-3 px-8 text-lg`.
 */
export const HowItWorksSection = () => (
  <section id="how-it-works" className="bg-background px-4 py-16">
    <div className="mx-auto max-w-5xl text-center">
      <h2 className="mb-12 text-2xl font-bold text-foreground md:text-3xl">
        Your Path to the Perfect Rental
      </h2>

      <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.number} className="flex flex-col items-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cta-qualify text-xl font-bold text-cta-qualify-foreground">
              {step.number}
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
            <p className="text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>

      <Link
        to="/prequalify"
        className="inline-block rounded-lg bg-cta-qualify px-8 py-3 text-lg font-semibold text-cta-qualify-foreground shadow-lg transition hover:bg-cta-qualify/90"
      >
        Start Your Pre-Qualification
      </Link>
    </div>
  </section>
);

export default HowItWorksSection;
