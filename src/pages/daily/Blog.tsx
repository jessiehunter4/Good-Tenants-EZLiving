import { useQuery } from "@tanstack/react-query";

import SiteLayout from "@/components/site/SiteLayout";
import PageHeading from "@/components/daily/PageHeading";
import PostGrid from "@/components/daily/PostGrid";
import { allPostsQuery } from "@/hooks/daily/content";
import { adaptWrapped, byNewestFirst } from "@/features/daily/post";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/** Carried across from `Irvine Living Daily/src/routes/blog.index.tsx`. */
const Blog = () => {
  const { data = [], isLoading } = useQuery(allPostsQuery);
  const posts = data.map(adaptWrapped).sort(byNewestFirst);

  useDocumentMeta({
    title: "The daily — Good Tenants EZ Living",
    description:
      "Daily Irvine living: rental drops, community guides, market updates, and Good Tenants insight.",
  });

  return (
    <SiteLayout>
      <div className="page-shell py-14">
        <PageHeading
          eyebrow="Blog / news"
          title="Daily Irvine living"
          intro="Short posts published most days. Listings, lifestyle and the market — without the fluff."
        />
        <PostGrid posts={posts} isLoading={isLoading} />
      </div>
    </SiteLayout>
  );
};

export default Blog;
