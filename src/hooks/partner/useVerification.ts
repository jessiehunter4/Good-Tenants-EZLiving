// Partner verification: reading a profile, submitting it, attaching documents.
//
// A partner writes their own details and their own documents. They cannot set
// `is_verified` or `status` — a database trigger refuses that regardless of
// which client asks, so the badge on a listing means a person checked.
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Row } from "@/hooks/admin/crud";
import { rejectReason } from "@/features/tenant/documents";
import type { PartnerKind } from "@/features/partner/verification";

export type RealtorProfile = Row<"realtor_profiles">;
export type LandlordProfile = Row<"landlord_profiles">;
export type PartnerProfile = RealtorProfile | LandlordProfile;

const BUCKET = "partner-documents";
const SIGNED_URL_SECONDS = 60;
const key = ["partner", "verification"] as const;

const tableFor = (kind: PartnerKind) =>
  kind === "agent" ? ("realtor_profiles" as const) : ("landlord_profiles" as const);

export function myPartnerProfileQuery(kind: PartnerKind) {
  return queryOptions({
    queryKey: [...key, kind],
    queryFn: async (): Promise<PartnerProfile | null> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data, error } = await supabase
        .from(tableFor(kind))
        .select("*")
        .eq("id", auth.user.id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function useSubmitVerification(kind: PartnerKind) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("You need to be signed in.");

      const { error } = await supabase
        .from(tableFor(kind))
        .update({
          ...values,
          verification_submitted_at: new Date().toISOString(),
          // Clearing the note is what makes a resubmission mean something:
          // the partner has acted on what they were told.
          verification_notes: null,
        })
        .eq("id", auth.user.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
}

export type PartnerDocument = { path: string; name: string; kind: string };

/** Documents are recorded on the profile as an array of storage paths. */
export function parsePartnerDocuments(paths: string[] | null): PartnerDocument[] {
  return (paths ?? []).map((path) => {
    const file = path.split("/").pop() ?? path;
    const [kind] = file.split("-");
    return { path, name: file, kind };
  });
}

export function useUploadPartnerDocument(kind: PartnerKind) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, documentKind }: { file: File; documentKind: string }) => {
      const problem = rejectReason(file);
      if (problem) throw new Error(problem);

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("You need to be signed in.");

      const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const path = `${auth.user.id}/${documentKind}-${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw new Error(uploadError.message);

      const { data: current, error: readError } = await supabase
        .from(tableFor(kind))
        .select("verification_documents")
        .eq("id", auth.user.id)
        .maybeSingle();
      if (readError) throw new Error(readError.message);

      const next = [...(current?.verification_documents ?? []), path];
      const { error } = await supabase
        .from(tableFor(kind))
        .update({ verification_documents: next })
        .eq("id", auth.user.id);

      if (error) {
        await supabase.storage.from(BUCKET).remove([path]);
        throw new Error(error.message);
      }
    },
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
}

export function useRemovePartnerDocument(kind: PartnerKind) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async ({ path, current }: { path: string; current: string[] }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("You need to be signed in.");

      const { error: removeError } = await supabase.storage.from(BUCKET).remove([path]);
      if (removeError) throw new Error(removeError.message);

      const { error } = await supabase
        .from(tableFor(kind))
        .update({ verification_documents: current.filter((p) => p !== path) })
        .eq("id", auth.user.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
}

export async function signedPartnerUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_SECONDS);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}
