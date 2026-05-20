import mongoose, { Schema } from "mongoose";
import { registerModel } from "@/lib/register-model";
import type { LivePlatform } from "@/lib/live-embed";

export interface ILiveStream {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  isLive: boolean;
  platform: LivePlatform;
  facebookVideoUrl?: string;
  youtubeEmbedUrl?: string;
  tiktokVideoUrl?: string;
  customEmbedUrl?: string;
  muxPlaybackId?: string;
  obsStreamKey?: string;
  scheduledAt?: Date;
  endedAt?: Date;
  replayUrl?: string;
  /** Auto-created video in /videos after broadcast ends */
  publishedVideoId?: mongoose.Types.ObjectId;
  viewCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const LiveStreamSchema = new Schema<ILiveStream>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    thumbnail: String,
    isLive: { type: Boolean, default: false },
    platform: {
      type: String,
      enum: ["facebook", "youtube", "tiktok", "custom"],
      default: "facebook",
    },
    facebookVideoUrl: String,
    youtubeEmbedUrl: String,
    tiktokVideoUrl: String,
    customEmbedUrl: String,
    muxPlaybackId: String,
    obsStreamKey: String,
    scheduledAt: Date,
    endedAt: Date,
    replayUrl: String,
    publishedVideoId: { type: Schema.Types.ObjectId, ref: "Video" },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const LiveStream = registerModel<ILiveStream>("LiveStream", LiveStreamSchema);
