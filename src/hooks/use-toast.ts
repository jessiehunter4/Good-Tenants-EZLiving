import { toast as sonner } from "sonner";

/**
 * Toast, backed by Sonner.
 *
 * This module used to be the shadcn Radix toast: a ~190 line reducer, a manual
 * queue, a hardcoded limit of one visible toast, and a removal delay of
 * 1,000,000ms that meant dismissed toasts were never garbage collected.
 *
 * Sonner replaces all of it. Stacking, swipe to dismiss, promise toasts, screen
 * reader announcements and reduced motion are handled by the library.
 *
 * The call signature is deliberately unchanged. Thirty-one call sites use
 * `toast({ title, description, variant })`, and rewriting them all to Sonner's
 * native API would be a large diff with nothing to show for it. Swapping the
 * implementation upgrades every one of them without touching a single caller.
 *
 * New code can import Sonner directly for the nicer API:
 *   import { toast } from "sonner";
 *   toast.success("Saved");
 *   toast.promise(save(), { loading: "Saving", success: "Saved", error: "Failed" });
 */

type ToastVariant = "default" | "destructive" | "success";

export interface ToastOptions {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastHandle {
  id: string | number;
  dismiss: () => void;
}

/** Sonner wants a string message; callers sometimes pass a node. */
function asMessage(value: React.ReactNode, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function toast({
  title,
  description,
  variant = "default",
  duration,
  action,
}: ToastOptions): ToastHandle {
  const message = asMessage(title, asMessage(description, "Notification"));

  // When only a title was given, it becomes the message and there is no body.
  const body =
    typeof description === "string" && description !== message
      ? description
      : undefined;

  const options = {
    description: body,
    duration,
    action: action
      ? { label: action.label, onClick: action.onClick }
      : undefined,
  };

  const id =
    variant === "destructive"
      ? sonner.error(message, options)
      : variant === "success"
        ? sonner.success(message, options)
        : sonner(message, options);

  return { id, dismiss: () => sonner.dismiss(id) };
}

export function useToast() {
  return {
    toast,
    dismiss: (id?: string | number) => sonner.dismiss(id),
    /**
     * Kept for compatibility. The old implementation exposed its internal
     * queue here and a couple of components read it. Sonner owns rendering, so
     * there is nothing to expose; an empty array keeps those components working
     * rather than crashing on undefined.
     */
    toasts: [] as const,
  };
}
