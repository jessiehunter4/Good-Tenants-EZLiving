import { Link } from "react-router-dom";
import { BookOpen, MessageCircleQuestion, Phone } from "lucide-react";

import SiteLayout from "@/components/site/SiteLayout";
import PageHeading from "@/components/daily/PageHeading";
import { Card } from "@/components/ui/card";
import { COMPANY } from "@/features/hub/content";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

const ROUTES = [
  {
    icon: BookOpen,
    title: "Read the FAQ",
    body: "What the application package is, who sees your documents, whether we store SSNs.",
    to: "/faq",
  },
  {
    icon: MessageCircleQuestion,
    title: "Ask a question",
    body: "A leasing specialist answers personally, and we publish the answer for the next person.",
    to: "/ask",
  },
  {
    icon: Phone,
    title: "Talk to someone",
    body: `Call ${COMPANY.phone}, or send a message and we will come back to you.`,
    to: "/contact",
  },
];

/** Carried across from `Good Tenants Hub/src/routes/help.tsx`. */
const Help = () => {
  useDocumentMeta({
    title: "Help — Good Tenants EZ Living",
    description: "Find answers, ask a question, or talk to someone.",
  });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <PageHeading
          eyebrow="Support"
          title="Help"
          intro="Start with the FAQ, or reach out — someone answers."
        />

        <div className="grid gap-4">
          {ROUTES.map((route) => {
            const Icon = route.icon;
            return (
              <Link key={route.to} to={route.to}>
                <Card className="flex items-start gap-4 p-6 transition hover:shadow-md">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-clay-soft">
                    <Icon className="h-5 w-5 text-espresso" />
                  </div>
                  <div>
                    <h2 className="font-bold text-espresso">{route.title}</h2>
                    <p className="mt-1 text-sm text-espresso-muted">{route.body}</p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        <p className="mt-8 text-sm text-espresso-muted">
          Trouble signing in?{" "}
          <Link to="/forgot-password" className="font-semibold text-espresso underline">
            Reset your password
          </Link>
          .
        </p>
      </div>
    </SiteLayout>
  );
};

export default Help;
