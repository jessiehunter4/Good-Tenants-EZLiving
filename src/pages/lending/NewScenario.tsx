import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import ScenarioProductChooser from "@/components/lending/ScenarioProductChooser";
import ScenarioStepper from "@/components/lending/ScenarioStepper";
import { type ScenarioProduct } from "@/features/lending/products";

/**
 * Submit a funding scenario.
 *
 * Product first, because it changes the form beneath it: which security types
 * are on offer, which transaction types, and what a lender expects to read.
 */
const NewScenario = () => {
  const [product, setProduct] = useState<ScenarioProduct | null>(null);

  return (
    <div className="min-h-screen bg-background">

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 sm:px-6 lg:py-12">
        <header className="flex items-center justify-between">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-2 text-muted-foreground hover:text-foreground"
          >
            <Link to="/">
              <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Back to home
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Link to="/scenarios">My scenarios</Link>
          </Button>
        </header>

        <main className="flex flex-1 flex-col justify-center py-10">
          {product === null ? (
            <div className="duration-300 animate-in fade-in">
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  Start a scenario
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  What kind of funding are you looking for?
                </p>
              </div>
              <div className="mt-12">
                <ScenarioProductChooser onChoose={setProduct} />
              </div>
            </div>
          ) : (
            <div className="duration-300 animate-in fade-in">
              <ScenarioStepper product={product} onChangeProduct={() => setProduct(null)} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default NewScenario;
