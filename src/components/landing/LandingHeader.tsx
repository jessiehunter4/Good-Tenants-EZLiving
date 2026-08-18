import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Why us", href: "#why-us" },
  { label: "Rentals", href: "#rentals" },
  { label: "Help", href: "#help" },
] as const;

export const LandingHeader = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-clay/40 bg-sand/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="text-lg font-extrabold tracking-tight text-espresso">
          Good Tenants
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-espresso-muted transition-colors hover:text-espresso"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden text-espresso hover:bg-clay/40 sm:inline-flex">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild className="bg-espresso text-sand hover:bg-espresso/90">
            <Link to="/register">Sign up</Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-md p-2 text-espresso md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <nav
        className={cn("border-t border-clay/40 px-4 md:hidden", open ? "block" : "hidden")}
        aria-label="Main, mobile"
      >
        {NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className="block py-3 text-sm font-semibold text-espresso-muted"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
};

export default LandingHeader;
