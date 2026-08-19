import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import SiteLayout from "@/components/site/SiteLayout";
import PostGrid from "@/components/daily/PostGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { allPostsQuery } from "@/hooks/daily/content";
import { adaptWrapped, byNewestFirst } from "@/features/daily/post";
import { askHeroImage } from "@/features/daily/images";
import { useSubmitQuestion } from "@/hooks/daily/useSubmissions";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

const EMPTY_FORM = { name: "", email: "", question: "", context: "" };

/** Carried across from `Irvine Living Daily/src/routes/ask.tsx`. */
const Ask = () => {
  const navigate = useNavigate();
  const { data = [], isLoading } = useQuery(allPostsQuery);
  const answered = data.filter((w) => w.type === "qa").map(adaptWrapped).sort(byNewestFirst);

  const [form, setForm] = useState(EMPTY_FORM);
  const submit = useSubmitQuestion();

  useDocumentMeta({
    title: "Ask Good Tenants — Good Tenants EZ Living",
    description:
      "Real questions from Irvine renters and owners, answered by Good Tenants leasing specialists.",
  });

  const scrollToForm = () => {
    document.getElementById("ask-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => document.getElementById("ask-name")?.focus(), 400);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit.mutate(form, {
      onSuccess: () => navigate("/ask/thanks"),
      onError: (error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Couldn't submit just now. Please try again.";
        toast.error(message);
      },
    });
  };

  return (
    <SiteLayout>
      <section className="relative h-44 w-full overflow-hidden md:h-56">
        <img src={askHeroImage} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-espresso/85 via-espresso/60 to-espresso/30" />
        <div className="absolute inset-0 flex items-center">
          <div className="page-shell text-sand">
            <p className="text-xs font-bold uppercase tracking-widest text-sand/80">Q&amp;A</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">
              Ask Good Tenants
            </h1>
            <p className="mt-1 max-w-xl text-sm text-sand/90 md:text-base">
              Got a question? Ask a Good Tenants leasing specialist.
            </p>
            <Button
              type="button"
              onClick={scrollToForm}
              className="mt-3 rounded-full bg-sand text-espresso hover:bg-sand/90"
            >
              Ask your question
            </Button>
          </div>
        </div>
      </section>

      <div className="page-shell py-12">
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-espresso">Recent answers</h2>
        <PostGrid
          posts={answered}
          isLoading={isLoading}
          emptyMessage="No questions answered yet — be the first to ask below."
        />
      </div>

      <section id="ask-form" className="scroll-mt-20 border-t border-clay/50 bg-sand">
        <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-espresso">
            Ask your question
          </h2>
          <p className="mt-2 text-espresso-muted">
            A Good Tenants leasing specialist responds personally. Name and email are required so we
            can reach you.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-4 rounded-2xl border border-clay/50 bg-card p-6"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="ask-name">Name</Label>
                <Input
                  id="ask-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  maxLength={120}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="ask-email">Email</Label>
                <Input
                  id="ask-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  maxLength={200}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ask-question">Your question</Label>
              <Textarea
                id="ask-question"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                required
                rows={4}
                maxLength={4000}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="ask-context">Context (optional)</Label>
              <Textarea
                id="ask-context"
                value={form.context}
                onChange={(e) => setForm({ ...form, context: e.target.value })}
                rows={3}
                maxLength={4000}
                placeholder="Anything that would help us answer better"
                className="mt-1.5"
              />
            </div>

            <Button
              type="submit"
              disabled={submit.isPending}
              className="rounded-full bg-espresso px-6 text-sand hover:bg-espresso/90"
            >
              {submit.isPending ? "Sending…" : "Submit your question"}
            </Button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Ask;
