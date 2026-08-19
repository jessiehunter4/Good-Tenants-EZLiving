// The contact form's write path.
//
// Carried across from `Good Tenants Hub/src/components/common/ContactForm.tsx`.
// The insert goes straight to `contact_messages` under a bounded public policy
// — anyone may send one, nobody but an admin may read one back.
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please give us a name").max(200),
  email: z.string().trim().email("A valid email, so we can reply").max(320),
  phone: z.string().trim().max(40),
  role: z.string().trim().max(40),
  message: z.string().trim().min(5, "Tell us a little more").max(4000),
});

export type ContactForm = z.infer<typeof contactSchema>;

export const EMPTY_CONTACT: ContactForm = {
  name: "",
  email: "",
  phone: "",
  role: "",
  message: "",
};

export function useSendContactMessage() {
  return useMutation({
    mutationFn: async ({
      values,
      sourcePath,
    }: {
      values: ContactForm;
      sourcePath: string;
    }) => {
      const parsed = contactSchema.parse(values);
      const { error } = await supabase.from("contact_messages").insert({
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone || null,
        role: parsed.role || null,
        message: parsed.message,
        source_path: sourcePath,
      });
      if (error) throw new Error(error.message);
    },
  });
}
