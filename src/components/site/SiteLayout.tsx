import type { ReactNode } from "react";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import type { NavItem } from "./siteNav";
import { cn } from "@/lib/utils";

type SiteLayoutProps = {
  children: ReactNode;
  nav?: readonly NavItem[];
  /**
   * `rentals` switches this page to Coming Soon Home Rentals' palette. It is
   * applied here rather than inside the page so the header and footer follow
   * it — chrome in a different palette from the page it frames looks like a
   * mistake, because it is one.
   */
  theme?: "default" | "rentals";
};

/** The public chrome. Every page a signed-out visitor can reach sits in this. */
export const SiteLayout = ({ children, nav, theme = "default" }: SiteLayoutProps) => (
  <div
    className={cn(
      "flex min-h-screen flex-col bg-background",
      theme === "rentals" && "theme-rentals",
    )}
  >
    <SiteHeader nav={nav} />
    <main className="flex-1">{children}</main>
    <SiteFooter />
  </div>
);

export default SiteLayout;
