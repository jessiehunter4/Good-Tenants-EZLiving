// The public site's navigation, in one place.
//
// The merge gave the marketing site more than one page for the first time: the
// landing page still scrolls to its own sections, while the daily's pages need
// links that leave the page. Both read this file, so a new public route is one
// edit rather than an edit to every header and footer.
export type NavItem = { label: string; to: string };

// Landing page: same-page anchors, because the sections are all on it.
export const LANDING_NAV: readonly NavItem[] = [
  { label: "Rentals", to: "/rentals" },
  { label: "The daily", to: "#daily" },
  { label: "How it works", to: "#how-it-works" },
  { label: "For owners", to: "#owners" },
  { label: "FAQ", to: "#faq" },
];

// Everywhere else: real routes.
export const SITE_NAV: readonly NavItem[] = [
  { label: "Rentals", to: "/rentals" },
  { label: "The daily", to: "/blog" },
  { label: "Topics", to: "/topics" },
  { label: "Ask", to: "/ask" },
  { label: "Case studies", to: "/case-studies" },
  { label: "How it works", to: "/#how-it-works" },
];

export const READ_LINKS: readonly NavItem[] = [
  { label: "The daily", to: "/blog" },
  { label: "Topics", to: "/topics" },
  { label: "Ask a question", to: "/ask" },
  { label: "Case studies", to: "/case-studies" },
];

export function isAnchor(to: string): boolean {
  return to.startsWith("#");
}
