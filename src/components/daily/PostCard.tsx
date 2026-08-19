import { Link } from "react-router-dom";
import type { UiPost } from "@/features/daily/post";
import { POST_TYPE_LABEL } from "@/features/daily/post";

/** Carried across from `Irvine Living Daily/src/components/site/PostCard.tsx`. */
export const PostCard = ({ post }: { post: UiPost }) => (
  <Link
    to={`/blog/${post.slug}`}
    className="group block overflow-hidden rounded-2xl border border-clay/50 bg-card transition hover:shadow-lg"
  >
    <div className="aspect-[16/10] overflow-hidden">
      <img
        src={post.heroImage}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
    </div>
    <div className="p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-espresso-muted">
        <span className="rounded-full bg-clay-soft px-2 py-0.5 text-espresso">
          {POST_TYPE_LABEL[post.type]}
        </span>
        <span>{post.topicName}</span>
        <span>· {post.readMinutes} min read</span>
      </div>
      <h2 className="mt-2 text-xl font-bold leading-snug tracking-tight text-espresso group-hover:underline">
        {post.title}
      </h2>
      <p className="mt-2 line-clamp-2 text-sm text-espresso-muted">{post.summary}</p>
    </div>
  </Link>
);

export default PostCard;
