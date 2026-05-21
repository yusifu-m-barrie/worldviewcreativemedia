"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, Link2, AlertCircle, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  MAX_VIDEO_DURATION_SEC,
  MAX_VIDEO_FILE_BYTES,
  VIDEO_CHUNK_SIZE_BYTES,
  readLocalVideoDuration,
  formatVideoDuration,
  formatMaxVideoDuration,
  getCloudinaryVideoPlaybackUrl,
  getVideoThumbnailUrl,
  resolveVideoPlaybackSrc,
  getPublicCloudName,
  getUploadPreset,
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

interface UploadSignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  chunkSize: number;
  useChunks: boolean;
  uploadPreset: string | null;
}

function isVideoFile(file: File): boolean {
  if (file.type.startsWith("video/")) return true;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ["mp4", "mov", "webm", "avi", "mkv", "m4v", "mpeg", "mpg"].includes(ext);
}

function parseCloudinaryXhrError(xhr: XMLHttpRequest): string {
  try {
    const data = JSON.parse(xhr.responseText) as {
      error?: string | { message?: string };
    };
    const msg =
      typeof data.error === "string"
        ? data.error
        : data.error && typeof data.error === "object"
          ? data.error.message
          : undefined;

    if (msg) {
      if (/invalid signature/i.test(msg)) {
        return (
          "Cloudinary rejected the upload signature. On Vercel, re-copy CLOUDINARY_API_SECRET from your Cloudinary dashboard (no spaces), or set NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to an unsigned video preset."
        );
      }
      return msg;
    }
  } catch {
    /* ignore */
  }
  return `Upload failed (${xhr.status}). Check Cloudinary API keys and try again.`;
}

function parseCloudinaryUploadResponse(
  data: Record<string, unknown>,
  cloudName: string
): CloudinaryUploadResult {
  const pid = data.public_id as string;
  const dur = Math.round((data.duration as number) || 0);
  const playback =
    (data.eager as { secure_url?: string }[] | undefined)?.[0]?.secure_url ||
    (data.secure_url as string);

  return {
    url: playback || getCloudinaryVideoPlaybackUrl(pid),
    publicId: pid,
    duration: dur,
    thumbnail: getVideoThumbnailUrl(pid) || `https://res.cloudinary.com/${cloudName}/video/upload/so_2,w_1280,h_720,c_fill,q_auto,f_jpg/${pid}.jpg`,
    width: data.width as number | undefined,
    height: data.height as number | undefined,
  };
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
  const [useChunked, setUseChunked] = useState(false);

  async function fetchUploadSignature(fileSize: number): Promise<UploadSignature> {
    const res = await fetch("/api/upload/video-signature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder: "worldview/videos", fileSize }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not start upload");
    return data as UploadSignature;
  }

  /** Upload straight to Cloudinary (signed) — bypasses server size limits, best for slow internet */
  function uploadDirectToCloudinary(
    file: File,
    videoDuration: number,
    sig: UploadSignature
  ): Promise<CloudinaryUploadResult> {
    const useChunks = sig.useChunks;
    setUseChunked(useChunks);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/video/upload`;
      const startedAt = Date.now();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText) as Record<string, unknown>;
            const dur = Math.round((data.duration as number) || videoDuration);

            if (dur > MAX_VIDEO_DURATION_SEC) {
              reject(new Error(`Video exceeds ${formatMaxVideoDuration()}`));
              return;
            }

            resolve(parseCloudinaryUploadResponse(data, sig.cloudName));
          } catch {
            reject(new Error("Invalid response from Cloudinary"));
          }
        } else {
          reject(new Error(parseCloudinaryXhrError(xhr)));
        }
      });

      xhr.addEventListener("error", () =>
        reject(new Error("Network error — check your connection and try again"))
      );
      xhr.addEventListener("timeout", () =>
        reject(new Error("Upload timed out — try again on a stable connection"))
      );

      xhr.timeout = 600000;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sig.apiKey);
      formData.append("timestamp", String(sig.timestamp));
      formData.append("signature", sig.signature);
      formData.append("folder", sig.folder);

      if (useChunks) {
        formData.append("chunk_size", String(sig.chunkSize));
      }

      // Never mix upload_preset with signed params — breaks the signature.

      xhr.open("POST", url);
      xhr.send(formData);

      if (useChunks) {
        const elapsed = Math.round((Date.now() - startedAt) / 1000);
        if (elapsed > 2) {
          toast.info("Uploading in chunks — works better on slow connections", { duration: 4000 });
        }
      }
    });
  }

  /** Unsigned preset path (optional fallback) */
  async function uploadWithPreset(file: File, videoDuration: number, preset: string, cloudName: string) {
    return new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText) as Record<string, unknown>;
            resolve(parseCloudinaryUploadResponse(data, cloudName));
          } catch {
            reject(new Error("Invalid Cloudinary response"));
          }
        } else {
          reject(new Error(parseCloudinaryXhrError(xhr)));
        }
      });

      xhr.addEventListener("error", () => reject(new Error("Network error")));

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", preset);
      formData.append("folder", "worldview/videos");
      if (file.size > VIDEO_CHUNK_SIZE_BYTES) {
        formData.append("chunk_size", String(VIDEO_CHUNK_SIZE_BYTES));
      }

      xhr.open("POST", url);
      xhr.send(formData);
    });
  }

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

  async function uploadFileToCloudinary(file: File, videoDuration: number) {
    const cloudName = getPublicCloudName();
    const preset = getUploadPreset();

    // Unsigned preset = no signature (required for reliable production uploads)
    if (preset && cloudName) {
      return await uploadWithPreset(file, videoDuration, preset, cloudName);
    }

    const sig = await fetchUploadSignature(file.size);

    try {
      return await uploadDirectToCloudinary(file, videoDuration, sig);
    } catch (signedErr) {
      if (file.size <= 4 * 1024 * 1024) {
        return await uploadViaApi(file, videoDuration);
      }

      throw signedErr;
    }
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
        url: getCloudinaryVideoPlaybackUrl(existingPublicId) || url,
        publicId: existingPublicId,
        thumbnail: getVideoThumbnailUrl(existingPublicId),
      });
      setVideoUrlInput("");
      toast.success("Cloudinary video linked");
      return;
    }

    setUploading(true);
    try {
      const urlDuration = await new Promise<number>((resolve, reject) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.crossOrigin = "anonymous";
        video.onloadedmetadata = () => resolve(video.duration);
        video.onerror = () => reject(new Error("Could not load video from URL"));
        video.src = url;
      });

      if (urlDuration > MAX_VIDEO_DURATION_SEC) {
        toast.error(`Video is ${formatVideoDuration(urlDuration)} long. Maximum is ${formatMaxVideoDuration()}.`);
        return;
      }

      onChange({
        url,
        publicId: "",
        duration: Math.round(urlDuration),
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
    if (!isVideoFile(file)) {
      toast.error("Please select a video file (MP4, MOV, WebM, etc.)");
      return;
    }

    if (file.size > MAX_VIDEO_FILE_BYTES) {
      toast.error(
        `File is too large (max ${Math.round(MAX_VIDEO_FILE_BYTES / 1024 / 1024)}MB). Compress the video or shorten it.`
      );
      return;
    }

    setUploading(true);
    setProgress(0);
    setUseChunked(false);

    try {
      const videoDuration = await readLocalVideoDuration(file);

      if (!Number.isFinite(videoDuration) || videoDuration <= 0) {
        toast.error("Could not read video duration");
        return;
      }

      if (videoDuration > MAX_VIDEO_DURATION_SEC) {
        toast.error(
          `Video is ${formatVideoDuration(videoDuration)} long. Maximum allowed is ${formatMaxVideoDuration()}.`
        );
        return;
      }

      toast.info(
        file.size > VIDEO_CHUNK_SIZE_BYTES
          ? `Uploading ${formatVideoDuration(videoDuration)} video in chunks (better on slow Wi‑Fi)…`
          : `Uploading ${formatVideoDuration(videoDuration)} video directly to Cloudinary…`,
        { duration: 5000 }
      );

      const result = await uploadFileToCloudinary(file, videoDuration);
      onChange(result);
      toast.success("Video uploaded successfully");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
      console.error("Video upload error:", err);
    } finally {
      setUploading(false);
      setProgress(0);
      setUseChunked(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const publicCloud = getPublicCloudName();

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-[#2E2A86]/30 bg-[#2E2A86]/5 p-4 dark:border-[#E8872A]/30 dark:bg-[#E8872A]/5">
      <div>
        <label className="block text-sm font-medium text-foreground">Video upload</label>
        <p className="mt-0.5 text-xs text-foreground-muted">
          Uploads go <strong>directly to Cloudinary</strong> from your browser (fast on slow internet).
          Max length: <strong>{formatMaxVideoDuration()}</strong>.
        </p>
      </div>

      <div className="flex gap-2 rounded-md bg-emerald-50 p-3 text-xs text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
        <Wifi className="h-4 w-4 shrink-0" />
        <p>
          Large files upload in {Math.round(VIDEO_CHUNK_SIZE_BYTES / 1024 / 1024)}MB chunks so metered or
          slow connections stay stable. Keep this tab open until the progress bar reaches 100%.
        </p>
      </div>

      {!getUploadPreset() ? (
        <div className="flex gap-2 rounded-md bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>
            Set{" "}
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=worldview_videos</code>{" "}
            in Vercel and redeploy. Run{" "}
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">npx tsx --env-file=.env.local scripts/setup-cloudinary-preset.ts</code>{" "}
            once to create the preset in Cloudinary.
          </p>
        </div>
      ) : null}

      {!publicCloud ? (
        <div className="flex gap-2 rounded-md bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>
            Add{" "}
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code>{" "}
            to your environment (same as <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">CLOUDINARY_CLOUD_NAME</code>).
          </p>
        </div>
      ) : null}

      {value && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-black dark:border-gray-700">
          <video
            src={resolveVideoPlaybackSrc(value, publicId) || value}
            poster={thumbnail}
            controls
            playsInline
            preload="metadata"
            className="aspect-video w-full"
          />
          <div className="flex items-center justify-between bg-gray-100 px-3 py-2 text-xs dark:bg-gray-900">
            <span className="text-foreground-muted">
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
        accept="video/*,.mp4,.mov,.webm,.avi,.mkv,.m4v"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <div className="space-y-2 border-t border-border pt-3">
        <label className="block text-xs font-medium text-foreground">Or paste video URL</label>
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
        {uploading
          ? `Uploading… ${progress}%${useChunked ? " (chunked)" : ""}`
          : `Upload video file (max ${formatMaxVideoDuration()})`}
      </Button>

      {uploading && (
        <div className="space-y-1">
          <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            <div
              className="h-full bg-[#E8872A] transition-all duration-300"
              style={{ width: `${Math.max(progress, 2)}%` }}
            />
          </div>
          <p className="text-center text-xs text-foreground-muted">{progress}% — do not close this page</p>
        </div>
      )}
    </div>
  );
}
