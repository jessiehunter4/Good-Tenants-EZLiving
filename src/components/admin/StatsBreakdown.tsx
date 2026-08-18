import { cn } from "@/lib/utils";

interface StatsItemProps {
  label: string;
  value: number;
}

export const StatsItem = ({ label, value }: StatsItemProps) => (
  <div className="flex items-baseline justify-between gap-3">
    <span className="text-muted-foreground">{label}</span>
    {/* Zero is dimmed so a row of them does not read with the same weight as a
        real count. tabular-nums keeps the column straight. */}
    <span className={cn("font-medium tabular-nums", value === 0 && "text-muted-foreground/60")}>
      {value}
    </span>
  </div>
);

interface StatsBreakdownProps {
  items: { label: string; value: number }[];
}

const StatsBreakdown = ({ items }: StatsBreakdownProps) => (
  <div className="mt-4 space-y-1.5 border-t pt-3 text-sm">
    {items.map((item) => (
      <StatsItem key={item.label} label={item.label} value={item.value} />
    ))}
  </div>
);

export default StatsBreakdown;
