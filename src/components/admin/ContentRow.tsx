import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import RowActions from "@/components/admin/RowActions";

type ContentRowProps = {
  title: string;
  slug: string;
  publishDate: string;
  published: boolean;
  topicName?: string | null;
  onEdit: () => void;
  onDelete: () => void;
};

/** One row in a content list: articles, questions and case studies share it. */
export const ContentRow = ({
  title,
  slug,
  publishDate,
  published,
  topicName,
  onEdit,
  onDelete,
}: ContentRowProps) => (
  <li className="flex items-center justify-between gap-4 p-4">
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <p className="truncate font-semibold text-espresso">{title}</p>
        {!published && <Badge variant="secondary">Draft</Badge>}
        {topicName && <Badge variant="outline">{topicName}</Badge>}
      </div>
      <p className="truncate text-xs text-espresso-muted">
        /blog/{slug} · {publishDate}
      </p>
    </div>

    <div className="flex shrink-0 items-center gap-1">
      <Button size="sm" variant="ghost" asChild aria-label={`View ${title}`}>
        <Link to={`/blog/${slug}`} target="_blank" rel="noreferrer">
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </Button>
      <RowActions
        onEdit={onEdit}
        onDelete={onDelete}
        editLabel={`Edit ${title}`}
        deleteLabel={`Delete ${title}`}
      />
    </div>
  </li>
);

export default ContentRow;
