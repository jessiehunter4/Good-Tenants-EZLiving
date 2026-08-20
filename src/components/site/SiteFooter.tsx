import { Link } from "react-router-dom";
import { BRAND } from "@/config/brand";
import { READ_LINKS } from "./siteNav";

const COLUMNS = [
  {
    heading: "For renters",
    links: [
      { label: "Create a profile", to: "/register?role=tenant" },
      { label: "How it works", to: "/#how-it-works" },
      { label: "Resources", to: "/resources" },
      { label: "Help", to: "/help" },
    ],
  },
  {
    heading: "For landlords",
    links: [
      { label: "How it works", to: "/landlords" },
      { label: "List a property", to: "/register?role=landlord" },
      { label: "Tenant directory", to: "/tenants" },
    ],
  },
  {
    heading: "For agents",
    links: [
      { label: "How it works", to: "/realtors" },
      { label: "Join as an agent", to: "/register?role=agent" },
      { label: "Referral programme", to: "/referral-program" },
    ],
  },
  { heading: "Read", links: READ_LINKS },
  {
    heading: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Pricing", to: "/pricing" },
      { label: "FAQ", to: "/faq" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
      { label: "Fair housing", to: "/fair-housing" },
      { label: "Accessibility", to: "/accessibility" },
    ],
  },
] as const;

export const SiteFooter = () => (
  <footer className="bg-clay">
    <div className="page-shell grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-[1.2fr_repeat(5,1fr)]">
      <div>
        <p className="text-lg font-extrabold tracking-tight text-espresso">{BRAND.name}</p>
        <p className="mt-3 max-w-xs font-medium text-espresso-muted">{BRAND.tagline}</p>
      </div>

      {COLUMNS.map((column) => (
        <div key={column.heading}>
          <p className="font-bold text-espresso">{column.heading}</p>
          <ul className="mt-4 space-y-3">
            {column.links.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="font-medium text-espresso-muted transition-colors hover:text-espresso"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    <div className="border-t border-espresso/10">
      <div className="page-shell flex flex-wrap items-center justify-between gap-2 py-6 text-sm font-medium text-espresso-muted">
        <p>© {new Date().getFullYear()} {BRAND.legalName}</p>
        <Link to="/fair-housing" className="hover:text-espresso">
          Equal Housing Opportunity
        </Link>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
