import { useQuery } from "@tanstack/react-query";

import SiteLayout from "@/components/site/SiteLayout";
import PageHeading from "@/components/daily/PageHeading";
import PostGrid from "@/components/daily/PostGrid";
import { allPostsQuery } from "@/hooks/daily/content";
import { adaptWrapped, byNewestFirst } from "@/features/daily/post";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/** Carried across from `Irvine Living Daily/src/routes/case-studies.tsx`. */
const CaseStudies = () => {
  const { data = [], isLoading } = useQuery(allPostsQuery);
  const posts = data
    .filter((w) => w.type === "case-study")
    .map(adaptWrapped)
    .sort(byNewestFirst);

  useDocumentMeta({
    title: "Case studies — Good Tenants EZ Living",
    description:
      "Real Irvine relocation and leasing stories from the Jessie Hunter Team and Good Tenants.",
  });

  return (
    <SiteLayout>
      <div className="page-shell py-14">
        <PageHeading
          eyebrow="Proof"
          title="Case studies"
          intro="Real relocations, real leases — and what it took to get them done."
        />
        <PostGrid posts={posts} isLoading={isLoading} emptyMessage="No case studies published yet." />
      </div>
    </SiteLayout>
  );
};

export default CaseStudies;
