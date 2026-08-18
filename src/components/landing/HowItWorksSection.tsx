const STEPS = [
  {
    number: "01",
    title: "Build your profile",
    body: "Budget, timing, household and the documents a landlord always asks for. Fifteen minutes, once.",
  },
  {
    number: "02",
    title: "Get verified",
    body: "We check what you have uploaded so a landlord does not have to take your word for it.",
  },
  {
    number: "03",
    title: "Share it, on your terms",
    body: "Approve each landlord or agent who wants to see it. Access expires; nothing is public.",
  },
] as const;

export const HowItWorksSection = () => (
  <section id="how-it-works" className="bg-sand py-20 sm:py-28">
    <div className="page-shell">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-espresso sm:text-4xl">
          How it works
        </h2>
        <p className="mt-4 text-lg font-medium text-espresso-muted">
          Three steps, and the last one is yours to control.
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
    </div>
  </section>
);

export default HowItWorksSection;
