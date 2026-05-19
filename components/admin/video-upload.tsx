"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, Link2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  MAX_VIDEO_DURATION_SEC,
  MAX_VIDEO_FILE_BYTES,
  readLocalVideoDuration,
  formatVideoDuration,
  getOptimizedVideoPlaybackUrl,
  getVideoThumbnailUrl,
  isEmbedPlatformUrl,
  parseCloudinaryVideoUrl,
  type CloudinaryUploadResult,
} from "@/lib/cloudinary-video";

interface VideoUploadProps {
  value?: string;
  publicId?: string;
  thumbnail?: string;
  duration?: number;
  onChange: (result: CloudinaryUploadResult) => void;
  onClear?: () => void;
}

export function VideoUpload({
  value,
  publicId,
  thumbnail,
  duration,
  onChange,
  onClear,
}: VideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrlInput, setVideoUrlInput] = useState("");

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  async function uploadViaApi(file: File, videoDuration: number) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "worldview/videos");
    formData.append("duration", String(videoDuration));

    const res = await fetch("/api/upload/video", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data as CloudinaryUploadResult & { rawUrl?: string };
  }

  /** Direct to Cloudinary — no server body limit, supports large files */
  async function uploadDirectToCloudinary(
    file: File,
    videoDuration: number
  ): Promise<CloudinaryUploadResult> {
    if (!cloudName || !uploadPreset) {
      return uploadViaApi(file, videoDuration);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            const pid = data.public_id as string;
            const dur = Math.round((data.duration as number) || videoDuration);

            if (dur > MAX_VIDEO_DURATION_SEC) {
              reject(new Error("Video exceeds 5 minutes"));
              return;
            }

            const playback = data.eager?.[0]?.secure_url || data.secure_url;
            resolve({
              url: playback,
              publicId: pid,
              duration: dur,
              thumbnail: `https://res.cloudinary.com/${cloudName}/video/upload/so_2,w_1280,h_720,c_fill,q_auto,f_jpg/${pid}.jpg`,
              width: data.width,
              height: data.height,
            });
          } catch {
            reject(new Error("Invalid response from Cloudinary"));
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.error?.message || "Cloudinary upload failed"));
          } catch {
            reject(new Error("Cloudinary upload failed"));
          }
        }
      });

      xhr.addEventListener("error", () => reject(new Error("Network error during upload")));

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "worldview/videos");
      formData.append("resource_type", "video");
      formData.append("eager", "sp_hd");

      xhr.open("POST", url);
      xhr.send(formData);
    });
  }

  async function importVideoUrlToCloudinary(url: string) {
    const res = await fetch("/api/upload/video-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to import video");

    onChange({
      url: data.url,
      publicId: data.publicId || "",
      duration: data.duration,
      thumbnail: data.thumbnail,
      width: data.width,
      height: data.height,
    });
    setVideoUrlInput("");
    toast.success("Video added from URL");
  }

  async function applyVideoUrl() {
    const url = videoUrlInput.trim();
    if (!url) {
      toast.error("Paste a video URL first");
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error("Invalid URL");
      return;
    }

    if (isEmbedPlatformUrl(url)) {
      toast.error("Use the Embed URL field for YouTube or Facebook links");
      return;
    }

    const existingPublicId = parseCloudinaryVideoUrl(url);
    if (existingPublicId) {
      onChange({
        url: getOptimizedVideoPlaybackUrl(existingPublicId) || url,
        publicId: existingPublicId,
        thumbnail: getVideoThumbnailUrl(existingPublicId),
      });
      setVideoUrlInput("");
      toast.success("Cloudinary video linked");
      return;
    }

    setUploading(true);
    try {
      const duration = await new Promise<number>((resolve, reject) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.crossOrigin = "anonymous";
        video.onloadedmetadata = () => resolve(video.duration);
        video.onerror = () => reject(new Error("Could not load video from URL"));
        video.src = url;
      });

      if (duration > MAX_VIDEO_DURATION_SEC) {
        toast.error(`Video is ${formatVideoDuration(duration)} long. Maximum is 5:00.`);
        return;
      }

      onChange({
        url,
        publicId: "",
        duration: Math.round(duration),
      });
      setVideoUrlInput("");
      toast.success("Video URL added");
    } catch {
      toast.info("Importing video to Cloudinary…");
      await importVideoUrlToCloudinary(url);
    } finally {
      setUploading(false);
    }
  }

  async function handleFile(file: File) {
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file (MP4, MOV, WebM, etc.)");
      return;
    }

    if (file.size > MAX_VIDEO_FILE_BYTES) {
      toast.error(
        `File is too large (max ${Math.round(MAX_VIDEO_FILE_BYTES / 1024 / 1024)}MB). Try compressing the video.`
      );
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const videoDuration = await readLocalVideoDuration(file);

      if (!Number.isFinite(videoDuration) || videoDuration <= 0) {
        toast.error("Could not read video duration");
        return;
      }

      if (videoDuration > MAX_VIDEO_DURATION_SEC) {
        toast.error(
          `Video is ${formatVideoDuration(videoDuration)} long. Maximum allowed is 5:00.`
        );
        return;
      }

      toast.info(`Uploading ${formatVideoDuration(videoDuration)} video…`);

      const result = await uploadDirectToCloudinary(file, videoDuration);
      onChange(result);

      if (result.thumbnail && !thumbnail) {
        /* parent can set thumbnail from result */
      }

      toast.success("Video uploaded successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-[#2E2A86]/30 bg-[#2E2A86]/5 p-4 dark:border-[#E8872A]/30 dark:bg-[#E8872A]/5">
      <div>
        <label className="block text-sm font-medium text-foreground">
          Video upload
        </label>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          Upload a file, paste a direct video URL (.mp4), or a Cloudinary link — max{" "}
          <strong>5 minutes</strong>.
        </p>
      </div>

      {!cloudName || !uploadPreset ? (
        <div className="flex gap-2 rounded-md bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>
            Add <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code>{" "}
            and <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code>{" "}
            to <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local</code> for faster direct uploads.
            Server upload is used as fallback (smaller files work best).
          </p>
        </div>
      ) : null}

      {value && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-black dark:border-gray-700">
          <video
            src={value}
            poster={thumbnail}
            controls
            playsInline
            preload="metadata"
            className="aspect-video w-full"
          />
          <div className="flex items-center justify-between bg-gray-100 px-3 py-2 text-xs dark:bg-gray-900">
            <span className="text-gray-600 dark:text-gray-400">
              {duration ? formatVideoDuration(duration) : "Ready"}
              {publicId ? ` · ${publicId.split("/").pop()}` : ""}
            </span>
            {onClear && (
              <button
                type="button"
                onClick={onClear}
                className="font-medium text-red-600 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,.mp4,.mov,.webm"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <div className="space-y-2 border-t border-gray-200 pt-3 dark:border-gray-700">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
          Or paste video URL
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={videoUrlInput}
            onChange={(e) => setVideoUrlInput(e.target.value)}
            placeholder="https://example.com/video.mp4 or Cloudinary URL"
            disabled={uploading}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyVideoUrl();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading || !videoUrlInput.trim()}
            onClick={applyVideoUrl}
          >
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
            Use URL
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Direct .mp4 links play from the source. Other URLs are imported to Cloudinary automatically.
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="w-full sm:w-auto"
      >
        {uploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        {uploading ? `Uploading… ${progress}%` : "Upload video file (max 5 min)"}
      </Button>

      {uploading && progress > 0 && (
        <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
          <div
            className="h-full bg-[#E8872A] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
