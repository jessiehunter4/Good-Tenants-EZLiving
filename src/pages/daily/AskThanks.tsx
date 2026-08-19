import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

import SiteLayout from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/** Carried across from `Irvine Living Daily/src/routes/ask.thanks.tsx`. */
const AskThanks = () => {
  useDocumentMeta({ title: "Thanks — Ask Good Tenants", noindex: true });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-5 py-24 text-center sm:px-8">
        <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-espresso">
          Thanks — we got your question
        </h1>
        <p className="mt-4 text-lg text-espresso-muted">
          A Good Tenants leasing specialist will respond shortly. Keep an eye on your inbox.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-full bg-espresso px-6 text-sand hover:bg-espresso/90">
            <Link to="/ask">Back to questions</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full border-clay px-6 text-espresso">
            <Link to="/">Home</Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
};

export default AskThanks;
