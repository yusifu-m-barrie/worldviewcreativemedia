import mongoose, { Schema, type Model } from "mongoose";

export interface IAnalytics {
  _id: mongoose.Types.ObjectId;
  path: string;
  referrer?: string;
  userAgent?: string;
  ipHash?: string;
  country?: string;
  articleId?: mongoose.Types.ObjectId;
  sessionId?: string;
  eventType: "pageview" | "click" | "share" | "video_play";
  metadata?: Record<string, unknown>;
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    path: { type: String, required: true },
    referrer: String,
    userAgent: String,
    ipHash: String,
    country: String,
    articleId: { type: Schema.Types.ObjectId, ref: "Article" },
    sessionId: String,
    eventType: {
      type: String,
      enum: ["pageview", "click", "share", "video_play"],
      default: "pageview",
    },
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

AnalyticsSchema.index({ createdAt: -1 });
AnalyticsSchema.index({ path: 1, createdAt: -1 });
AnalyticsSchema.index({ articleId: 1 });

export const Analytics: Model<IAnalytics> =
  mongoose.models.Analytics ??
  mongoose.model<IAnalytics>("Analytics", AnalyticsSchema);
