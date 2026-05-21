import mongoose, { Schema } from "mongoose";
import { registerModel } from "@/lib/register-model";
import type { ContentTranslations } from "@/lib/i18n/types";

export interface IVideo {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  videoUrl?: string;
  embedUrl?: string;
  cloudinaryPublicId?: string;
  category?: mongoose.Types.ObjectId;
  duration?: number;
  viewCount: number;
  isFeatured: boolean;
  status: "draft" | "published";
  publishedAt?: Date;
  author: mongoose.Types.ObjectId;
  /** Set when auto-published from a ended live broadcast */
  sourceLiveStreamId?: mongoose.Types.ObjectId;
  translations?: ContentTranslations;
}

const videoLocaleSchema = new Schema(
  { title: String, description: String },
  { _id: false }
);

const VideoSchema = new Schema<IVideo>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    thumbnail: String,
    videoUrl: String,
    embedUrl: String,
    cloudinaryPublicId: String,
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    duration: Number,
    viewCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    publishedAt: Date,
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sourceLiveStreamId: { type: Schema.Types.ObjectId, ref: "LiveStream" },
    translations: {
      fr: { type: videoLocaleSchema, default: undefined },
      es: { type: videoLocaleSchema, default: undefined },
    },
  },
  { timestamps: true }
);

VideoSchema.index({ status: 1, publishedAt: -1 });
VideoSchema.index({ sourceLiveStreamId: 1 });

export const Video = registerModel<IVideo>("Video", VideoSchema);
