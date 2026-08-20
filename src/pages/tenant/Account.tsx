import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Check, FileText, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";

import SiteLayout from "@/components/site/SiteLayout";
import PageHeading from "@/components/daily/PageHeading";
import EditorField from "@/components/admin/editor/EditorField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { errorMessage } from "@/hooks/admin/crud";
import { supabase } from "@/integrations/supabase/client";
import { myRenterProfileQuery, toQualifiable } from "@/hooks/tenant/useRenterProfile";
import { myDocumentsQuery } from "@/hooks/tenant/useDocuments";
import { requestsAboutMeQuery } from "@/hooks/tenant/useDirectory";
import { packageProgress } from "@/features/tenant/documents";
import { missingForQualification } from "@/features/tenant/qualification";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/**
 * The renter's account.
 *
 * Carried across from `comingsoonhomrentals-com/src/pages/Profile.tsx`, which
 * held contact details and rental preferences in one place. Since the merge,
 * the preferences live on the one profile and are edited at /prequalify, so
 * what this page adds is the part that had nowhere else to go — name, phone,
 * email — and one honest view of how complete everything is, with a link to
 * each piece rather than a second copy of it.
 */
const Account = () => {
  const { user } = useAuth();
  const client = useQueryClient();
  const { data: profile, isLoading } = useQuery(myRenterProfileQuery);
  const { data: documents = [] } = useQuery(myDocumentsQuery);
  const { data: requests = [] } = useQuery(requestsAboutMeQuery);

  const [contact, setContact] = useState({ display_name: "", phone: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, phone")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        setContact({ display_name: data.display_name ?? "", phone: data.phone ?? "" });
      }
    };
    void load();
  }, [user]);

  useDocumentMeta({ title: "Your account — Good Tenants EZ Living", noindex: true });

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update(contact).eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(errorMessage(error));
      return;
    }
    toast.success("Saved");
    client.invalidateQueries({ queryKey: ["tenant", "profile"] });
  };

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="page-shell py-16">
          <div className="h-64 animate-pulse rounded-2xl bg-clay/30" />
        </div>
      </SiteLayout>
    );
  }

  const missing = profile ? missingForQualification(toQualifiable(profile)) : [];
  const docs = packageProgress(documents);
  const pendingRequests = requests.filter((r) => r.consent_granted === null).length;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
        <PageHeading
          eyebrow="Your account"
          title={contact.display_name || "Your account"}
          intro="Everything about you in one place, and where to change each part of it."
        />

        <Card className="mb-6 p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-espresso">
            <UserRound className="h-4 w-4" /> Contact details
          </h2>
          <p className="mt-1 text-sm text-espresso-muted">
            How we reach you. Not shown in the directory — that uses the display name you set
            under sharing.
          </p>

          <div className="mt-4 space-y-4">
            <EditorField label="Name" htmlFor="acct-name">
              <Input
                id="acct-name"
                value={contact.display_name}
                onChange={(e) => setContact({ ...contact, display_name: e.target.value })}
              />
            </EditorField>
            <EditorField label="Phone" htmlFor="acct-phone">
              <Input
                id="acct-phone"
                type="tel"
                value={contact.phone}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              />
            </EditorField>
            <EditorField label="Email" htmlFor="acct-email" hint="Contact us to change this.">
              <Input id="acct-email" value={user?.email ?? ""} disabled />
            </EditorField>

            <Button
              onClick={save}
              disabled={saving}
              className="bg-espresso text-sand hover:bg-espresso/90"
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </Card>

        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-espresso-muted">
          Where everything stands
        </h2>

        <div className="space-y-3">
          <StatusRow
            to="/prequalify"
            icon={ShieldCheck}
            title="Your rental profile"
            done={missing.length === 0}
            detail={
              missing.length === 0
                ? "Complete — every listing can tell you where you stand"
                : `Still needed: ${missing.join(", ")}`
            }
          />

          <StatusRow
            to="/documents"
            icon={FileText}
            title="Your documents"
            done={docs.complete}
            detail={
              docs.complete
                ? "Complete"
                : `${docs.percent}% — still needed: ${docs.missing
                    .map((m) => m.label.toLowerCase())
                    .join(", ")}`
            }
            progress={docs.percent}
          />

          <StatusRow
            to="/sharing"
            icon={UserRound}
            title="What landlords can see"
            done={Boolean(profile?.is_published && profile?.admin_approved_at)}
            detail={
              profile?.is_published && profile?.admin_approved_at
                ? "You are listed in the directory"
                : profile?.is_published
                  ? "Published, waiting on our review"
                  : "Not listed — you decide what shows"
            }
            badge={pendingRequests > 0 ? `${pendingRequests} waiting on you` : undefined}
          />
        </div>
      </div>
    </SiteLayout>
  );
};

const StatusRow = ({
  to,
  icon: Icon,
  title,
  detail,
  done,
  progress,
  badge,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
  done: boolean;
  progress?: number;
  badge?: string;
}) => (
  <Link to={to}>
    <Card className="p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-clay-soft">
            {done ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Icon className="h-4 w-4 text-espresso" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-espresso">{title}</p>
            <p className="mt-0.5 text-sm text-espresso-muted">{detail}</p>
            {progress != null && !done && <Progress value={progress} className="mt-2 h-1.5" />}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {badge && <Badge>{badge}</Badge>}
          <ArrowRight className="h-4 w-4 text-espresso-muted" />
        </div>
      </div>
    </Card>
  </Link>
);

export default Account;
