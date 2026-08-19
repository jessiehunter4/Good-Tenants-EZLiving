import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ExternalLink, LogOut, Menu, X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { BRAND } from "@/config/brand";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ADMIN_NAV, isActivePath } from "@/features/admin/nav";

type AdminLayoutProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

/**
 * The admin console shell.
 *
 * Carried across from `Irvine Living Daily/src/routes/admin.tsx`: a fixed
 * sidebar on desktop, a scrolling chip rail on mobile, sign-out and a link back
 * to the public site. Access is enforced by the route guard around it and by
 * the admin-only policies on every table it reads.
 */
export const AdminLayout = ({ title, description, actions, children }: AdminLayoutProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/auth");
  };

  return (
    <div className="flex min-h-screen w-full bg-sand">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-clay/50 bg-card md:flex">
        <div className="border-b border-clay/50 px-5 py-5">
          <Link to="/" className="text-sm font-extrabold uppercase tracking-wider text-espresso">
            {BRAND.name}
          </Link>
          <p className="mt-1 text-xs text-espresso-muted">Admin console</p>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto p-3" aria-label="Admin">
          {ADMIN_NAV.map((group) => (
            <div key={group.heading}>
              <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-widest text-espresso-muted/70">
                {group.heading}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavRow key={item.to} active={isActivePath(item, pathname)} item={item} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="space-y-2 border-t border-clay/50 p-3">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-espresso-muted hover:bg-sand"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View public site
          </Link>
          <p className="truncate px-3 py-1 text-xs text-espresso-muted">{user?.email}</p>
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-espresso hover:bg-sand"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="flex items-center justify-between border-b border-clay/50 bg-card px-4 py-3 md:hidden">
          <Link to="/admin" className="font-bold text-espresso">
            Admin
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-md p-2 text-espresso"
            aria-label={open ? "Close admin menu" : "Open admin menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <nav
          className={cn("border-b border-clay/50 bg-card md:hidden", open ? "block" : "hidden")}
          aria-label="Admin, mobile"
        >
          <div className="space-y-0.5 p-3">
            {ADMIN_NAV.flatMap((g) => g.items).map((item) => (
              <NavRow
                key={item.to}
                item={item}
                active={isActivePath(item, pathname)}
                onNavigate={() => setOpen(false)}
              />
            ))}
            <button
              type="button"
              onClick={signOut}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-espresso hover:bg-sand"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </nav>

        <div className="mx-auto max-w-7xl p-6 md:p-8">
          <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-espresso">{title}</h1>
              {description && <p className="mt-1 text-sm text-espresso-muted">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </header>
          {children}
        </div>
      </main>
    </div>
  );
};

const NavRow = ({
  item,
  active,
  onNavigate,
}: {
  item: { to: string; label: string; icon: React.ComponentType<{ className?: string }> };
  active: boolean;
  onNavigate?: () => void;
}) => {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
        active ? "bg-espresso text-sand" : "text-espresso hover:bg-sand",
      )}
    >
      <Icon className="h-4 w-4" /> {item.label}
    </Link>
  );
};

export default AdminLayout;
