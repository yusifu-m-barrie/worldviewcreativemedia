"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, Image as ImageIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface MediaUploadProps {
  label?: string;
  accept?: string;
  resourceType?: "image" | "video" | "auto";
  folder?: string;
  value?: string;
  onChange: (url: string, meta?: { publicId?: string; duration?: number }) => void;
}

export function MediaUpload({
  label = "Upload media",
  accept = "image/*,video/*",
  resourceType = "auto",
  folder = "worldview-media",
  value,
  onChange,
}: MediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      formData.append("resourceType", resourceType);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Upload failed");
        return;
      }

      onChange(data.url, { publicId: data.publicId, duration: data.duration });
      toast.success("Uploaded to Cloudinary");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : resourceType === "video" ? (
            <Video className="mr-2 h-4 w-4" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {uploading ? "Uploading…" : "Upload to Cloudinary"}
        </Button>
      </div>
      <Input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste URL (Cloudinary, YouTube, Facebook…)"
      />
      {value && value.match(/\.(jpg|jpeg|png|gif|webp)/i) && (
        <div className="relative mt-2 h-32 w-48 overflow-hidden rounded-lg border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="h-full w-full object-cover" />
        </div>
      )}
      {value && !value.match(/\.(jpg|jpeg|png|gif|webp)/i) && (
        <p className="flex items-center gap-1 text-xs text-gray-500">
          <ImageIcon className="h-3 w-3" />
          Media URL set
        </p>
      )}
    </div>
  );
}
