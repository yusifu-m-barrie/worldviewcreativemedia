/** Max video length allowed for uploads (15 minutes) */
export const MAX_VIDEO_DURATION_SEC = 15 * 60;

/** Max file size ~900MB — enough for 15 min compressed HD */
export const MAX_VIDEO_FILE_BYTES = 900 * 1024 * 1024;

/** Use chunked upload above this size (helps slow / metered connections) */
export const VIDEO_CHUNK_SIZE_BYTES = 5 * 1024 * 1024;

export function getPublicCloudName(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME
  );
}

export function getUploadPreset(): string | undefined {
  return process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
}

export function formatMaxVideoDuration(): string {
  return formatVideoDuration(MAX_VIDEO_DURATION_SEC);
}

/** Reliable MP4 URL for HTML5 video (transcodes on the fly if needed) */
export function getCloudinaryVideoPlaybackUrl(publicId: string): string {
  const cloudName = getPublicCloudName();
  if (!cloudName || !publicId) return "";

  const id = publicId.replace(/^\/+/, "");
  return `https://res.cloudinary.com/${cloudName}/video/upload/f_mp4,vc_h264,q_auto:good/${id}.mp4`;
}

/** @deprecated Use getCloudinaryVideoPlaybackUrl */
export function getOptimizedVideoPlaybackUrl(publicId: string): string {
  return getCloudinaryVideoPlaybackUrl(publicId);
}

/** Pick the best src for <video> — prefers direct secure_url, then rebuilds from public_id */
export function resolveVideoPlaybackSrc(
  videoUrl?: string,
  cloudinaryPublicId?: string
): string | undefined {
  if (cloudinaryPublicId) {
    return getCloudinaryVideoPlaybackUrl(cloudinaryPublicId);
  }

  if (!videoUrl) return undefined;

  if (videoUrl.includes("cloudinary.com")) {
    const pid = parseCloudinaryVideoUrl(videoUrl);
    if (pid) return getCloudinaryVideoPlaybackUrl(pid);
    if (videoUrl.match(/\.(mp4|webm|mov|m4v)(\?|$)/i)) {
      return videoUrl;
    }
  }

  if (videoUrl.match(/\.(mp4|webm|mov|m4v)(\?|$)/i)) {
    return videoUrl;
  }

  return videoUrl;
}

/** Auto-generated poster frame from video */
export function getVideoThumbnailUrl(publicId: string): string {
  const cloudName = getPublicCloudName();
  if (!cloudName) return "";

  const id = publicId.replace(/\//g, "/");
  return `https://res.cloudinary.com/${cloudName}/video/upload/so_2,w_1280,h_720,c_fill,q_auto,f_jpg/${id}.jpg`;
}

export function formatVideoDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Read duration from a local video file before upload */
export function readLocalVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read video file"));
    };
    video.src = url;
  });
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  duration?: number;
  thumbnail?: string;
  width?: number;
  height?: number;
}

/** YouTube / Facebook — use embed field instead */
export function isEmbedPlatformUrl(url: string): boolean {
  return /youtube\.com|youtu\.be|facebook\.com|fb\.watch/i.test(url);
}

/** Direct video file link */
export function isDirectVideoFileUrl(url: string): boolean {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) || url.includes("/video/upload/");
}

/** Extract Cloudinary public_id from a delivery URL (strips transformation segments) */
export function parseCloudinaryVideoUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("cloudinary.com")) return null;

    const marker = "/video/upload/";
    const idx = parsed.pathname.indexOf(marker);
    if (idx === -1) return null;

    let rest = decodeURIComponent(parsed.pathname.slice(idx + marker.length));
    rest = rest.replace(/^v\d+\//, "");
    const parts = rest.split("/").filter(Boolean);
    if (!parts.length) return null;

    while (parts.length > 1 && /^[a-z0-9_,:.]+$/i.test(parts[0]!) && parts[0]!.includes(":")) {
      parts.shift();
    }

    const last = parts.pop()!.replace(/\.[a-z0-9]+$/i, "");
    return parts.length ? `${parts.join("/")}/${last}` : last;
  } catch {
    return null;
  }
}
