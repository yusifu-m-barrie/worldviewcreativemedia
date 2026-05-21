import crypto from "crypto";

/**
 * Signs upload params the way Cloudinary's Upload API expects (v1 string, SHA-1).
 * Matches: folder=worldview/videos&timestamp=1234567890
 */
export function signCloudinaryUploadParams(
  params: Record<string, string | number>,
  apiSecret: string
): string {
  const toSign = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  return crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");
}
