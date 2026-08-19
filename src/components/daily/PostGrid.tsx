import type { UiPost } from "@/features/daily/post";
import PostCard from "./PostCard";

type PostGridProps = {
  posts: readonly UiPost[];
  isLoading?: boolean;
  emptyMessage?: string;
};

const SKELETON_COUNT = 6;

/** A list of posts with the two states every list needs: loading, and nothing. */
export const PostGrid = ({ posts, isLoading, emptyMessage = "Nothing published here yet." }: PostGridProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-clay/50 bg-card">
            <div className="aspect-[16/10] animate-pulse bg-clay/40" />
            <div className="space-y-3 p-5">
              <div className="h-3 w-24 animate-pulse rounded bg-clay/40" />
              <div className="h-5 w-4/5 animate-pulse rounded bg-clay/40" />
              <div className="h-4 w-full animate-pulse rounded bg-clay/30" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="rounded-2xl border border-dashed border-clay bg-sand p-12 text-center">
        <p className="font-semibold text-espresso">{emptyMessage}</p>
        <p className="mt-1 text-sm text-espresso-muted">Check back soon — we publish most days.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={`${post.type}-${post.slug}`} post={post} />
      ))}
    </div>
  );
};

export default PostGrid;
