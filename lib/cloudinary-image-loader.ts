/**
 * Custom Next.js image loader:
 * - Cloudinary URLs → CDN transforms (no /_next/image proxy timeout)
 * - Local & other remotes → built-in /_next/image optimizer (width-aware)
 */
export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  if (!src) return src;

  const q = quality ?? 75;

  if (src.includes("res.cloudinary.com")) {
    const transforms = `w_${width},q_${q},f_auto,c_limit`;
    const marker = "/upload/";

    if (!src.includes(marker)) return src;

    const [base, rest] = src.split(marker);
    if (!rest) return src;

    if (/^[^/]*w_\d+/.test(rest.split("/")[0] ?? "")) {
      return src;
    }

    return `${base}${marker}${transforms}/${rest}`;
  }

  const params = new URLSearchParams();
  params.set("url", src);
  params.set("w", String(width));
  params.set("q", String(q));
  return `/_next/image?${params.toString()}`;
}
