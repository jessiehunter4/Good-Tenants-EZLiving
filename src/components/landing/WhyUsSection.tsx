import { FileCheck, Lock, Repeat, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Reason {
  icon: LucideIcon;
  title: string;
  body: string;
}

const REASONS: readonly Reason[] = [
  {
    icon: FileCheck,
    title: "Qualify once",
    body: "Income, references and documents checked a single time, not per property.",
  },
  {
    icon: Repeat,
    title: "Reusable profile",
    body: "Apply to the next place without starting the paperwork again.",
  },
  {
    icon: Lock,
    title: "Consent first",
    body: "A landlord sees your details when you approve it, and access expires.",
  },
  {
    icon: ShieldCheck,
    title: "Verified either way",
    body: "Landlords meet renters who already meet their criteria. Fewer wasted viewings.",
  },
] as const;

export const WhyUsSection = () => (
  <section id="why-us" className="bg-background pb-20 sm:pb-28">
    <div className="page-shell">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-espresso sm:text-4xl">
          Why renters use us
        </h2>
        <p className="mt-4 text-lg font-medium text-espresso-muted">
          The paperwork is the worst part of renting. This is our attempt to do it once.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {REASONS.map((reason) => (
          <article key={reason.title} className="rounded-2xl bg-clay p-6">
            <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-sand">
              <reason.icon className="h-5 w-5 text-espresso" aria-hidden="true" />
            </span>
            <h3 className="font-bold text-espresso">{reason.title}</h3>
            <p className="mt-2 text-sm font-medium leading-relaxed text-espresso-muted">
              {reason.body}
            </p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default WhyUsSection;
