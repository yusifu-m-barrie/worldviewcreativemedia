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

/** Fast-loading progressive MP4 from Cloudinary */
export function getOptimizedVideoPlaybackUrl(publicId: string): string {
  const cloudName = getPublicCloudName();
  if (!cloudName) return "";

  const id = publicId.replace(/\//g, "/");
  return `https://res.cloudinary.com/${cloudName}/video/upload/q_auto:low,f_auto,vc_h264,fl_progressive/${id}.mp4`;
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

/** Extract Cloudinary public_id from a delivery URL */
export function parseCloudinaryVideoUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("cloudinary.com")) return null;
    const match = parsed.pathname.match(/\/video\/upload\/(?:v\d+\/)?(.+)$/i);
    if (!match?.[1]) return null;
    return decodeURIComponent(match[1].replace(/\.[a-z0-9]+$/i, ""));
  } catch {
    return null;
  }
}
