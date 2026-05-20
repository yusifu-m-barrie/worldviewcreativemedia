export type LivePlatform = "facebook" | "youtube" | "tiktok" | "custom";

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

/** TikTok video URL → embed v2 player */
export function tiktokToEmbed(url: string): string {
  const trimmed = url.trim();
  if (trimmed.includes("/embed/")) return trimmed;
  const match = trimmed.match(/tiktok\.com\/(?:@[\w.]+\/video\/|v\/)(\d+)/i);
  if (match) return `https://www.tiktok.com/embed/v2/${match[1]}`;
  return trimmed;
}

export function isTikTokUrl(url: string): boolean {
  return /tiktok\.com|vm\.tiktok\.com/i.test(url);
}

export interface LiveStreamSource {
  platform: LivePlatform;
  facebookVideoUrl?: string | null;
  youtubeEmbedUrl?: string | null;
  tiktokVideoUrl?: string | null;
  customEmbedUrl?: string | null;
  replayUrl?: string | null;
}

/** Best URL to publish as a video after the broadcast ends */
export function getLiveReplaySourceUrl(stream: LiveStreamSource): string | null {
  const replay = stream.replayUrl?.trim();
  if (replay) return replay;

  if (stream.platform === "facebook" && stream.facebookVideoUrl?.trim()) {
    return stream.facebookVideoUrl.trim();
  }
  if (stream.platform === "youtube" && stream.youtubeEmbedUrl?.trim()) {
    return stream.youtubeEmbedUrl.trim();
  }
  if (stream.platform === "tiktok" && stream.tiktokVideoUrl?.trim()) {
    return stream.tiktokVideoUrl.trim();
  }
  if (stream.platform === "custom" && stream.customEmbedUrl?.trim()) {
    return stream.customEmbedUrl.trim();
  }
  return null;
}

export function replayUrlToVideoEmbed(replayUrl: string): string {
  const url = replayUrl.trim();
  if (url.includes("facebook.com")) return facebookVideoToEmbed(url);
  if (url.includes("youtube") || url.includes("youtu.be")) return youtubeToEmbed(url);
  if (isTikTokUrl(url)) return tiktokToEmbed(url);
  return url;
}

export function resolveLiveEmbed(input: {
  platform: LivePlatform;
  facebookVideoUrl?: string | null;
  youtubeEmbedUrl?: string | null;
  tiktokVideoUrl?: string | null;
  customEmbedUrl?: string | null;
  facebookPageUrl?: string | null;
  tiktokProfileUrl?: string | null;
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

  if (platform === "tiktok") {
    const raw = input.tiktokVideoUrl?.trim();
    const profile = input.tiktokProfileUrl?.trim();
    if (raw) {
      return {
        platform: "tiktok",
        embedUrl: tiktokToEmbed(raw),
        watchUrl: raw,
      };
    }
    if (profile) {
      return { platform: "tiktok", embedUrl: null, watchUrl: profile };
    }
    return { platform: "tiktok", embedUrl: null, watchUrl: null };
  }

  const custom = input.customEmbedUrl?.trim();
  return {
    platform: "custom",
    embedUrl: custom || null,
    watchUrl: custom || null,
  };
}
