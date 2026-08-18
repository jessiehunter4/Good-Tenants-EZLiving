import { useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/**
 * The question box.
 *
 * It writes to question_submissions, the one table an anonymous visitor may
 * insert into — so this is a real inbox an admin can triage, not a decorative
 * newsletter field that drops what people type.
 */
export const HelpSection = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (question.trim().length < 5) {
      toast({
        title: "Tell us a little more",
        description: "A few words about what you need help with.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    const { error } = await supabase.from("question_submissions").insert({
      email: email || null,
      question: question.trim(),
      context: "landing page",
      user_agent: navigator.userAgent,
    });
    setSending(false);

    if (error) {
      toast({
        title: "That did not send",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setSent(true);
    setEmail("");
    setQuestion("");
  };

  return (
    <section id="help" className="bg-sand py-20 sm:py-28">
      <div className="page-shell max-w-2xl text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-espresso sm:text-4xl">
          Questions? Ask us
        </h2>
        <p className="mt-4 text-lg font-medium text-espresso-muted">
          A person reads these. If you are mid-application and stuck, say so and we will help.
        </p>

        {sent ? (
          <div className="mt-10 flex items-center justify-center gap-3 rounded-2xl bg-clay p-8">
            <CheckCircle2 className="h-5 w-5 text-espresso" aria-hidden="true" />
            <p className="font-semibold text-espresso">
              Got it. We will come back to you.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-10 space-y-3 text-left">
            <label className="relative block">
              <span className="sr-only">Your email</span>
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-muted"
                aria-hidden="true"
              />
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Your email address"
                autoComplete="email"
                className="h-12 border-0 bg-clay pl-9 text-espresso placeholder:text-espresso-muted"
              />
            </label>

            <label className="block">
              <span className="sr-only">Your question</span>
              <Textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="What can we help with?"
                rows={4}
                className="border-0 bg-clay text-espresso placeholder:text-espresso-muted"
              />
            </label>

            <Button
              type="submit"
              disabled={sending}
              className="h-12 w-full bg-espresso text-sand hover:bg-espresso/90"
            >
              {sending ? "Sending…" : "Send"}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
};

export default HelpSection;
