import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import SiteLayout from "@/components/site/SiteLayout";
import PageHeading from "@/components/daily/PageHeading";
import PostGrid from "@/components/daily/PostGrid";
import { allPostsQuery, topicsQuery } from "@/hooks/daily/content";
import { adaptWrapped, byNewestFirst } from "@/features/daily/post";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/** Carried across from `Irvine Living Daily/src/routes/topics.$slug.tsx`. */
const TopicDetail = () => {
  const { slug = "" } = useParams();
  const { data: topics = [] } = useQuery(topicsQuery);
  const { data: rawPosts = [], isLoading } = useQuery(allPostsQuery);

  const topic = topics.find((t) => t.slug === slug);
  const posts = rawPosts.map(adaptWrapped).filter((p) => p.topicSlug === slug).sort(byNewestFirst);

  useDocumentMeta({
    title: `${topic?.name ?? slug} — Good Tenants EZ Living`,
    description: topic?.description || `Posts on ${topic?.name ?? slug}.`,
  });

  return (
    <SiteLayout>
      <div className="page-shell py-14">
        <PageHeading
          eyebrow="Topic"
          title={topic?.name ?? slug}
          intro={topic?.description ?? undefined}
        />
        <PostGrid
          posts={posts}
          isLoading={isLoading}
          emptyMessage="Nothing published under this topic yet."
        />
      </div>
    </SiteLayout>
  );
};

export default TopicDetail;
