import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

type AdminListProps = {
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  error?: unknown;
  children: ReactNode;
};

/**
 * The three states every admin list has to handle.
 *
 * The daily's screens rendered `(q.data ?? []).map(...)` and showed nothing at
 * all while loading or when a query failed — a failed admin query looked
 * exactly like an empty table, which is how "why does it say no data" starts.
 */
export const AdminList = ({
  isLoading,
  isEmpty,
  emptyMessage = "Nothing here yet.",
  error,
  children,
}: AdminListProps) => {
  if (error) {
    return (
      <Card className="border-destructive/40 bg-destructive/5 p-6">
        <p className="font-semibold text-destructive">Couldn't load this.</p>
        <p className="mt-1 text-sm text-espresso-muted">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-clay/30" />
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <Card className="border-dashed p-10 text-center">
        <p className="font-semibold text-espresso">{emptyMessage}</p>
      </Card>
    );
  }

  return <>{children}</>;
};

export default AdminList;
