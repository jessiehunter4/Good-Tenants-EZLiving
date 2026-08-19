import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

type StatTileProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  to?: string;
  hint?: string;
};

/** Carried across from the daily's admin dashboard StatCard. */
export const StatTile = ({ label, value, icon: Icon, to, hint }: StatTileProps) => {
  const body = (
    <Card className="p-5 transition hover:bg-sand">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-espresso-muted" />
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-espresso-muted">{label}</p>
          <p className="mt-0.5 truncate text-2xl font-bold text-espresso">{value}</p>
          {hint && <p className="text-xs text-espresso-muted">{hint}</p>}
        </div>
      </div>
    </Card>
  );
  return to ? <Link to={to}>{body}</Link> : body;
};

export default StatTile;
