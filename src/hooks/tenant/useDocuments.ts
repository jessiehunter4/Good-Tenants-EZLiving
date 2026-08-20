// A renter's documents: listing, uploading, removing.
//
// The upload writes to a private bucket whose policies match on the first path
// segment being the owner's user id, so a renter can only ever write under
// their own prefix. Reading a file back goes through a signed URL rather than a
// public one — the bucket is not public, which is the point.
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Row } from "@/hooks/admin/crud";
import { rejectReason, type DocumentKind } from "@/features/tenant/documents";

export type ApplicationDocument = Row<"application_documents">;

const BUCKET = "tenant-documents";
const SIGNED_URL_SECONDS = 60;
const documentsKey = ["tenant", "documents"] as const;

export const myDocumentsQuery = queryOptions({
  queryKey: documentsKey,
  queryFn: async (): Promise<ApplicationDocument[]> => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return [];

    const { data, error } = await supabase
      .from("application_documents")
      .select("*")
      .eq("tenant_id", auth.user.id)
      .order("upload_date", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
});

export function useUploadDocument() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, kind }: { file: File; kind: DocumentKind }) => {
      const problem = rejectReason(file);
      if (problem) throw new Error(problem);

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("You need to be signed in to upload.");

      // The owner's id is the first segment because that is what the storage
      // policy matches on. Changing this shape breaks the policy silently.
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const path = `${auth.user.id}/${kind}-${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw new Error(uploadError.message);

      const { error } = await supabase.from("application_documents").insert({
        tenant_id: auth.user.id,
        document_type: kind,
        file_name: file.name,
        file_url: `${BUCKET}/${path}`,
        storage_path: path,
        bucket_id: BUCKET,
        file_size: file.size,
      });

      if (error) {
        // Do not leave a file behind with no row pointing at it.
        await supabase.storage.from(BUCKET).remove([path]);
        throw new Error(error.message);
      }
    },
    onSuccess: () => client.invalidateQueries({ queryKey: documentsKey }),
  });
}

export function useDeleteDocument() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (document: ApplicationDocument) => {
      if (document.storage_path) {
        const { error } = await supabase.storage
          .from(BUCKET)
          .remove([document.storage_path]);
        if (error) throw new Error(error.message);
      }
      const { error } = await supabase
        .from("application_documents")
        .delete()
        .eq("id", document.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: documentsKey }),
  });
}

/**
 * A short-lived link to a private file. Signed rather than public, and short
 * because the only thing that needs it is the click that follows.
 */
export async function signedDocumentUrl(document: ApplicationDocument): Promise<string> {
  if (!document.storage_path) throw new Error("This document has no stored file.");
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(document.storage_path, SIGNED_URL_SECONDS);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}
