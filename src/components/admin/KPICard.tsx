import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: number | string;
  icon?: LucideIcon;
  children?: React.ReactNode;
}

/**
 * A headline number with its breakdown.
 *
 * The number is the point, so it gets the size; the breakdown sits below a rule
 * rather than running on directly from it, which is what made these read as one
 * undifferentiated column of text.
 */
const KPICard = ({ title, value, icon: Icon, children }: KPICardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      {Icon && <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
    </CardHeader>
    <CardContent>
      <div className={cn("text-3xl font-bold tabular-nums", value === 0 && "text-muted-foreground")}>
        {value}
      </div>
      {children}
    </CardContent>
  </Card>
);

export default KPICard;
