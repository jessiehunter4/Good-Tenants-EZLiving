import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/features/admin/schemas";
import type { Section } from "@/features/daily/post";

type SectionsEditorProps = {
  value: Section[];
  onChange: (value: Section[]) => void;
};

/**
 * Carried across from the daily's `editor-fields.tsx`.
 *
 * A post's body is an ordered list of headed sections rather than one blob,
 * which is what lets the reader's table of contents link into it. The id comes
 * from the heading, because that id becomes the anchor in the URL.
 */
export const SectionsEditor = ({ value, onChange }: SectionsEditorProps) => {
  const update = (index: number, patch: Partial<Section>) => {
    const next = [...value];
    next[index] = { ...next[index], ...patch };
    if (patch.heading !== undefined) {
      next[index].id = slugify(patch.heading) || `section-${index + 1}`;
    }
    onChange(next);
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {value.map((section, index) => (
        <div key={index} className="space-y-2 rounded-lg border border-clay/50 bg-sand p-3">
          <div className="flex items-center gap-1">
            <Input
              value={section.heading}
              onChange={(e) => update(index, { heading: e.target.value })}
              placeholder="Section heading"
              aria-label={`Heading for section ${index + 1}`}
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => move(index, -1)}
              aria-label={`Move section ${index + 1} up`}
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => move(index, 1)}
              aria-label={`Move section ${index + 1} down`}
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
              aria-label={`Remove section ${index + 1}`}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Textarea
            value={section.body}
            onChange={(e) => update(index, { body: e.target.value })}
            placeholder="Body — blank lines separate paragraphs"
            rows={5}
            aria-label={`Body for section ${index + 1}`}
          />
        </div>
      ))}

      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() =>
          onChange([...value, { id: `section-${value.length + 1}`, heading: "", body: "" }])
        }
      >
        <Plus className="mr-1.5 h-3.5 w-3.5" /> Add section
      </Button>
    </div>
  );
};

export default SectionsEditor;
