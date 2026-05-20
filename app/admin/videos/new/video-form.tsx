"use client";

import { useState } from "react";
import { createVideo } from "@/actions/video.actions";
import { MediaUpload } from "@/components/admin/media-upload";
import { VideoUpload } from "@/components/admin/video-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminField, adminLabel, adminTextarea } from "@/lib/admin-ui";
import { toast } from "sonner";

interface VideoFormProps {
  categories: { name: string; slug: string }[];
}

export function VideoForm({ categories }: VideoFormProps) {
  const [thumbnail, setThumbnail] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState("");
  const [duration, setDuration] = useState<number | undefined>();
  const [pending, setPending] = useState(false);

  async function submit(status: "draft" | "published") {
    const form = document.getElementById("video-form") as HTMLFormElement;
    if (!form) return;
    const formData = new FormData(form);
    formData.set("thumbnail", thumbnail);
    formData.set("videoUrl", videoUrl);
    formData.set("cloudinaryPublicId", cloudinaryPublicId);
    if (duration) formData.set("duration", String(duration));
    formData.set("status", status);
    setPending(true);
    const result = await createVideo(formData);
    setPending(false);
    if (result?.error) toast.error(result.error);
  }

  return (
    <form id="video-form" className="max-w-2xl space-y-6" onSubmit={(e) => e.preventDefault()}>
      <div>
        <label htmlFor="title" className={adminLabel}>Title</label>
        <Input id="title" name="title" required placeholder="Video title" />
      </div>

      <div>
        <label htmlFor="description" className={adminLabel}>Description</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className={adminTextarea}
          placeholder="Short description"
        />
      </div>

      <div>
        <label htmlFor="categorySlug" className={adminLabel}>Category</label>
        <select id="categorySlug" name="categorySlug" className={adminField}>
          <option value="">— None —</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      <VideoUpload
        value={videoUrl}
        publicId={cloudinaryPublicId}
        thumbnail={thumbnail}
        duration={duration}
        onChange={(result) => {
          setVideoUrl(result.url);
          setCloudinaryPublicId(result.publicId);
          if (result.duration) setDuration(result.duration);
          if (result.thumbnail) setThumbnail(result.thumbnail);
        }}
        onClear={() => {
          setVideoUrl("");
          setCloudinaryPublicId("");
          setDuration(undefined);
        }}
      />

      <MediaUpload
        label="Thumbnail (optional — auto-generated if empty)"
        accept="image/*"
        resourceType="image"
        folder="worldview/thumbnails"
        value={thumbnail}
        onChange={setThumbnail}
      />

      <div>
        <label htmlFor="embedUrl" className={adminLabel}>
          Or embed URL (YouTube / Facebook)
        </label>
        <Input
          id="embedUrl"
          name="embedUrl"
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Use this instead of uploading if the video is already on YouTube or Facebook.
        </p>
      </div>

      <input type="hidden" name="duration" value={duration ?? ""} />

      <label className="flex items-center gap-2 text-sm text-foreground dark:text-gray-200">
        <input type="checkbox" name="isFeatured" className="rounded" />
        Feature on homepage
      </label>

      <div className="flex gap-3">
        <Button type="button" variant="outline" disabled={pending} onClick={() => submit("draft")}>
          Save draft
        </Button>
        <Button type="button" variant="orange" disabled={pending} onClick={() => submit("published")}>
          Publish
        </Button>
      </div>
    </form>
  );
}
