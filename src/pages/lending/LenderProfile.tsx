import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  PRODUCT_OPTIONS,
  SECURITY_TYPES,
  SECURITY_TYPE_LABELS,
  type ScenarioProduct,
  type SecurityType,
} from "@/features/lending/products";
import { toNumber } from "@/features/lending/scenarioSchema";

interface LenderProfileValues {
  company_name: string;
  contact_name: string;
  contact_phone: string;
  website: string;
  acn: string;
  credit_licence: string;
  regions: string;
  min_loan_amount: string;
  max_loan_amount: string;
  max_lvr: string;
  indicative_rate_from: string;
  typical_turnaround_days: string;
  notes: string;
}

const EMPTY: LenderProfileValues = {
  company_name: "",
  contact_name: "",
  contact_phone: "",
  website: "",
  acn: "",
  credit_licence: "",
  regions: "",
  min_loan_amount: "",
  max_loan_amount: "",
  max_lvr: "",
  indicative_rate_from: "",
  typical_turnaround_days: "",
  notes: "",
};

/**
 * A lender's appetite, structured.
 *
 * Products, security types and loan range are the fields that decide whether a
 * scenario is worth putting in front of this lender at all, so they are
 * selections rather than prose.
 */
const LenderProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<ScenarioProduct[]>([]);
  const [securities, setSecurities] = useState<SecurityType[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<LenderProfileValues>({ defaultValues: EMPTY });

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data, error } = await supabase
        .from("lender_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Could not load lender profile:", error);
      } else if (data) {
        form.reset({
          company_name: data.company_name ?? "",
          contact_name: data.contact_name ?? "",
          contact_phone: data.contact_phone ?? "",
          website: data.website ?? "",
          acn: data.acn ?? "",
          credit_licence: data.credit_licence ?? "",
          regions: (data.regions ?? []).join(", "),
          min_loan_amount: data.min_loan_amount?.toString() ?? "",
          max_loan_amount: data.max_loan_amount?.toString() ?? "",
          max_lvr: data.max_lvr?.toString() ?? "",
          indicative_rate_from: data.indicative_rate_from?.toString() ?? "",
          typical_turnaround_days: data.typical_turnaround_days?.toString() ?? "",
          notes: data.notes ?? "",
        });
        setProducts(data.products ?? []);
        setSecurities(data.security_types ?? []);
        setIsVerified(data.is_verified);
      }
      setIsLoading(false);
    };

    void load();
  }, [user, form]);

  const onSubmit = async (values: LenderProfileValues) => {
    if (!user) return;
    setIsSaving(true);

    const { error } = await supabase.from("lender_profiles").upsert({
      id: user.id,
      company_name: values.company_name || null,
      contact_name: values.contact_name || null,
      contact_phone: values.contact_phone || null,
      website: values.website || null,
      acn: values.acn || null,
      credit_licence: values.credit_licence || null,
      products: products.length ? products : null,
      security_types: securities.length ? securities : null,
      regions: values.regions
        ? values.regions.split(",").map((region) => region.trim()).filter(Boolean)
        : null,
      min_loan_amount: toNumber(values.min_loan_amount),
      max_loan_amount: toNumber(values.max_loan_amount),
      max_lvr: toNumber(values.max_lvr),
      indicative_rate_from: toNumber(values.indicative_rate_from),
      typical_turnaround_days: toNumber(values.typical_turnaround_days),
      notes: values.notes || null,
      status: "basic",
    });

    setIsSaving(false);

    if (error) {
      toast({
        title: "Could not save your profile",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Profile saved" });
  };

  if (isLoading) {
    return <p className="p-8 text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Lender profile</h1>
          <p className="text-sm text-muted-foreground">
            What you lend against, so scenarios that fit reach you and ones that do not, don't.
          </p>
        </div>
        <Badge variant={isVerified ? "default" : "secondary"}>
          {isVerified ? "On the panel" : "Awaiting verification"}
        </Badge>
      </div>

      {!isVerified && (
        <p className="mb-6 rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
          Panel membership is granted by an administrator, not claimed here. Your profile stays
          private until it is.
        </p>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Who you are</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company name</Label>
              <Input id="company_name" {...form.register("company_name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_name">Contact name</Label>
              <Input id="contact_name" {...form.register("contact_name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Phone</Label>
              <Input id="contact_phone" {...form.register("contact_phone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" placeholder="https://" {...form.register("website")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acn">ACN</Label>
              <Input id="acn" {...form.register("acn")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credit_licence">Credit licence</Label>
              <Input id="credit_licence" {...form.register("credit_licence")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">What you lend on</CardTitle>
            <CardDescription>Scenarios are matched against these.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Products</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {PRODUCT_OPTIONS.map((product) => (
                  <label key={product.value} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={products.includes(product.value)}
                      onCheckedChange={(checked) =>
                        setProducts((current) =>
                          checked
                            ? [...current, product.value]
                            : current.filter((value) => value !== product.value),
                        )
                      }
                    />
                    {product.title}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Security types</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {SECURITY_TYPES.map((security) => (
                  <label key={security} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={securities.includes(security)}
                      onCheckedChange={(checked) =>
                        setSecurities((current) =>
                          checked
                            ? [...current, security]
                            : current.filter((value) => value !== security),
                        )
                      }
                    />
                    {SECURITY_TYPE_LABELS[security]}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="min_loan_amount">Minimum loan</Label>
                <Input id="min_loan_amount" inputMode="numeric" placeholder="$" {...form.register("min_loan_amount")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_loan_amount">Maximum loan</Label>
                <Input id="max_loan_amount" inputMode="numeric" placeholder="$" {...form.register("max_loan_amount")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_lvr">Maximum LVR (%)</Label>
                <Input id="max_lvr" inputMode="numeric" {...form.register("max_lvr")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="indicative_rate_from">Indicative rate from (%)</Label>
                <Input id="indicative_rate_from" inputMode="numeric" {...form.register("indicative_rate_from")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="typical_turnaround_days">Typical turnaround (days)</Label>
                <Input id="typical_turnaround_days" inputMode="numeric" {...form.register("typical_turnaround_days")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regions">Regions</Label>
                <Input id="regions" placeholder="NSW, VIC, QLD" {...form.register("regions")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes for brokers</Label>
              <Textarea id="notes" rows={4} {...form.register("notes")} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </div>
  );
};

export default LenderProfile;
