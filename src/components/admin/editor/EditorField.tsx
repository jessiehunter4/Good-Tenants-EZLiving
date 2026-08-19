import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import FieldError from "@/components/admin/FieldError";

type EditorFieldProps = {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

/** Label, control, hint and error — the shape every editor row has. */
export const EditorField = ({ label, htmlFor, hint, error, children }: EditorFieldProps) => (
  <div>
    <Label htmlFor={htmlFor} className="mb-1.5 block">
      {label}
    </Label>
    {children}
    {hint && !error && <p className="mt-1 text-xs text-espresso-muted">{hint}</p>}
    <FieldError message={error} />
  </div>
);

export default EditorField;
