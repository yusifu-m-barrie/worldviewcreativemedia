import { isDbConfigured, tryConnectDB } from "@/lib/db";
import { resolveLiveEmbed, type LivePlatform } from "@/lib/live-embed";
import { demoLiveStream } from "@/lib/demo-data";
import { getSiteSettings } from "@/services/settings.service";
import { LiveStream } from "@/models/LiveStream";
import type { LiveStreamCard } from "@/types";

function mapStream(
  live: {
    _id: unknown;
    title: string;
    slug: string;
    isLive: boolean;
    platform?: LivePlatform;
    facebookVideoUrl?: string;
    youtubeEmbedUrl?: string;
    tiktokVideoUrl?: string;
    customEmbedUrl?: string;
    thumbnail?: string;
    scheduledAt?: Date;
    description?: string;
  },
  facebookPageUrl?: string,
  tiktokProfileUrl?: string
): LiveStreamCard {
  const platform = (live.platform || "facebook") as LivePlatform;
  const embed = resolveLiveEmbed({
    platform,
    facebookVideoUrl: live.facebookVideoUrl,
    youtubeEmbedUrl: live.youtubeEmbedUrl,
    tiktokVideoUrl: live.tiktokVideoUrl,
    customEmbedUrl: live.customEmbedUrl,
    facebookPageUrl,
    tiktokProfileUrl,
  });

  return {
    _id: String(live._id),
    title: live.title,
    slug: live.slug,
    isLive: live.isLive,
    platform: embed.platform,
    embedUrl: embed.embedUrl,
    watchUrl: embed.watchUrl,
    youtubeEmbedUrl: embed.embedUrl || live.youtubeEmbedUrl,
    thumbnail: live.thumbnail,
    scheduledAt: live.scheduledAt?.toISOString(),
    description: live.description,
  };
}

export async function getCurrentLiveStream(): Promise<LiveStreamCard | null> {
  const settings = await getSiteSettings();

  if (!isDbConfigured()) {
    const demo = { ...demoLiveStream, platform: "youtube" as LivePlatform };
    return mapStream(
      {
        _id: demo._id,
        title: demo.title,
        slug: demo.slug,
        isLive: demo.isLive,
        platform: "youtube",
        youtubeEmbedUrl: demo.youtubeEmbedUrl,
        thumbnail: demo.thumbnail,
      },
      settings.live.facebookPageUrl,
      settings.live.tiktokProfileUrl
    );
  }

  if (!(await tryConnectDB())) {
    const demo = { ...demoLiveStream, platform: "youtube" as LivePlatform };
    return mapStream(
      {
        _id: demo._id,
        title: demo.title,
        slug: demo.slug,
        isLive: demo.isLive,
        platform: "youtube",
        youtubeEmbedUrl: demo.youtubeEmbedUrl,
        thumbnail: demo.thumbnail,
      },
      settings.live.facebookPageUrl,
      settings.live.tiktokProfileUrl
    );
  }

  const live = await LiveStream.findOne({ isLive: true }).sort({ updatedAt: -1 }).lean();
  if (live) {
    return mapStream(live, settings.live.facebookPageUrl, settings.live.tiktokProfileUrl);
  }
  return null;
}

export async function getUpcomingStreams() {
  if (!isDbConfigured()) {
    return [
      {
        _id: "up1",
        title: "Morning Briefing — 7:00 AM GMT",
        slug: "morning-briefing",
        isLive: false,
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      },
    ];
  }

  if (!(await tryConnectDB())) {
    return [
      {
        _id: "up1",
        title: "Morning Briefing — 7:00 AM GMT",
        slug: "morning-briefing",
        isLive: false,
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      },
    ];
  }

  const streams = await LiveStream.find({
    isLive: false,
    scheduledAt: { $gte: new Date() },
  })
    .sort({ scheduledAt: 1 })
    .limit(10)
    .lean();

  return streams.map((s) => ({
    _id: String(s._id),
    title: s.title,
    slug: s.slug,
    isLive: s.isLive,
    scheduledAt: s.scheduledAt?.toISOString(),
    thumbnail: s.thumbnail,
  }));
}

export async function getStreamArchive() {
  if (!isDbConfigured()) return [];
  if (!(await tryConnectDB())) return [];
  return LiveStream.find({ isLive: false, replayUrl: { $exists: true, $ne: "" } })
    .sort({ endedAt: -1 })
    .limit(12)
    .lean();
}

export async function getAllLiveStreamsForAdmin() {
  if (!isDbConfigured()) return [];
  if (!(await tryConnectDB())) return [];
  return LiveStream.find().sort({ updatedAt: -1 }).limit(50).lean();
}
