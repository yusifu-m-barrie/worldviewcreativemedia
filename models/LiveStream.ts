import mongoose, { Schema, type Model } from "mongoose";
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
  customEmbedUrl?: string;
  muxPlaybackId?: string;
  obsStreamKey?: string;
  scheduledAt?: Date;
  endedAt?: Date;
  replayUrl?: string;
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
      enum: ["facebook", "youtube", "custom"],
      default: "facebook",
    },
    facebookVideoUrl: String,
    youtubeEmbedUrl: String,
    customEmbedUrl: String,
    muxPlaybackId: String,
    obsStreamKey: String,
    scheduledAt: Date,
    endedAt: Date,
    replayUrl: String,
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const LiveStream: Model<ILiveStream> =
  mongoose.models.LiveStream ??
  mongoose.model<ILiveStream>("LiveStream", LiveStreamSchema);
