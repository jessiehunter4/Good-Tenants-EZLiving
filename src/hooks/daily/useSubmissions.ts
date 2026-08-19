// The two public write paths the daily has: a question, and a lead capture.
//
// Both ran as server functions with a service-role client. Here they are direct
// inserts under RLS: the tables carry bounded public INSERT policies, so the
// database enforces the same limits the server function used to. The zod
// schemas stay anyway — a form should say what is wrong before a round trip.
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { LeadIntent, LeadSource } from "@/features/daily/leadIntents";

const questionSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(120),
  email: z.string().trim().email("Please enter a valid email").max(200),
  question: z.string().trim().min(5, "Please write at least a few words").max(4000),
  context: z.string().trim().max(4000).optional(),
});

export type QuestionInput = z.infer<typeof questionSchema>;

export function useSubmitQuestion() {
  return useMutation({
    mutationFn: async (input: QuestionInput) => {
      const parsed = questionSchema.parse(input);
      const { error } = await supabase.from("question_submissions").insert({
        name: parsed.name,
        email: parsed.email,
        question: parsed.question,
        context: parsed.context || null,
        user_agent: navigator.userAgent.slice(0, 500),
      });
      if (error) throw new Error(error.message);
    },
  });
}

const leadSchema = z
  .object({
    intent: z.string().trim().min(1).max(80),
    source: z.string().trim().max(20),
    source_slug: z.string().trim().max(200).nullable(),
    name: z.string().trim().max(200).nullable(),
    email: z.string().trim().email("Please enter a valid email").max(320).nullable(),
    phone: z.string().trim().max(40).nullable(),
    message: z.string().trim().max(4000).nullable(),
    utm_source: z.string().trim().max(200).nullable(),
    utm_medium: z.string().trim().max(200).nullable(),
    utm_campaign: z.string().trim().max(200).nullable(),
    utm_content: z.string().trim().max(200).nullable(),
  })
  .refine((d) => !!d.email || !!d.phone, {
    message: "Please provide an email or phone number so we can follow up",
    path: ["email"],
  });

export type LeadInput = {
  intent: LeadIntent;
  source: LeadSource;
  source_slug: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
};

export function useSubmitLead() {
  return useMutation({
    mutationFn: async (input: LeadInput) => {
      // Validate, then insert the input rather than the parse output: zod's
      // inferred output makes every nullable field optional, which no longer
      // matches the row's required `intent` now that the generated types
      // describe the real table.
      leadSchema.parse(input);
      const { error } = await supabase.from("lead_captures").insert(input);
      if (error) throw new Error(error.message);
    },
  });
}
