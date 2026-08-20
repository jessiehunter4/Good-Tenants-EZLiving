import {
  BadgeCheck,
  Bell,
  CalendarDays,
  FileText,
  Home,
  Inbox,
  LayoutDashboard,
  Lightbulb,
  Megaphone,
  MessageCircleQuestion,
  Tag,
  Target,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AdminNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export type AdminNavGroup = {
  heading: string;
  items: readonly AdminNavItem[];
};

/**
 * The merged admin nav.
 *
 * Two consoles become one sidebar. The platform's own screens keep the top
 * group; the daily's editorial console — carried across from
 * `Irvine Living Daily/src/routes/admin.tsx` — becomes the two below it, in the
 * order it had.
 *
 * One rename: the daily's "Properties" screen manages rental *drops* — the feed
 * queue and the property posts written from it — and this app already has a
 * properties concept that means something else. It is `/admin/drops` here so
 * the two cannot be mistaken for each other.
 */
export const ADMIN_NAV: readonly AdminNavGroup[] = [
  {
    heading: "Platform",
    items: [
      { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
      { to: "/admin/team", label: "Team", icon: Users },
      { to: "/admin/verification", label: "Verification", icon: BadgeCheck },
    ],
  },
  {
    heading: "Publishing",
    items: [
      { to: "/admin/calendar", label: "Content calendar", icon: CalendarDays },
      { to: "/admin/drops", label: "Rental drops", icon: Home },
      { to: "/admin/articles", label: "Articles", icon: FileText },
      { to: "/admin/ask", label: "Ask Q&A", icon: MessageCircleQuestion },
      { to: "/admin/case-studies", label: "Case studies", icon: Trophy },
      { to: "/admin/topics", label: "Topics", icon: Tag },
      { to: "/admin/promos", label: "Sidebar promos", icon: Megaphone },
    ],
  },
  {
    heading: "Pipeline & inbox",
    items: [
      { to: "/admin/seeds", label: "Article seeds", icon: Lightbulb },
      { to: "/admin/ctas", label: "CTA library", icon: Target },
      { to: "/admin/leads", label: "Leads", icon: UserPlus },
      { to: "/admin/inbox", label: "Questions inbox", icon: Inbox },
      { to: "/admin/notifications", label: "Notifications", icon: Bell },
    ],
  },
];

export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = ADMIN_NAV.flatMap(
  (group) => group.items,
);

export function isActivePath(item: AdminNavItem, pathname: string): boolean {
  return item.exact ? pathname === item.to : pathname.startsWith(item.to);
}
