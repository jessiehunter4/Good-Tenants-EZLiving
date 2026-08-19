import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Eye, X } from "lucide-react";
import { toast } from "sonner";

import SiteLayout from "@/components/site/SiteLayout";
import PageHeading from "@/components/daily/PageHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { errorMessage } from "@/hooks/admin/crud";
import { supabase } from "@/integrations/supabase/client";
import { myRenterProfileQuery } from "@/hooks/tenant/useRenterProfile";
import { requestsAboutMeQuery, useDecideRequest } from "@/hooks/tenant/useDirectory";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

type SharingForm = {
  display_name: string;
  is_published: boolean;
  share_rent_range: boolean;
  share_credit_band: boolean;
  share_income_band: boolean;
};

/**
 * What a renter shows, and who they have said yes to.
 *
 * The control surface for the consent model carried from Good Tenants Hub. Each
 * switch is a separate decision — showing a rent range does not mean showing a
 * credit band — and the database honours them: the directory view selects null
 * for anything not shared, so an unshared figure is never sent, not merely
 * never painted.
 */
const Sharing = () => {
  const client = useQueryClient();
  const { data: profile, isLoading } = useQuery(myRenterProfileQuery);
  const { data: requests = [] } = useQuery(requestsAboutMeQuery);
  const decide = useDecideRequest();
  const [form, setForm] = useState<SharingForm | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      display_name: profile.display_name ?? "",
      is_published: profile.is_published,
      share_rent_range: profile.share_rent_range,
      share_credit_band: profile.share_credit_band,
      share_income_band: profile.share_income_band,
    });
  }, [profile]);

  useDocumentMeta({ title: "What landlords can see — Good Tenants EZ Living", noindex: true });

  const save = async () => {
    if (!form || !profile) return;
    setSaving(true);
    const { error } = await supabase.from("tenant_profiles").update(form).eq("id", profile.id);
    setSaving(false);
    if (error) {
      toast.error(errorMessage(error));
      return;
    }
    toast.success("Saved");
    client.invalidateQueries({ queryKey: ["tenant", "profile"] });
  };

  if (isLoading || !form || !profile) {
    return (
      <SiteLayout>
        <div className="page-shell py-16">
          <div className="h-64 animate-pulse rounded-2xl bg-clay/30" />
        </div>
      </SiteLayout>
    );
  }

  const pending = requests.filter((r) => r.consent_granted === null);
  const decided = requests.filter((r) => r.consent_granted !== null);
  const set = <K extends keyof SharingForm>(key: K, value: SharingForm[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
        <PageHeading
          eyebrow="Your privacy"
          title="What landlords can see"
          intro="Nothing here is shared until you switch it on, and each one is a separate decision."
        />

        <Card className="space-y-5 p-6">
          <div>
            <Label htmlFor="share-name">The name they see</Label>
            <Input
              id="share-name"
              value={form.display_name}
              onChange={(e) => set("display_name", e.target.value)}
              placeholder="Alex R."
              className="mt-1.5"
            />
            <p className="mt-1 text-xs text-espresso-muted">
              Most renters use a first name and an initial. Your full name is never in the
              directory.
            </p>
          </div>

          <ToggleRow
            id="pub"
            label="List me in the tenant directory"
            hint="Landlords and agents can find you. Staff review a profile before it appears."
            checked={form.is_published}
            onChange={(v) => set("is_published", v)}
          />

          <div className="border-t border-clay/50 pt-5">
            <p className="text-sm font-semibold text-espresso">Show alongside my profile</p>
            <div className="mt-3 space-y-4">
              <ToggleRow
                id="rent"
                label="My budget"
                hint="The most you would pay in rent."
                checked={form.share_rent_range}
                onChange={(v) => set("share_rent_range", v)}
              />
              <ToggleRow
                id="income"
                label="My income, as a range"
                hint="A band such as $6k–9k a month. Never the exact figure."
                checked={form.share_income_band}
                onChange={(v) => set("share_income_band", v)}
              />
              <ToggleRow
                id="credit"
                label="My credit range"
                hint="The band you selected, not a score."
                checked={form.share_credit_band}
                onChange={(v) => set("share_credit_band", v)}
              />
            </div>
          </div>

          <Button
            onClick={save}
            disabled={saving}
            className="w-full bg-espresso text-sand hover:bg-espresso/90"
          >
            {saving ? "Saving…" : "Save"}
          </Button>

          {form.is_published && !profile.admin_approved_at && (
            <p className="rounded-lg bg-sand p-3 text-xs text-espresso-muted">
              You have chosen to be listed. Your profile appears once staff have reviewed it.
            </p>
          )}
        </Card>

        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-tight text-espresso">
            Who has asked to see more
          </h2>
          <p className="mt-1 text-sm text-espresso-muted">
            Your application package — income, credit, evictions, background — goes to nobody
            unless you say yes here.
          </p>

          {pending.length === 0 && decided.length === 0 ? (
            <Card className="mt-4 border-dashed p-8 text-center text-sm text-espresso-muted">
              Nobody has asked yet.
            </Card>
          ) : (
            <div className="mt-4 space-y-3">
              {pending.map((r) => (
                <Card key={r.id} className="p-4">
                  <p className="text-sm text-espresso">{r.purpose || "No reason given"}</p>
                  <p className="mt-1 text-xs text-espresso-muted">
                    Asked {new Date(r.created_at).toLocaleDateString()}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      className="bg-espresso text-sand hover:bg-espresso/90"
                      disabled={decide.isPending}
                      onClick={() =>
                        decide.mutate(
                          { id: r.id, granted: true },
                          {
                            onSuccess: () => toast.success("Access granted"),
                            onError: (e) => toast.error(errorMessage(e)),
                          },
                        )
                      }
                    >
                      <Check className="mr-1.5 h-3.5 w-3.5" /> Allow
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-clay text-espresso"
                      disabled={decide.isPending}
                      onClick={() =>
                        decide.mutate(
                          { id: r.id, granted: false },
                          {
                            onSuccess: () => toast.success("Request declined"),
                            onError: (e) => toast.error(errorMessage(e)),
                          },
                        )
                      }
                    >
                      <X className="mr-1.5 h-3.5 w-3.5" /> Decline
                    </Button>
                  </div>
                </Card>
              ))}

              {decided.map((r) => (
                <Card key={r.id} className="flex items-center justify-between gap-3 p-4">
                  <p className="min-w-0 truncate text-sm text-espresso-muted">
                    {r.purpose || "No reason given"}
                  </p>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={r.consent_granted ? "default" : "secondary"}>
                      {r.consent_granted ? "Allowed" : "Declined"}
                    </Badge>
                    {r.consent_granted && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() =>
                          decide.mutate(
                            { id: r.id, granted: false },
                            {
                              onSuccess: () => toast.success("Access withdrawn"),
                              onError: (e) => toast.error(errorMessage(e)),
                            },
                          )
                        }
                      >
                        Withdraw
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <p className="mt-8 text-sm text-espresso-muted">
          <Eye className="mr-1.5 inline h-4 w-4" />
          Want to see what this looks like?{" "}
          <Link to={`/tenants/${profile.id}`} className="font-semibold text-espresso underline">
            View your directory profile
          </Link>
          .
        </p>
      </div>
    </SiteLayout>
  );
};

const ToggleRow = ({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) => (
  <div className="flex items-start justify-between gap-4">
    <div className="min-w-0">
      <Label htmlFor={id} className="font-semibold">
        {label}
      </Label>
      <p className="mt-0.5 text-xs text-espresso-muted">{hint}</p>
    </div>
    <Switch id={id} checked={checked} onCheckedChange={onChange} className="mt-1 shrink-0" />
  </div>
);

export default Sharing;
