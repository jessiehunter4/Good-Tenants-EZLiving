import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  PRODUCT_OPTIONS,
  SECURITY_TYPE_LABELS,
  type ScenarioProduct,
} from "@/features/lending/products";

interface ScenarioProductChooserProps {
  onChoose: (product: ScenarioProduct) => void;
}

/**
 * Which product the scenario is for.
 *
 * It comes first because it changes the form underneath it: a construction
 * scenario takes mid-construction security and land subdivision as a
 * transaction type, a second mortgage takes neither.
 */
export const ScenarioProductChooser = ({ onChoose }: ScenarioProductChooserProps) => (
  <div className="grid gap-6 md:grid-cols-3">
    {PRODUCT_OPTIONS.map((product) => (
      <button
        key={product.value}
        type="button"
        onClick={() => onChoose(product.value)}
        className={cn(
          "group flex flex-col rounded-2xl bg-canvas-elevated p-6 text-left ring-1 ring-canvas-border",
          "transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:ring-2",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canvas-foreground",
        )}
      >
        <span className="block text-lg font-semibold text-canvas-foreground">{product.title}</span>
        <span className="mt-1 block text-sm text-canvas-muted">{product.summary}</span>

        <span className="mt-5 block text-xs font-medium uppercase tracking-wide text-canvas-muted">
          Security types
        </span>
        <span className="mt-2 block flex-1 text-sm leading-relaxed text-canvas-muted">
          {product.securities.map((security) => SECURITY_TYPE_LABELS[security]).join(", ")}
        </span>

        <span
          className={cn(
            "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-colors",
            product.accentClass,
          )}
        >
          Start scenario
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </span>
      </button>
    ))}
  </div>
);

export default ScenarioProductChooser;
