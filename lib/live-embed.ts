export type LivePlatform = "facebook" | "youtube" | "custom";

export interface LiveEmbedResult {
  platform: LivePlatform;
  embedUrl: string | null;
  watchUrl: string | null;
}

/** Build Facebook video plugin embed URL from a post/live video link */
export function facebookVideoToEmbed(videoUrl: string): string {
  const href = encodeURIComponent(videoUrl.trim());
  return `https://www.facebook.com/plugins/video.php?href=${href}&show_text=false&width=1280&height=720&appId=`;
}

/** Normalize YouTube watch/share URLs to embed format */
export function youtubeToEmbed(url: string): string {
  const trimmed = url.trim();
  if (trimmed.includes("/embed/")) return trimmed;
  const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  const liveMatch = trimmed.match(/youtube\.com\/live\/([\w-]+)/);
  if (liveMatch) return `https://www.youtube.com/embed/${liveMatch[1]}`;
  return trimmed;
}

export function resolveLiveEmbed(input: {
  platform: LivePlatform;
  facebookVideoUrl?: string | null;
  youtubeEmbedUrl?: string | null;
  customEmbedUrl?: string | null;
  facebookPageUrl?: string | null;
}): LiveEmbedResult {
  const { platform } = input;

  if (platform === "facebook") {
    const videoUrl = input.facebookVideoUrl?.trim();
    const pageUrl = input.facebookPageUrl?.trim();
    if (videoUrl) {
      return {
        platform: "facebook",
        embedUrl: facebookVideoToEmbed(videoUrl),
        watchUrl: videoUrl,
      };
    }
    if (pageUrl) {
      return {
        platform: "facebook",
        embedUrl: null,
        watchUrl: pageUrl.endsWith("/live") ? pageUrl : `${pageUrl.replace(/\/$/, "")}/live`,
      };
    }
    return { platform: "facebook", embedUrl: null, watchUrl: null };
  }

  if (platform === "youtube") {
    const raw = input.youtubeEmbedUrl?.trim();
    if (!raw) return { platform: "youtube", embedUrl: null, watchUrl: null };
    const embedUrl = youtubeToEmbed(raw);
    return {
      platform: "youtube",
      embedUrl,
      watchUrl: raw.includes("youtube.com") ? raw : embedUrl,
    };
  }

  const custom = input.customEmbedUrl?.trim();
  return {
    platform: "custom",
    embedUrl: custom || null,
    watchUrl: custom || null,
  };
}
