import { Link } from "react-router-dom";

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
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
      <div>
        <p className="text-lg font-extrabold tracking-tight text-espresso">Good Tenants</p>
        <p className="mt-3 max-w-xs font-medium text-espresso-muted">
          Prove you qualify once, and decide who gets to see it.
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
      <p className="mx-auto max-w-6xl px-4 py-6 text-sm font-medium text-espresso-muted sm:px-6">
        © {new Date().getFullYear()} Good Tenants
      </p>
    </div>
  </footer>
);

export default LandingFooter;
