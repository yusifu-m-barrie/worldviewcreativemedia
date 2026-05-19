"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface GalleryUploadProps {
  label?: string;
  folder?: string;
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function GalleryUpload({
  label = "Additional images (gallery)",
  folder = "worldview/articles/gallery",
  images,
  onChange,
  maxImages = 12,
}: GalleryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  async function uploadFile(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    formData.append("resourceType", "image");

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || `Failed to upload ${file.name}`);
      return null;
    }
    return data.url as string;
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;

    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${maxImages} gallery images allowed`);
      return;
    }

    const files = Array.from(fileList).slice(0, remaining);
    setUploading(true);

    const uploaded: string[] = [];
    for (const file of files) {
      const url = await uploadFile(file);
      if (url) uploaded.push(url);
    }

    if (uploaded.length) {
      onChange([...images, ...uploaded]);
      toast.success(
        uploaded.length === 1 ? "1 image added to gallery" : `${uploaded.length} images added to gallery`
      );
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function addUrl() {
    const url = urlInput.trim();
    if (!url) return;
    if (images.length >= maxImages) {
      toast.error(`Maximum ${maxImages} gallery images allowed`);
      return;
    }
    if (images.includes(url)) {
      toast.error("This image is already in the gallery");
      return;
    }
    onChange([...images, url]);
    setUrlInput("");
    toast.success("Image added to gallery");
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-4 dark:border-gray-600 dark:bg-gray-900/30">
      <div>
        <label className="block text-sm font-medium text-foreground">{label}</label>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          Extra photos for the story — separate from the featured image. Up to {maxImages} images.
        </p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Gallery ${index + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white opacity-90 shadow hover:bg-red-700"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading || images.length >= maxImages}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {uploading ? "Uploading…" : "Upload multiple images"}
        </Button>
        <span className="flex items-center text-xs text-gray-500">
          <ImagePlus className="mr-1 h-3.5 w-3.5" />
          {images.length}/{maxImages}
        </span>
      </div>

      <div className="flex gap-2">
        <Input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Or paste image URL and add"
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
        />
        <Button type="button" variant="ghost" size="sm" onClick={addUrl} disabled={!urlInput.trim()}>
          Add URL
        </Button>
      </div>
    </div>
  );
}
