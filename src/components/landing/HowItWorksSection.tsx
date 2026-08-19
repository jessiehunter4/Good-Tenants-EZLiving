import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { STEPS } from "@/features/landing/content";

/** Carried across from `comingsoonhomrentals-com/src/components/home/HowItWorks.tsx`. */
export const HowItWorksSection = () => (
  <section id="how-it-works" className="bg-background py-16">
    <div className="page-shell text-center">
      <h2 className="text-2xl font-extrabold tracking-tight text-espresso md:text-3xl">
        Your path to the right rental
      </h2>

      <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.number} className="flex flex-col items-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cta-qualify text-xl font-bold text-cta-qualify-foreground">
              {step.number}
            </div>
            <h3 className="text-lg font-bold text-espresso">{step.title}</h3>
            <p className="mt-2 text-espresso-muted">{step.description}</p>
          </div>
        ))}
      </div>

      <Button
        asChild
        size="lg"
        className="mt-10 bg-cta-qualify px-8 text-cta-qualify-foreground hover:bg-cta-qualify/90"
      >
        <Link to="/prequalify">Start now</Link>
      </Button>
    </div>
  </section>
);

export default HowItWorksSection;
