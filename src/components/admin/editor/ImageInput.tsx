import { useState, type ChangeEvent } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { errorMessage } from "@/hooks/admin/crud";

const BUCKET = "content-images";
const MAX_BYTES = 5 * 1024 * 1024;

type ImageInputProps = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
};

/**
 * Carried across from the daily's `editor-fields.tsx`.
 *
 * The daily asked a server function for a signed upload URL. Here the browser
 * uploads straight to storage: the `content-images` bucket already carries a
 * staff-only INSERT policy, so the database decides who may write rather than a
 * server route holding a service key.
 */
export const ImageInput = ({ value, onChange, id }: ImageInputProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > MAX_BYTES) {
      toast.error("That image is over 5MB — please resize it first.");
      return;
    }

    setUploading(true);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw new Error(error.message);

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Image uploaded");
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Upload failed"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="An image key, a URL, or upload below"
      />
      <div className="flex items-center gap-2">
        <label className="inline-flex">
          <input type="file" accept="image/*" hidden onChange={handleFile} />
          <Button type="button" size="sm" variant="outline" disabled={uploading} asChild>
            <span>
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              {uploading ? "Uploading…" : "Upload image"}
            </span>
          </Button>
        </label>
        {value && (
          <img src={value} alt="" className="h-12 w-20 rounded border border-clay object-cover" />
        )}
      </div>
    </div>
  );
};

export default ImageInput;
