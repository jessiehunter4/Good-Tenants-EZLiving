import { Link } from "react-router-dom";
import { BRAND } from "@/config/brand";

const COLUMNS = [
  {
    heading: "For renters",
    links: [
      { label: "Create a profile", to: "/register?role=tenant" },
      { label: "How it works", to: "/#how-it-works" },
      { label: "Sign in", to: "/auth" },
    ],
  },
  {
    heading: "For landlords",
    links: [
      { label: "List a property", to: "/register?role=landlord" },
      { label: "Find tenants", to: "/register?role=landlord" },
    ],
  },
  {
    heading: "For agents",
    links: [
      { label: "Join as an agent", to: "/register?role=agent" },
      { label: "Submit a scenario", to: "/scenarios/new" },
    ],
  },
] as const;

export const LandingFooter = () => (
  <footer className="bg-clay">
    <div className="page-shell grid gap-10 py-16 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
      <div>
        <p className="text-lg font-extrabold tracking-tight text-espresso">{BRAND.name}</p>
        <p className="mt-3 max-w-xs font-medium text-espresso-muted">
          {BRAND.tagline}
        </p>
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
      <p className="page-shell py-6 text-sm font-medium text-espresso-muted">
        © {new Date().getFullYear()} {BRAND.legalName}
      </p>
    </div>
  </footer>
);

export default LandingFooter;
