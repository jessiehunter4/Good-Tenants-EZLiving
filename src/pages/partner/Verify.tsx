import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Check, Clock, Download, FileText, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import SiteLayout from "@/components/site/SiteLayout";
import PageHeading from "@/components/daily/PageHeading";
import EditorField from "@/components/admin/editor/EditorField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { errorMessage } from "@/hooks/admin/crud";
import { useUserRole } from "@/hooks/partner/useUserRole";
import {
  myPartnerProfileQuery,
  parsePartnerDocuments,
  signedPartnerUrl,
  useRemovePartnerDocument,
  useSubmitVerification,
  useUploadPartnerDocument,
} from "@/hooks/partner/useVerification";
import {
  landlordVerificationSchema,
  MANAGEMENT_LABELS,
  PARTNER_DOCUMENT_KINDS,
  realtorVerificationSchema,
  VERIFICATION_COPY,
  verificationState,
  type LandlordVerificationForm,
  type PartnerKind,
  type RealtorVerificationForm,
} from "@/features/partner/verification";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/**
 * Get verified.
 *
 * Carried across from the rentals site's verification page, which collected all
 * of this and stored none of it. What a partner submits now lands on their
 * profile, and a member of staff decides — the partner cannot decide for
 * themselves, which a database trigger enforces rather than this form.
 */
const Verify = () => {
  const { user } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const kind: PartnerKind = role === "landlord" ? "landlord" : "agent";

  const { data: profile, isLoading } = useQuery({
    ...myPartnerProfileQuery(kind),
    enabled: Boolean(user) && !roleLoading,
  });

  useDocumentMeta({ title: "Get verified — Good Tenants EZ Living", noindex: true });

  if (roleLoading || isLoading) {
    return (
      <SiteLayout>
        <div className="page-shell py-16">
          <div className="h-64 animate-pulse rounded-2xl bg-clay/30" />
        </div>
      </SiteLayout>
    );
  }

  const state = verificationState(profile ?? {});
  const copy = VERIFICATION_COPY[state];
  const documents = parsePartnerDocuments(profile?.verification_documents ?? null);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
        <PageHeading
          eyebrow={kind === "agent" ? "For agents" : "For landlords"}
          title={copy.heading}
          intro={copy.body}
        />

        {state === "verified" && (
          <Card className="mb-6 border-success/40 bg-success/5 p-4">
            <p className="flex items-center gap-2 font-semibold text-success">
              <Check className="h-4 w-4" /> Verified
            </p>
          </Card>
        )}

        {state === "submitted" && (
          <Card className="mb-6 border-warning/40 bg-warning/5 p-4">
            <p className="flex items-center gap-2 font-semibold text-warning">
              <Clock className="h-4 w-4" /> With our team
            </p>
          </Card>
        )}

        {state === "changes_requested" && profile?.verification_notes && (
          <Card className="mb-6 border-destructive/40 bg-destructive/5 p-4">
            <p className="flex items-center gap-2 font-semibold text-destructive">
              <AlertTriangle className="h-4 w-4" /> We need something else
            </p>
            <p className="mt-2 text-sm text-espresso">{profile.verification_notes}</p>
          </Card>
        )}

        {kind === "agent" ? (
          <RealtorForm profile={profile ?? null} />
        ) : (
          <LandlordForm profile={profile ?? null} />
        )}

        <section className="mt-8">
          <h2 className="text-xl font-bold tracking-tight text-espresso">Documents</h2>
          <p className="mt-1 text-sm text-espresso-muted">
            Visible to our team only. Never shown to renters or other partners.
          </p>

          <div className="mt-4 space-y-4">
            {PARTNER_DOCUMENT_KINDS[kind].map((spec) => (
              <DocumentSlot
                key={spec.kind}
                kind={kind}
                documentKind={spec.kind}
                label={spec.label}
                hint={spec.hint}
                documents={documents.filter((d) => d.kind === spec.kind)}
                allPaths={profile?.verification_documents ?? []}
              />
            ))}
          </div>
        </section>
      </div>
    </SiteLayout>
  );
};

const RealtorForm = ({ profile }: { profile: Record<string, unknown> | null }) => {
  const submit = useSubmitVerification("agent");
  const form = useForm<RealtorVerificationForm>({
    resolver: zodResolver(realtorVerificationSchema),
    defaultValues: {
      agency: "",
      license_number: "",
      brokerage_address: "",
      years_experience: 0,
      bio: "",
    },
  });

  useEffect(() => {
    if (!profile) return;
    form.reset({
      agency: (profile.agency as string) ?? "",
      license_number: (profile.license_number as string) ?? "",
      brokerage_address: (profile.brokerage_address as string) ?? "",
      years_experience: (profile.years_experience as number) ?? 0,
      bio: (profile.bio as string) ?? "",
    });
  }, [profile, form]);

  const onSubmit = form.handleSubmit((values) =>
    submit.mutate(values, {
      onSuccess: () => toast.success("Sent to our team"),
      onError: (e) => toast.error(errorMessage(e)),
    }),
  );

  return (
    <Card className="space-y-4 p-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <EditorField label="Brokerage" htmlFor="v-agency" error={form.formState.errors.agency?.message}>
          <Input id="v-agency" {...form.register("agency")} />
        </EditorField>

        <div className="grid gap-3 sm:grid-cols-2">
          <EditorField
            label="DRE licence number"
            htmlFor="v-license"
            error={form.formState.errors.license_number?.message}
          >
            <Input id="v-license" {...form.register("license_number")} />
          </EditorField>
          <EditorField label="Years in the business" htmlFor="v-years">
            <Input id="v-years" type="number" {...form.register("years_experience")} />
          </EditorField>
        </div>

        <EditorField label="Brokerage address" htmlFor="v-address">
          <Input id="v-address" {...form.register("brokerage_address")} />
        </EditorField>

        <EditorField label="Anything else we should know" htmlFor="v-bio">
          <Textarea id="v-bio" rows={3} {...form.register("bio")} />
        </EditorField>

        <Button
          type="submit"
          disabled={submit.isPending}
          className="w-full bg-espresso text-sand hover:bg-espresso/90"
        >
          {submit.isPending ? "Sending…" : "Send for review"}
        </Button>
      </form>
    </Card>
  );
};

const LandlordForm = ({ profile }: { profile: Record<string, unknown> | null }) => {
  const submit = useSubmitVerification("landlord");
  const form = useForm<LandlordVerificationForm>({
    resolver: zodResolver(landlordVerificationSchema),
    defaultValues: {
      property_count: 1,
      property_addresses: "",
      management_type: "self",
      years_experience: 0,
      bio: "",
    },
  });

  useEffect(() => {
    if (!profile) return;
    form.reset({
      property_count: (profile.property_count as number) ?? 1,
      property_addresses: (profile.property_addresses as string) ?? "",
      management_type: ((profile.management_type as LandlordVerificationForm["management_type"]) ??
        "self"),
      years_experience: (profile.years_experience as number) ?? 0,
      bio: (profile.bio as string) ?? "",
    });
  }, [profile, form]);

  const onSubmit = form.handleSubmit((values) =>
    submit.mutate(values, {
      onSuccess: () => toast.success("Sent to our team"),
      onError: (e) => toast.error(errorMessage(e)),
    }),
  );

  return (
    <Card className="p-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <EditorField
            label="How many rentals"
            htmlFor="v-count"
            error={form.formState.errors.property_count?.message}
          >
            <Input id="v-count" type="number" {...form.register("property_count")} />
          </EditorField>
          <EditorField label="Years renting them out" htmlFor="v-lyears">
            <Input id="v-lyears" type="number" {...form.register("years_experience")} />
          </EditorField>
        </div>

        <EditorField
          label="Addresses"
          htmlFor="v-addresses"
          hint="One per line. We check ownership against these."
          error={form.formState.errors.property_addresses?.message}
        >
          <Textarea id="v-addresses" rows={3} {...form.register("property_addresses")} />
        </EditorField>

        <div>
          <Label htmlFor="v-management">Who manages them</Label>
          <Select
            value={form.watch("management_type")}
            onValueChange={(v) =>
              form.setValue("management_type", v as LandlordVerificationForm["management_type"])
            }
          >
            <SelectTrigger id="v-management" className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MANAGEMENT_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <EditorField label="Anything else we should know" htmlFor="v-lbio">
          <Textarea id="v-lbio" rows={3} {...form.register("bio")} />
        </EditorField>

        <Button
          type="submit"
          disabled={submit.isPending}
          className="w-full bg-espresso text-sand hover:bg-espresso/90"
        >
          {submit.isPending ? "Sending…" : "Send for review"}
        </Button>
      </form>
    </Card>
  );
};

const DocumentSlot = ({
  kind,
  documentKind,
  label,
  hint,
  documents,
  allPaths,
}: {
  kind: PartnerKind;
  documentKind: string;
  label: string;
  hint: string;
  documents: { path: string; name: string }[];
  allPaths: string[];
}) => {
  const input = useRef<HTMLInputElement>(null);
  const upload = useUploadPartnerDocument(kind);
  const remove = useRemovePartnerDocument(kind);

  const open = async (path: string) => {
    try {
      const url = await signedPartnerUrl(path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(errorMessage(error, "Couldn't open that file"));
    }
  };

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-espresso">{label}</h3>
          <p className="mt-0.5 text-sm text-espresso-muted">{hint}</p>
        </div>
        <div>
          <input
            ref={input}
            type="file"
            hidden
            accept="application/pdf,image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              upload.mutate(
                { file, documentKind },
                {
                  onSuccess: () => toast.success(`${label} uploaded`),
                  onError: (err) => toast.error(errorMessage(err)),
                },
              );
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-clay text-espresso"
            disabled={upload.isPending}
            onClick={() => input.current?.click()}
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            {documents.length > 0 ? "Replace" : "Upload"}
          </Button>
        </div>
      </div>

      {documents.length > 0 && (
        <ul className="mt-4 divide-y divide-clay/50 border-t border-clay/50">
          {documents.map((document) => (
            <li key={document.path} className="flex items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-espresso-muted" />
                <p className="truncate text-sm text-espresso">{document.name}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Badge variant="secondary">Uploaded</Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => open(document.path)}
                  aria-label={`Open ${document.name}`}
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  aria-label={`Remove ${document.name}`}
                  onClick={() =>
                    remove.mutate(
                      { path: document.path, current: allPaths },
                      {
                        onSuccess: () => toast.success("Removed"),
                        onError: (err) => toast.error(errorMessage(err)),
                      },
                    )
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default Verify;
