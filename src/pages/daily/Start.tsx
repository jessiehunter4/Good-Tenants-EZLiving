import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";
import { toast } from "sonner";

import SiteLayout from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  LEAD_INTENTS,
  resolveIntent,
  resolveSource,
} from "@/features/daily/leadIntents";
import { useSubmitLead } from "@/hooks/daily/useSubmissions";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

const EMPTY_FORM = { name: "", email: "", phone: "", message: "" };

/**
 * Carried across from `Irvine Living Daily/src/routes/start.tsx`.
 *
 * One page behind every CTA in the daily. The `intent` in the query string
 * decides what it promises and what it asks for, which is why the CTA library
 * in `cta_destinations` points at `/start?intent=…` rather than at five pages.
 */
const Start = () => {
  const [params] = useSearchParams();
  const intent = resolveIntent(params.get("intent"));
  const config = LEAD_INTENTS[intent];

  const [form, setForm] = useState(EMPTY_FORM);
  const [done, setDone] = useState(false);
  const submit = useSubmitLead();

  useDocumentMeta({
    title: `${config.title} — Good Tenants EZ Living`,
    description: config.description,
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit.mutate(
      {
        intent,
        source: resolveSource(params.get("source")),
        source_slug: params.get("utm_campaign"),
        name: form.name || null,
        email: form.email || null,
        phone: form.phone || null,
        message: form.message || null,
        utm_source: params.get("utm_source"),
        utm_medium: params.get("utm_medium"),
        utm_campaign: params.get("utm_campaign"),
        utm_content: params.get("utm_content"),
      },
      {
        onSuccess: () => {
          setDone(true);
          toast.success(config.successMessage);
        },
        onError: (error: unknown) => {
          const message =
            error instanceof Error ? error.message : "Submission failed. Please try again.";
          toast.error(message);
        },
      },
    );
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
        <p className="text-sm font-bold uppercase tracking-widest text-espresso-muted">
          {config.kicker}
        </p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-espresso sm:text-5xl">
          {config.title}
        </h1>
        <p className="mt-4 text-lg text-espresso-muted">{config.description}</p>

        {done ? (
          <div className="mt-8 rounded-2xl border border-clay bg-clay-soft p-8 text-center">
            <Check className="mx-auto mb-3 h-12 w-12 text-success" />
            <p className="text-2xl font-bold tracking-tight text-espresso">Thank you.</p>
            <p className="mt-2 text-espresso-muted">{config.successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="lead-name">Name</Label>
                <Input
                  id="lead-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  maxLength={200}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="lead-email">Email</Label>
                <Input
                  id="lead-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  maxLength={320}
                  className="mt-1.5"
                />
              </div>
            </div>

            {config.showPhone && (
              <div>
                <Label htmlFor="lead-phone">Phone (optional)</Label>
                <Input
                  id="lead-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  maxLength={40}
                  className="mt-1.5"
                />
              </div>
            )}

            {config.showMessage && (
              <div>
                <Label htmlFor="lead-message">Tell us a bit about your move (optional)</Label>
                <Textarea
                  id="lead-message"
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  maxLength={4000}
                  className="mt-1.5"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={submit.isPending}
              className="w-full rounded-full bg-espresso px-6 py-3 text-sand hover:bg-espresso/90 sm:w-auto"
            >
              {submit.isPending ? "Sending…" : config.cta}
            </Button>
          </form>
        )}

        <ul className="mt-10 space-y-3 text-sm">
          {config.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 flex-none text-success" />
              <span className="text-espresso">{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </SiteLayout>
  );
};

export default Start;
