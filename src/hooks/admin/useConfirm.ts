import { useCallback, useState } from "react";

export type PendingConfirm = { id: string; label: string };

/**
 * The state behind a confirmed destroy.
 *
 * Every admin list has the same interaction: click delete, name the thing in a
 * dialog, then act. Holding the pending row (rather than a bare boolean) is
 * what lets the dialog say *which* one — the difference between "Delete topic?"
 * and "Delete Market Updates?".
 */
export function useConfirm() {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const request = useCallback((id: string, label: string) => {
    setPending({ id, label });
  }, []);

  const dismiss = useCallback(() => setPending(null), []);

  const confirm = useCallback(
    (action: (id: string) => void) => {
      if (!pending) return;
      action(pending.id);
      setPending(null);
    },
    [pending],
  );

  return { pending, request, dismiss, confirm, isOpen: pending !== null };
}
