import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import useLandingStats from "@/hooks/landing/useLandingStats";
import valueScene from "@/assets/landing/value.svg";

const PROMISES = [
  { figure: "Once", caption: "Prove your income and references" },
  { figure: "Every", caption: "Property reuses that same profile" },
  { figure: "Yours", caption: "Nothing is shared without your say-so" },
] as const;

export const ValueSection = () => {
  const { activeListings } = useLandingStats();

  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <img src={valueScene} alt="" aria-hidden="true" className="w-full rounded-2xl" />

        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-espresso sm:text-4xl">
            One profile, every
            <br />
            landlord who asks
          </h2>
          <p className="mt-5 max-w-lg text-lg font-medium text-espresso-muted">
            Renting means proving the same things over and over — payslips to one agent, a
            reference to the next, your income to a form that forgets it. Do it once here, and
            decide who gets to see it.
          </p>

          <dl className="mt-10 grid grid-cols-3 gap-6">
            {PROMISES.map((promise) => (
              <div key={promise.figure}>
                <dt className="text-3xl font-extrabold text-espresso">{promise.figure}</dt>
                <dd className="mt-1 text-sm font-medium text-espresso-muted">{promise.caption}</dd>
              </div>
            ))}
          </dl>

          {activeListings > 0 && (
            <p className="mt-8 text-sm font-semibold text-espresso-muted">
              {activeListings} {activeListings === 1 ? "property" : "properties"} listed right now.
            </p>
          )}

          <Button asChild size="lg" className="mt-8 bg-espresso text-sand hover:bg-espresso/90">
            <Link to="/register?role=tenant">Build my profile</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ValueSection;
