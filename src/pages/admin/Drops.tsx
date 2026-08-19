import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bath, BedDouble, CheckCircle2, ExternalLink, Square, X } from "lucide-react";
import { toast } from "sonner";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminList from "@/components/admin/AdminTable";
import ContentRow from "@/components/admin/ContentRow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  adminListQuery,
  errorMessage,
  useAdminDelete,
  type Row,
} from "@/hooks/admin/crud";
import { topicsQuery } from "@/hooks/admin/queries";
import { useConfirm } from "@/hooks/admin/useConfirm";
import { useDismissDrop, usePublishDrop } from "@/hooks/admin/useDrops";
import DropSettings from "@/components/admin/DropSettings";

type Drop = Row<"cshr_drops">;

const postsQuery = adminListQuery("property_posts", [
  { column: "publish_date", ascending: false },
]);
const dropsQuery = adminListQuery("cshr_drops", [{ column: "synced_at", ascending: false }]);

/**
 * Carried across from `Irvine Living Daily/src/routes/admin.properties.tsx`,
 * renamed: it manages rental *drops*, and this app's "properties" are
 * something else entirely.
 *
 * Two of the daily's buttons did not come across, both for the same reason —
 * they need a server runtime. "Pull feed now" called out to the listings site,
 * and "Score" asked a model to rank a drop. Reviewing by hand works either way,
 * and phase 02 replaces the ingestion behind this screen anyway.
 */
const AdminDrops = () => {
  const [tab, setTab] = useState("published");

  return (
    <AdminLayout
      title="Rental drops"
      description="Published rental posts, the incoming feed, and how the daily pick is made."
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="settings">Selection</TabsTrigger>
        </TabsList>

        <TabsContent value="published" className="mt-6">
          <PublishedPosts />
        </TabsContent>
        <TabsContent value="inbox" className="mt-6">
          <DropInbox />
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <DropSettings />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

const PublishedPosts = () => {
  const { data = [], isLoading, error } = useQuery(postsQuery);
  const { data: topics = [] } = useQuery(topicsQuery);
  const remove = useAdminDelete("property_posts");
  const confirm = useConfirm();

  return (
    <>
      <AdminList
        isLoading={isLoading}
        isEmpty={data.length === 0}
        error={error}
        emptyMessage="No rental posts published yet."
      >
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-clay/50">
            {data.map((post) => (
              <ContentRow
                key={post.id}
                title={post.headline}
                slug={post.slug}
                publishDate={post.publish_date}
                published={post.published}
                topicName={topics.find((t) => t.id === post.topic_id)?.name ?? null}
                onEdit={() => toast.info("Rental posts are written from the inbox.")}
                onDelete={() => confirm.request(post.id, post.headline)}
              />
            ))}
          </ul>
        </Card>
      </AdminList>

      <ConfirmDialog
        open={confirm.isOpen}
        onOpenChange={(v) => !v && confirm.dismiss()}
        onConfirm={() =>
          confirm.confirm((id) =>
            remove.mutate(id, {
              onSuccess: () => toast.success("Rental post deleted"),
              onError: (e) => toast.error(errorMessage(e)),
            }),
          )
        }
        title="Delete this rental post?"
        description={
          confirm.pending
            ? `“${confirm.pending.label}” and its URL go away permanently. The drop it came from stays in the inbox.`
            : ""
        }
        confirmText="Delete"
        variant="destructive"
        isLoading={remove.isPending}
      />
    </>
  );
};

const DropInbox = () => {
  const { data = [], isLoading, error } = useQuery(dropsQuery);
  const pending = data.filter((d) => d.status === "pending");
  const publish = usePublishDrop();
  const dismiss = useDismissDrop();
  const [reviewing, setReviewing] = useState<Drop | null>(null);

  return (
    <>
      <AdminList
        isLoading={isLoading}
        isEmpty={pending.length === 0}
        error={error}
        emptyMessage="Nothing waiting. New listings appear here when the feed syncs."
      >
        <div className="grid gap-3">
          {pending.map((drop) => (
            <Card key={drop.id} className="flex overflow-hidden">
              {drop.hero_image && (
                <img
                  src={drop.hero_image}
                  alt=""
                  loading="lazy"
                  className="h-40 w-40 shrink-0 object-cover"
                />
              )}
              <div className="min-w-0 flex-1 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate font-semibold leading-tight text-espresso">
                    {drop.headline || drop.address || "Untitled listing"}
                  </h3>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {drop.selection_score != null && (
                      <Badge variant={drop.selection_score >= 70 ? "default" : "secondary"}>
                        {drop.selection_score}
                      </Badge>
                    )}
                    {drop.price != null && (
                      <Badge variant="secondary">
                        ${Number(drop.price).toLocaleString()}/mo
                      </Badge>
                    )}
                  </div>
                </div>

                {drop.address && (
                  <p className="mt-1 truncate text-xs text-espresso-muted">{drop.address}</p>
                )}
                {drop.selection_notes && (
                  <p className="mt-1 line-clamp-2 text-xs text-espresso-muted">
                    {drop.selection_notes}
                  </p>
                )}

                <div className="mt-2 flex flex-wrap gap-3 text-xs text-espresso-muted">
                  {drop.beds != null && (
                    <span className="flex items-center gap-1">
                      <BedDouble className="h-3 w-3" />
                      {drop.beds} bd
                    </span>
                  )}
                  {drop.baths != null && (
                    <span className="flex items-center gap-1">
                      <Bath className="h-3 w-3" />
                      {drop.baths} ba
                    </span>
                  )}
                  {drop.sqft != null && (
                    <span className="flex items-center gap-1">
                      <Square className="h-3 w-3" />
                      {drop.sqft.toLocaleString()} sqft
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <a href={drop.listing_url} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Source listing
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    className="bg-espresso text-sand hover:bg-espresso/90"
                    onClick={() => setReviewing(drop)}
                    disabled={publish.isPending}
                  >
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Publish
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      dismiss.mutate(drop.id, {
                        onSuccess: () => toast.success("Drop dismissed"),
                        onError: (e) => toast.error(errorMessage(e)),
                      })
                    }
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" /> Dismiss
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </AdminList>

      <ConfirmDialog
        open={reviewing !== null}
        onOpenChange={(v) => !v && setReviewing(null)}
        onConfirm={() => {
          if (!reviewing) return;
          publish.mutate(
            { drop: reviewing },
            {
              onSuccess: () => {
                toast.success("Published to the daily");
                setReviewing(null);
              },
              onError: (e) => toast.error(errorMessage(e)),
            },
          );
        }}
        title="Publish this rental?"
        description={
          reviewing
            ? `“${reviewing.headline || reviewing.address}” goes live immediately as a rental drop post, with a quick-facts block built from the feed. You can edit it afterwards.`
            : ""
        }
        confirmText="Publish"
        isLoading={publish.isPending}
      />
    </>
  );
};

export default AdminDrops;
