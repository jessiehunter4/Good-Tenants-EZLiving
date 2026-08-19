import { BENEFITS, STEPS } from "@/features/landing/content";

/** Coming Soon Home Rentals' funnel and tenant benefits, merged into one block. */
export const FunnelSection = () => (
  <section id="how-it-works" className="bg-sand py-20 sm:py-28">
    <div className="page-shell">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-espresso sm:text-4xl">
          How it works
        </h2>
        <p className="mt-4 text-lg font-medium text-espresso-muted">
          Three steps, and the first one takes minutes.
        </p>
      </div>

      <ol className="mt-14 grid gap-6 md:grid-cols-3">
        {STEPS.map((step) => (
          <li key={step.number} className="rounded-2xl bg-background p-8">
            <span className="text-sm font-extrabold tracking-widest text-espresso-muted">
              {step.number}
            </span>
            <h3 className="mt-4 text-xl font-bold text-espresso">{step.title}</h3>
            <p className="mt-3 font-medium leading-relaxed text-espresso-muted">{step.body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map((benefit) => (
          <article key={benefit.title} className="rounded-2xl bg-clay p-6">
            <h3 className="font-bold text-espresso">{benefit.title}</h3>
            <p className="mt-2 text-sm font-medium leading-relaxed text-espresso-muted">
              {benefit.body}
            </p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default FunnelSection;
