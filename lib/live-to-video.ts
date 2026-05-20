import mongoose from "mongoose";
import slugify from "slugify";
import { connectDB } from "@/lib/db";
import {
  getLiveReplaySourceUrl,
  replayUrlToVideoEmbed,
  type LivePlatform,
} from "@/lib/live-embed";
import { LiveStream } from "@/models/LiveStream";
import { Video } from "@/models/Video";
import { Category } from "@/models/Category";

export interface PublishLiveVideoResult {
  created: boolean;
  videoId?: string;
  videoSlug?: string;
  message?: string;
}

export async function publishLiveStreamAsVideo(
  streamId: string,
  authorId: string
): Promise<PublishLiveVideoResult> {
  await connectDB();

  const stream = await LiveStream.findById(streamId);
  if (!stream) {
    return { created: false, message: "Broadcast not found" };
  }

  if (stream.publishedVideoId) {
    const existing = await Video.findById(stream.publishedVideoId).select("slug").lean();
    return {
      created: false,
      videoId: String(stream.publishedVideoId),
      videoSlug: existing?.slug,
      message: "Already published to Videos",
    };
  }

  const replaySource = getLiveReplaySourceUrl({
    platform: stream.platform as LivePlatform,
    facebookVideoUrl: stream.facebookVideoUrl,
    youtubeEmbedUrl: stream.youtubeEmbedUrl,
    tiktokVideoUrl: stream.tiktokVideoUrl,
    customEmbedUrl: stream.customEmbedUrl,
    replayUrl: stream.replayUrl,
  });

  if (!replaySource) {
    return {
      created: false,
      message:
        "No replay URL — add a Facebook/YouTube/TikTok video link or Replay URL before ending the broadcast.",
    };
  }

  const embedUrl = replayUrlToVideoEmbed(replaySource);
  const baseSlug = slugify(stream.title, { lower: true, strict: true });
  let slug = `live-${baseSlug}`;
  const taken = await Video.findOne({ slug });
  if (taken) slug = `live-${baseSlug}-${Date.now()}`;

  let categoryId;
  const mediaCat = await Category.findOne({ slug: "media" });
  if (mediaCat) categoryId = mediaCat._id;

  const platformLabel =
    stream.platform === "facebook"
      ? "Facebook"
      : stream.platform === "youtube"
        ? "YouTube"
        : stream.platform === "tiktok"
          ? "TikTok"
          : "Live";

  const video = await Video.create({
    title: stream.title,
    slug,
    description:
      stream.description ||
      `Recording of our ${platformLabel} live broadcast on WorldView Creative Media.`,
    thumbnail: stream.thumbnail,
    embedUrl,
    videoUrl: replaySource,
    category: categoryId,
    status: "published",
    isFeatured: false,
    publishedAt: new Date(),
    author: new mongoose.Types.ObjectId(authorId),
    sourceLiveStreamId: stream._id,
  });

  stream.publishedVideoId = video._id;
  if (!stream.replayUrl) stream.replayUrl = replaySource;
  await stream.save();

  return {
    created: true,
    videoId: String(video._id),
    videoSlug: video.slug,
  };
}
