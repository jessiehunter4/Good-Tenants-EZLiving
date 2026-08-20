import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Download, FileText, X } from "lucide-react";
import { toast } from "sonner";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminList from "@/components/admin/AdminTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { errorMessage } from "@/hooks/admin/crud";
import { supabase } from "@/integrations/supabase/client";
import {
  parsePartnerDocuments,
  signedPartnerUrl,
} from "@/hooks/partner/useVerification";
import { verificationState } from "@/features/partner/verification";

type PartnerKind = "agent" | "landlord";

type PendingPartner = {
  id: string;
  email: string | null;
  display_name: string | null;
  kind: PartnerKind;
  submitted_at: string | null;
  is_verified: boolean | null;
  notes: string | null;
  documents: string[];
  detail: string;
};

const partnersQuery = (kind: PartnerKind) => ({
  queryKey: ["admin", "verification", kind],
  queryFn: async (): Promise<PendingPartner[]> => {
    const table = kind === "agent" ? "realtor_profiles" : "landlord_profiles";
    const { data, error } = await supabase
      .from(table)
      .select("*, profiles!inner(email, display_name)")
      .order("verification_submitted_at", { ascending: true, nullsFirst: false });
    if (error) throw new Error(error.message);

    type WithProfile = Record<string, unknown> & {
      profiles: { email: string | null; display_name: string | null } | null;
    };

    return ((data ?? []) as unknown as WithProfile[]).map((row) => ({
      id: row.id as string,
      email: row.profiles?.email ?? null,
      display_name: row.profiles?.display_name ?? null,
      kind,
      submitted_at: (row.verification_submitted_at as string | null) ?? null,
      is_verified: (row.is_verified as boolean | null) ?? null,
      notes: (row.verification_notes as string | null) ?? null,
      documents: (row.verification_documents as string[] | null) ?? [],
      detail:
        kind === "agent"
          ? [row.agency, row.license_number && `DRE ${row.license_number}`]
              .filter(Boolean)
              .join(" · ")
          : [
              row.property_count && `${row.property_count} properties`,
              row.management_type && `managed ${row.management_type}`,
            ]
              .filter(Boolean)
              .join(" · "),
    }));
  },
});

/**
 * Deciding whether a partner is who they say they are.
 *
 * The rentals site had the form; nothing on the other side of it. A partner
 * cannot set their own verdict — a database trigger refuses it — so this screen
 * is the only way a badge gets granted.
 */
const AdminVerification = () => {
  const [kind, setKind] = useState<PartnerKind>("agent");
  const { data = [], isLoading, error } = useQuery(partnersQuery(kind));

  // Someone who has asked and not been answered comes first; the rest follow.
  const waiting = data.filter((p) => verificationState(p) === "submitted");
  const rest = data.filter((p) => verificationState(p) !== "submitted");

  return (
    <AdminLayout
      title="Partner verification"
      description="Agents and landlords asking for access to the tenant directory."
    >
      <Tabs value={kind} onValueChange={(v) => setKind(v as PartnerKind)}>
        <TabsList>
          <TabsTrigger value="agent">Agents</TabsTrigger>
          <TabsTrigger value="landlord">Landlords</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-6">
        <AdminList
          isLoading={isLoading}
          isEmpty={data.length === 0}
          error={error}
          emptyMessage="Nobody has asked to be verified."
        >
          <div className="space-y-6">
            {waiting.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-espresso-muted">
                  Waiting on you ({waiting.length})
                </h2>
                <div className="space-y-3">
                  {waiting.map((partner) => (
                    <PartnerRow key={partner.id} partner={partner} />
                  ))}
                </div>
              </section>
            )}

            {rest.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-espresso-muted">
                  Everyone else
                </h2>
                <div className="space-y-3">
                  {rest.map((partner) => (
                    <PartnerRow key={partner.id} partner={partner} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </AdminList>
      </div>
    </AdminLayout>
  );
};

const PartnerRow = ({ partner }: { partner: PendingPartner }) => {
  const client = useQueryClient();
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const state = verificationState(partner);
  const documents = parsePartnerDocuments(partner.documents);
  const table = partner.kind === "agent" ? "realtor_profiles" : "landlord_profiles";

  const decide = async (values: Record<string, unknown>, message: string) => {
    setSaving(true);
    const { error } = await supabase.from(table).update(values).eq("id", partner.id);
    setSaving(false);
    if (error) {
      toast.error(errorMessage(error));
      return;
    }
    toast.success(message);
    client.invalidateQueries({ queryKey: ["admin", "verification"] });
  };

  const open = async (path: string) => {
    try {
      window.open(await signedPartnerUrl(path), "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(errorMessage(error, "Couldn't open that file"));
    }
  };

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-espresso">
            {partner.display_name || partner.email || "Unnamed partner"}
          </p>
          <p className="truncate text-xs text-espresso-muted">{partner.email}</p>
          {partner.detail && (
            <p className="mt-1 text-sm text-espresso-muted">{partner.detail}</p>
          )}
        </div>

        <Badge
          variant={
            state === "verified" ? "default" : state === "submitted" ? "secondary" : "outline"
          }
        >
          {state === "verified"
            ? "Verified"
            : state === "submitted"
              ? "Waiting"
              : state === "changes_requested"
                ? "Changes asked for"
                : "Not started"}
        </Badge>
      </div>

      {documents.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {documents.map((document) => (
            <li key={document.path}>
              <Button
                size="sm"
                variant="outline"
                className="border-clay text-espresso"
                onClick={() => open(document.path)}
              >
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                {document.kind}
                <Download className="ml-1.5 h-3 w-3" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {partner.notes && (
        <p className="mt-3 rounded-lg bg-sand p-3 text-xs text-espresso-muted">
          Last note: {partner.notes}
        </p>
      )}

      {state !== "verified" && (
        <div className="mt-4 space-y-2">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="If something is missing, say what — this is shown to them."
            aria-label={`Note for ${partner.email}`}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="bg-espresso text-sand hover:bg-espresso/90"
              disabled={saving}
              onClick={() =>
                decide(
                  { is_verified: true, status: "verified", verification_notes: null },
                  "Partner verified",
                )
              }
            >
              <Check className="mr-1.5 h-3.5 w-3.5" /> Verify
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-clay text-espresso"
              disabled={saving || note.trim().length === 0}
              onClick={() => decide({ verification_notes: note.trim() }, "Sent back to them")}
            >
              <X className="mr-1.5 h-3.5 w-3.5" /> Ask for changes
            </Button>
          </div>
          {note.trim().length === 0 && (
            <p className="text-xs text-espresso-muted">
              A refusal needs a reason — otherwise they resubmit the same thing.
            </p>
          )}
        </div>
      )}

      {state === "verified" && (
        <Button
          size="sm"
          variant="ghost"
          className="mt-3 text-destructive hover:text-destructive"
          disabled={saving}
          onClick={() =>
            decide({ is_verified: false, status: "basic" }, "Verification withdrawn")
          }
        >
          Withdraw verification
        </Button>
      )}
    </Card>
  );
};

export default AdminVerification;
