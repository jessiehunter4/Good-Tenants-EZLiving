import type { ReactNode } from "react";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import type { NavItem } from "./siteNav";

type SiteLayoutProps = {
  children: ReactNode;
  nav?: readonly NavItem[];
};

/** The public chrome. Every page a signed-out visitor can reach sits in this. */
export const SiteLayout = ({ children, nav }: SiteLayoutProps) => (
  <div className="flex min-h-screen flex-col bg-background">
    <SiteHeader nav={nav} />
    <main className="flex-1">{children}</main>
    <SiteFooter />
  </div>
);

export default SiteLayout;
