// Re-export so both historical import paths resolve to the same Sonner-backed
// implementation. See hooks/use-toast.ts for why the call signature is kept.
export { useToast, toast } from "@/hooks/use-toast";
export type { ToastOptions, ToastHandle } from "@/hooks/use-toast";
