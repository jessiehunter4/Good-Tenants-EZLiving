import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { ROLE_OPTIONS, type SignupRole } from "./registerRoles";

interface RoleChooserProps {
  onChoose: (role: SignupRole) => void;
}

/**
 * Step one: which kind of account this is.
 *
 * It gets a whole screen because it decides everything after it — which
 * onboarding runs, which dashboard you land on, and what the platform is
 * allowed to show you. Burying it in a radio group under a password field
 * asked the most consequential question in the smallest control on the page.
 */
export const RoleChooser = ({ onChoose }: RoleChooserProps) => (
  <div className="grid gap-6 md:grid-cols-3">
    {ROLE_OPTIONS.map((option) => {
      const Icon = option.icon;
      return (
        <article
          key={option.value}
          className={cn(
            "group flex flex-col overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-white/10",
            "transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:ring-2",
            option.ringClass,
          )}
        >
          <div className="relative">
            <img
              src={option.scene}
              alt=""
              aria-hidden="true"
              className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Blends the artwork into the card body, as the reference does. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-900 to-transparent" />
            <span
              className={cn(
                "absolute -bottom-7 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border-2",
                option.badgeClass,
              )}
            >
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
          </div>

          <div className="flex flex-1 flex-col px-6 pb-6 pt-11 text-center">
            <h2 className="text-xl font-semibold text-white">{option.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{option.blurb}</p>
            <button
              type="button"
              onClick={() => onChoose(option.value)}
              className={cn(
                "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
                option.buttonClass,
              )}
            >
              {option.cta}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </button>
          </div>
        </article>
      );
    })}
  </div>
);

export default RoleChooser;
