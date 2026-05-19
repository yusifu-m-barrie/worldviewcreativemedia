"use client";

import Image from "next/image";
import Link from "next/link";
import { Radio, Share2, Play, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LiveStreamCard } from "@/types";

interface LivePlayerProps {
  stream: LiveStreamCard | null;
  facebookPageUrl?: string;
  youtubeChannelUrl?: string;
  offlineMessage?: string;
  compact?: boolean;
}

export function LivePlayer({
  stream,
  facebookPageUrl,
  youtubeChannelUrl,
  offlineMessage,
  compact = false,
}: LivePlayerProps) {
  if (!stream) {
    return (
      <OfflinePanel
        message={offlineMessage}
        facebookPageUrl={facebookPageUrl}
        youtubeChannelUrl={youtubeChannelUrl}
      />
    );
  }

  const hasEmbed = Boolean(stream.embedUrl);

  return (
    <div className={compact ? "" : "overflow-hidden rounded-2xl bg-gray-900"}>
      <div className={`relative w-full ${compact ? "aspect-video" : "aspect-video"}`}>
        {hasEmbed ? (
          <iframe
            src={stream.embedUrl!}
            title={stream.title}
            className="absolute inset-0 h-full w-full border-0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            scrolling="no"
          />
        ) : stream.thumbnail ? (
          <Image src={stream.thumbnail} alt={stream.title} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#2E2A86] p-8 text-center text-white">
            <PlatformIcon platform={stream.platform} />
            <p className="text-lg font-semibold">{stream.title}</p>
            <WatchButtons
              watchUrl={stream.watchUrl}
              facebookPageUrl={facebookPageUrl}
              youtubeChannelUrl={youtubeChannelUrl}
              platform={stream.platform}
            />
          </div>
        )}
        {stream.isLive && (
          <Badge variant="live" className="absolute left-4 top-4 z-10">
            <Radio className="mr-1 h-3 w-3" />
            Live Now
          </Badge>
        )}
        {stream.platform && hasEmbed && (
          <div className="absolute right-4 top-4 z-10">
            <PlatformBadge platform={stream.platform} />
          </div>
        )}
      </div>
      {!compact && (
        <div className="p-6 text-white">
          <h2 className="text-2xl font-bold">{stream.title}</h2>
          {stream.description && (
            <p className="mt-2 text-white/70">{stream.description}</p>
          )}
          {!hasEmbed && (
            <div className="mt-4">
              <WatchButtons
                watchUrl={stream.watchUrl}
                facebookPageUrl={facebookPageUrl}
                youtubeChannelUrl={youtubeChannelUrl}
                platform={stream.platform}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlatformIcon({ platform }: { platform?: string }) {
  if (platform === "youtube") return <Play className="h-16 w-16 text-[#E8872A]" />;
  return <Share2 className="h-16 w-16 text-[#E8872A]" />;
}

function PlatformBadge({ platform }: { platform: string }) {
  const label =
    platform === "facebook" ? "Facebook Live" : platform === "youtube" ? "YouTube Live" : "Live";
  return (
    <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-bold uppercase text-white backdrop-blur">
      {label}
    </span>
  );
}

function WatchButtons({
  watchUrl,
  facebookPageUrl,
  youtubeChannelUrl,
  platform,
}: {
  watchUrl?: string | null;
  facebookPageUrl?: string;
  youtubeChannelUrl?: string;
  platform?: string;
}) {
  const fb = watchUrl?.includes("facebook") ? watchUrl : facebookPageUrl;
  const yt = watchUrl?.includes("youtube") ? watchUrl : youtubeChannelUrl;

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {(platform === "facebook" || fb) && fb && (
        <Button asChild variant="orange">
          <Link href={fb} target="_blank" rel="noopener noreferrer">
            <Share2 className="mr-2 h-4 w-4" />
            Watch on Facebook
          </Link>
        </Button>
      )}
      {(platform === "youtube" || yt) && yt && (
        <Button asChild variant="outline" className="border-white text-white hover:bg-white/10">
          <Link href={yt} target="_blank" rel="noopener noreferrer">
            <Play className="mr-2 h-4 w-4" />
            Watch on YouTube
          </Link>
        </Button>
      )}
      {watchUrl && (
        <Button asChild variant="ghost" className="text-white hover:bg-white/10">
          <Link href={watchUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open stream
          </Link>
        </Button>
      )}
    </div>
  );
}

function OfflinePanel({
  message,
  facebookPageUrl,
  youtubeChannelUrl,
}: {
  message?: string;
  facebookPageUrl?: string;
  youtubeChannelUrl?: string;
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-[#2E2A86]/30 bg-gray-50 p-10 text-center dark:border-white/20 dark:bg-gray-900">
      <Radio className="mx-auto h-12 w-12 text-[#E8872A]" />
      <h3 className="mt-4 text-xl font-bold text-[#2E2A86] dark:text-white">Not Live Right Now</h3>
      <p className="mx-auto mt-2 max-w-md text-gray-600 dark:text-gray-400">
        {message || "Follow us on Facebook for the next live broadcast."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {facebookPageUrl && (
          <Button asChild variant="default">
            <Link href={facebookPageUrl} target="_blank" rel="noopener noreferrer">
              <Share2 className="mr-2 h-4 w-4" />
              Facebook Page
            </Link>
          </Button>
        )}
        {youtubeChannelUrl && (
          <Button asChild variant="orange">
            <Link href={youtubeChannelUrl} target="_blank" rel="noopener noreferrer">
              <Play className="mr-2 h-4 w-4" />
              YouTube Channel
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
