"use client";

import { facebookVideoToEmbed, youtubeToEmbed } from "@/lib/live-embed";
import {
  getOptimizedVideoPlaybackUrl,
  getVideoThumbnailUrl,
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
    const src = cloudinaryPublicId
      ? getOptimizedVideoPlaybackUrl(cloudinaryPublicId)
      : videoUrl!;
    const poster =
      thumbnail || (cloudinaryPublicId ? getVideoThumbnailUrl(cloudinaryPublicId) : undefined);

    return (
      <video
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
