import { Link } from "react-router-dom";

import SiteLayout from "@/components/site/SiteLayout";
import PageHeading from "@/components/daily/PageHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RESOURCES } from "@/features/hub/content";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/**
 * Carried across from `Good Tenants Hub/src/routes/resources.tsx`.
 *
 * Everything on this page is unbuilt, and it says so — the source marked each
 * one "coming soon". Carrying it across as-is keeps a promise the brand has
 * already made visible rather than quietly dropping it; the things that do
 * exist are linked underneath, so the page is not purely a waiting room.
 */
const Resources = () => {
  useDocumentMeta({
    title: "Resources — Good Tenants EZ Living",
    description: "Get smarter about renting — applications, leases, deposits and rights.",
  });

  return (
    <SiteLayout>
      <div className="page-shell py-14">
        <PageHeading
          eyebrow="Learn"
          title="Resources"
          intro="Get smarter about renting — applications, leases, deposits and rights."
        />

        <div className="grid gap-4 md:grid-cols-2">
          {RESOURCES.map((resource) => (
            <Card key={resource.title} className="p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-bold text-espresso">{resource.title}</h2>
                <Badge variant="secondary" className="shrink-0">
                  Coming soon
                </Badge>
              </div>
              <p className="mt-2 text-sm text-espresso-muted">{resource.body}</p>
            </Card>
          ))}
        </div>

        <Card className="mt-8 border-clay bg-clay-soft p-6">
          <h2 className="text-lg font-bold text-espresso">Available now</h2>
          <p className="mt-1 text-sm text-espresso-muted">
            While those are being written, these already exist.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild className="bg-espresso text-sand hover:bg-espresso/90">
              <Link to="/blog">The daily</Link>
            </Button>
            <Button asChild variant="outline" className="border-clay text-espresso">
              <Link to="/ask">Ask a question</Link>
            </Button>
            <Button asChild variant="outline" className="border-clay text-espresso">
              <Link to="/case-studies">Case studies</Link>
            </Button>
            <Button asChild variant="outline" className="border-clay text-espresso">
              <Link to="/faq">FAQ</Link>
            </Button>
          </div>
        </Card>
      </div>
    </SiteLayout>
  );
};

export default Resources;
