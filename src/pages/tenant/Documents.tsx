import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Clock, Download, FileText, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import SiteLayout from "@/components/site/SiteLayout";
import PageHeading from "@/components/daily/PageHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Progress } from "@/components/ui/progress";
import { errorMessage } from "@/hooks/admin/crud";
import {
  myDocumentsQuery,
  signedDocumentUrl,
  useDeleteDocument,
  useUploadDocument,
  type ApplicationDocument,
} from "@/hooks/tenant/useDocuments";
import {
  DOCUMENT_KINDS,
  DOCUMENT_LABELS,
  formatBytes,
  packageProgress,
  type DocumentKind,
} from "@/features/tenant/documents";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/**
 * The documents behind the application package.
 *
 * This is what makes the package real: the bands a landlord sees are
 * self-reported until there is a pay stub behind them. Uploading here is what a
 * renter does once, and reuses on every application — which is the promise the
 * whole product is built on.
 */
const Documents = () => {
  const { data: documents = [], isLoading } = useQuery(myDocumentsQuery);
  const upload = useUploadDocument();
  const remove = useDeleteDocument();
  const [pendingDelete, setPendingDelete] = useState<ApplicationDocument | null>(null);

  useDocumentMeta({ title: "Your documents — Good Tenants EZ Living", noindex: true });

  const progress = packageProgress(documents);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <PageHeading
          eyebrow="Your package"
          title="Documents"
          intro="Upload these once. Every application you make afterwards uses the same package."
        />

        <Card className="mb-8 p-6">
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-semibold text-espresso">
              {progress.complete ? "Your package is complete" : "Package progress"}
            </p>
            <p className="text-2xl font-extrabold text-espresso">{progress.percent}%</p>
          </div>
          <Progress value={progress.percent} className="mt-3" />
          {!progress.complete && (
            <p className="mt-3 text-sm text-espresso-muted">
              Still needed: {progress.missing.map((m) => m.label.toLowerCase()).join(", ")}.
            </p>
          )}
          <p className="mt-3 text-xs text-espresso-muted">
            Documents are visible to you and to our team only. A landlord you approve sees your
            income and credit <em>bands</em> — never the files themselves.
          </p>
        </Card>

        <div className="space-y-4">
          {DOCUMENT_KINDS.map((spec) => (
            <KindRow
              key={spec.kind}
              kind={spec.kind}
              label={spec.label}
              hint={spec.hint}
              documents={documents.filter((d) => d.document_type === spec.kind)}
              isLoading={isLoading}
              uploading={upload.isPending}
              onUpload={(file) =>
                upload.mutate(
                  { file, kind: spec.kind },
                  {
                    onSuccess: () => toast.success(`${spec.label} uploaded`),
                    onError: (e) => toast.error(errorMessage(e)),
                  },
                )
              }
              onDelete={setPendingDelete}
            />
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(v) => !v && setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          remove.mutate(pendingDelete, {
            onSuccess: () => {
              toast.success("Document removed");
              setPendingDelete(null);
            },
            onError: (e) => toast.error(errorMessage(e)),
          });
        }}
        title="Remove this document?"
        description={
          pendingDelete
            ? `${pendingDelete.file_name} is deleted permanently, and your package goes back to needing ${
                DOCUMENT_LABELS[pendingDelete.document_type]?.toLowerCase() ?? "it"
              }.`
            : ""
        }
        confirmText="Remove"
        variant="destructive"
        isLoading={remove.isPending}
      />
    </SiteLayout>
  );
};

const KindRow = ({
  kind,
  label,
  hint,
  documents,
  isLoading,
  uploading,
  onUpload,
  onDelete,
}: {
  kind: DocumentKind;
  label: string;
  hint: string;
  documents: ApplicationDocument[];
  isLoading: boolean;
  uploading: boolean;
  onUpload: (file: File) => void;
  onDelete: (document: ApplicationDocument) => void;
}) => {
  const input = useRef<HTMLInputElement>(null);

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-bold text-espresso">{label}</h2>
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
              if (file) onUpload(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-clay text-espresso"
            disabled={uploading}
            onClick={() => input.current?.click()}
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            {documents.length > 0 ? "Add another" : "Upload"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-4 h-10 animate-pulse rounded-lg bg-clay/30" />
      ) : documents.length > 0 ? (
        <ul className="mt-4 divide-y divide-clay/50 border-t border-clay/50">
          {documents.map((document) => (
            <DocumentRow key={document.id} document={document} onDelete={onDelete} />
          ))}
        </ul>
      ) : null}
    </Card>
  );
};

const DocumentRow = ({
  document,
  onDelete,
}: {
  document: ApplicationDocument;
  onDelete: (document: ApplicationDocument) => void;
}) => {
  const [opening, setOpening] = useState(false);

  const open = async () => {
    setOpening(true);
    try {
      const url = await signedDocumentUrl(document);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(errorMessage(error, "Couldn't open that file"));
    } finally {
      setOpening(false);
    }
  };

  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <FileText className="h-4 w-4 shrink-0 text-espresso-muted" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-espresso">{document.file_name}</p>
          <p className="text-xs text-espresso-muted">
            {formatBytes(document.file_size)}
            {document.file_size ? " · " : ""}
            {new Date(document.upload_date).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <StatusBadge status={document.verification_status} />
        <Button
          size="sm"
          variant="ghost"
          onClick={open}
          disabled={opening}
          aria-label={`Open ${document.file_name}`}
        >
          <Download className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(document)}
          aria-label={`Remove ${document.file_name}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </li>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "verified") {
    return (
      <Badge className="gap-1 bg-success text-success-foreground">
        <Check className="h-3 w-3" /> Verified
      </Badge>
    );
  }
  if (status === "rejected") {
    return (
      <Badge variant="destructive" className="gap-1">
        <X className="h-3 w-3" /> Replace
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1">
      <Clock className="h-3 w-3" /> Checking
    </Badge>
  );
};

export default Documents;
