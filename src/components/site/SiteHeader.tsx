import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BRAND } from "@/config/brand";
import { SITE_NAV, isAnchor, type NavItem } from "./siteNav";

type SiteHeaderProps = {
  /** Defaults to the interior-page routes; the landing page passes its anchors. */
  nav?: readonly NavItem[];
};

const NavLink = ({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) => {
  const className =
    "text-sm font-semibold text-espresso-muted transition-colors hover:text-espresso";
  return isAnchor(item.to) ? (
    <a href={item.to} className={className} onClick={onNavigate}>
      {item.label}
    </a>
  ) : (
    <Link to={item.to} className={className} onClick={onNavigate}>
      {item.label}
    </Link>
  );
};

export const SiteHeader = ({ nav = SITE_NAV }: SiteHeaderProps) => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-clay/40 bg-sand/90 backdrop-blur">
      <div className="page-shell flex items-center justify-between py-4">
        <Link to="/" className="text-lg font-extrabold tracking-tight text-espresso">
          {BRAND.name}
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {nav.map((item) => (
            <NavLink key={item.to} item={item} />
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
        {nav.map((item) => (
          <div key={item.to} className="py-3">
            <NavLink item={item} onNavigate={() => setOpen(false)} />
          </div>
        ))}
      </nav>
    </header>
  );
};

export default SiteHeader;
