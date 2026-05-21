"use client";

import { facebookVideoToEmbed, tiktokToEmbed, youtubeToEmbed } from "@/lib/live-embed";
import {
  getVideoThumbnailUrl,
  parseCloudinaryVideoUrl,
  resolveVideoPlaybackSrc,
} from "@/lib/cloudinary-video";

interface VideoPlayerProps {
  title: string;
  videoUrl?: string;
  embedUrl?: string;
  cloudinaryPublicId?: string;
  thumbnail?: string;
}

export function VideoPlayer({
  title,
  videoUrl,
  embedUrl,
  cloudinaryPublicId,
  thumbnail,
}: VideoPlayerProps) {
  const isEmbed = embedUrl && !cloudinaryPublicId;
  const isCloudinary =
    cloudinaryPublicId ||
    (videoUrl && videoUrl.includes("cloudinary.com")) ||
    (videoUrl && videoUrl.match(/\.(mp4|webm|mov)(\?|$)/i));

  if (isCloudinary && !isEmbed) {
    const src = resolveVideoPlaybackSrc(videoUrl, cloudinaryPublicId);
    const pid =
      cloudinaryPublicId || (videoUrl ? parseCloudinaryVideoUrl(videoUrl) : null) || undefined;
    const poster = thumbnail || (pid ? getVideoThumbnailUrl(pid) : undefined);

    if (!src) return null;

    return (
      <video
        key={src}
        src={src}
        poster={poster}
        controls
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full bg-black object-contain"
        title={title}
      />
    );
  }

  let iframeSrc = embedUrl || videoUrl;
  if (!iframeSrc) return null;

  if (iframeSrc.includes("facebook.com")) {
    iframeSrc = facebookVideoToEmbed(iframeSrc);
  } else if (iframeSrc.includes("youtube") || iframeSrc.includes("youtu.be")) {
    iframeSrc = youtubeToEmbed(iframeSrc);
  } else if (iframeSrc.includes("tiktok.com") || iframeSrc.includes("vm.tiktok.com")) {
    iframeSrc = tiktokToEmbed(iframeSrc);
  }

  return (
    <iframe
      src={iframeSrc}
      title={title}
      className="absolute inset-0 h-full w-full border-0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}
