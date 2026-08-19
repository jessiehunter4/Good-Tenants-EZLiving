// Reviewing a rental drop: publish it as a post, or dismiss it.
//
// Carried across from `adminReviewDrop` / `publishDropById` in the daily's
// `lib/admin/drops.functions.ts`. The daily did both writes inside one server
// function; here they run in sequence from the browser under the admin policies
// on both tables.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { adminKey, type Row } from "./crud";
import { dropToPost, type DropOverrides } from "@/features/daily/dropToPost";
import { sectionsToJson } from "@/features/admin/contentSchemas";

type Drop = Row<"cshr_drops">;

export function usePublishDrop() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async ({ drop, overrides }: { drop: Drop; overrides?: DropOverrides }) => {
      // Already published: hand back the post rather than making a second one.
      if (drop.status === "published" && drop.property_post_id) {
        return drop.property_post_id;
      }

      const draft = dropToPost(drop, overrides);
      const { data, error } = await supabase
        .from("property_posts")
        .insert({ ...draft, sections: sectionsToJson(draft.sections) })
        .select("id")
        .single();
      if (error) throw new Error(error.message);

      const { error: linkError } = await supabase
        .from("cshr_drops")
        .update({ status: "published", property_post_id: data.id })
        .eq("id", drop.id);
      // The post exists at this point. Failing to mark the drop leaves it in
      // the inbox, which is recoverable; say so rather than implying nothing
      // happened.
      if (linkError) {
        throw new Error(
          `Published, but the drop stayed in the inbox: ${linkError.message}`,
        );
      }

      return data.id;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: adminKey("cshr_drops") });
      client.invalidateQueries({ queryKey: adminKey("property_posts") });
    },
  });
}

export function useDismissDrop() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("cshr_drops")
        .update({ status: "dismissed" })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: adminKey("cshr_drops") }),
  });
}
