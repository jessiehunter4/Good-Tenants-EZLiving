import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Settings2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import EditorField from "@/components/admin/editor/EditorField";
import { adminListQuery, errorMessage, useAdminPatch, type Row } from "@/hooks/admin/crud";

type Config = Row<"cshr_selection_config">;

const configQuery = adminListQuery("cshr_selection_config");

type FormState = {
  auto_publish: boolean;
  score_threshold: number;
  daily_cap: number;
  require_hero_image: boolean;
  price_min: string;
  price_max: string;
};

const toForm = (config: Config): FormState => ({
  auto_publish: config.auto_publish,
  score_threshold: config.score_threshold,
  daily_cap: config.daily_cap,
  require_hero_image: config.require_hero_image,
  price_min: config.price_min?.toString() ?? "",
  price_max: config.price_max?.toString() ?? "",
});

const toNumberOrNull = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Carried across from the settings tab of the daily's properties screen.
 *
 * One row, id 'default'. The daily shipped this table with a policy any signed
 * in account could write through — this app's copy is admin-only, which is why
 * the form can be trusted to be the only way in.
 */
export const DropSettings = () => {
  const { data = [], isLoading, error } = useQuery(configQuery);
  const patch = useAdminPatch("cshr_selection_config");
  const config = data[0];
  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    if (config) setForm(toForm(config));
  }, [config]);

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl bg-clay/30" />;
  if (error) {
    return (
      <Card className="border-destructive/40 bg-destructive/5 p-6">
        <p className="font-semibold text-destructive">Couldn't load the selection settings.</p>
      </Card>
    );
  }
  if (!config || !form) {
    return (
      <Card className="border-dashed p-10 text-center">
        <p className="font-semibold text-espresso">No selection config row.</p>
      </Card>
    );
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const save = () => {
    patch.mutate(
      {
        id: config.id,
        values: {
          auto_publish: form.auto_publish,
          score_threshold: form.score_threshold,
          daily_cap: form.daily_cap,
          require_hero_image: form.require_hero_image,
          price_min: toNumberOrNull(form.price_min),
          price_max: toNumberOrNull(form.price_max),
        },
      },
      {
        onSuccess: () => toast.success("Selection settings saved"),
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  };

  return (
    <Card className="max-w-xl space-y-5 p-6">
      <div className="flex items-center gap-2">
        <Settings2 className="h-5 w-5 text-espresso-muted" />
        <h2 className="font-semibold text-espresso">Daily selection</h2>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <Label htmlFor="auto-publish">Publish without review</Label>
          <p className="text-xs text-espresso-muted">
            Off means every drop waits in the inbox for a person.
          </p>
        </div>
        <Switch
          id="auto-publish"
          checked={form.auto_publish}
          onCheckedChange={(v) => set("auto_publish", v)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <EditorField label="Score threshold" htmlFor="score-threshold">
          <Input
            id="score-threshold"
            type="number"
            value={form.score_threshold}
            onChange={(e) => set("score_threshold", Number(e.target.value))}
          />
        </EditorField>
        <EditorField label="Daily cap" htmlFor="daily-cap">
          <Input
            id="daily-cap"
            type="number"
            value={form.daily_cap}
            onChange={(e) => set("daily_cap", Number(e.target.value))}
          />
        </EditorField>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <EditorField label="Minimum rent" htmlFor="price-min" hint="Blank for no minimum.">
          <Input
            id="price-min"
            type="number"
            value={form.price_min}
            onChange={(e) => set("price_min", e.target.value)}
          />
        </EditorField>
        <EditorField label="Maximum rent" htmlFor="price-max" hint="Blank for no maximum.">
          <Input
            id="price-max"
            type="number"
            value={form.price_max}
            onChange={(e) => set("price_max", e.target.value)}
          />
        </EditorField>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="require-hero"
          checked={form.require_hero_image}
          onCheckedChange={(v) => set("require_hero_image", v)}
        />
        <Label htmlFor="require-hero">Skip listings with no photo</Label>
      </div>

      <Button
        onClick={save}
        disabled={patch.isPending}
        className="w-full bg-espresso text-sand hover:bg-espresso/90"
      >
        {patch.isPending ? "Saving…" : "Save settings"}
      </Button>
    </Card>
  );
};

export default DropSettings;
