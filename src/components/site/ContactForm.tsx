import { useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";

import EditorField from "@/components/admin/editor/EditorField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/hooks/admin/crud";
import {
  contactSchema,
  EMPTY_CONTACT,
  useSendContactMessage,
  type ContactForm as ContactValues,
} from "@/hooks/useContactMessage";

type ContactFormProps = {
  /** Prefills who is writing, so the reply goes to the right person. */
  defaultRole?: string;
  submitLabel?: string;
};

/** Carried across from `Good Tenants Hub/src/components/common/ContactForm.tsx`. */
export const ContactForm = ({
  defaultRole = "",
  submitLabel = "Send",
}: ContactFormProps) => {
  const { pathname } = useLocation();
  const [values, setValues] = useState<ContactValues>({
    ...EMPTY_CONTACT,
    role: defaultRole,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactValues, string>>>({});
  const [sent, setSent] = useState(false);
  const send = useSendContactMessage();

  const set = <K extends keyof ContactValues>(key: K, value: ContactValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const next: Partial<Record<keyof ContactValues, string>> = {};
      for (const issue of parsed.error.issues) {
        next[issue.path[0] as keyof ContactValues] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});

    send.mutate(
      { values: parsed.data, sourcePath: pathname },
      {
        onSuccess: () => {
          setSent(true);
          setValues({ ...EMPTY_CONTACT, role: defaultRole });
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-clay bg-clay-soft p-6 text-center">
        <p className="font-semibold text-espresso">Thank you — we have it.</p>
        <p className="mt-1 text-sm text-espresso-muted">
          Someone will come back to you, usually within one business day.
        </p>
        <Button
          variant="outline"
          className="mt-4 border-clay text-espresso"
          onClick={() => setSent(false)}
        >
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <EditorField label="Name" htmlFor="contact-name" error={errors.name}>
          <Input
            id="contact-name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </EditorField>
        <EditorField label="Email" htmlFor="contact-email" error={errors.email}>
          <Input
            id="contact-email"
            type="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </EditorField>
      </div>

      <EditorField label="Phone (optional)" htmlFor="contact-phone">
        <Input
          id="contact-phone"
          type="tel"
          value={values.phone}
          onChange={(e) => set("phone", e.target.value)}
        />
      </EditorField>

      <EditorField label="How can we help?" htmlFor="contact-message" error={errors.message}>
        <Textarea
          id="contact-message"
          rows={4}
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
        />
      </EditorField>

      <Button
        type="submit"
        disabled={send.isPending}
        className="bg-espresso text-sand hover:bg-espresso/90"
      >
        {send.isPending ? "Sending…" : submitLabel}
      </Button>
    </form>
  );
};

export default ContactForm;
