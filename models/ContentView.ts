import mongoose, { Schema } from "mongoose";
import { registerModel } from "@/lib/register-model";

export type ViewContentType = "article" | "video" | "live";

export interface IContentView {
  _id: mongoose.Types.ObjectId;
  contentType: ViewContentType;
  contentId: mongoose.Types.ObjectId;
  /** Hashed visitor fingerprint (cookie id) */
  visitorKey: string;
  /** Hashed IP + browser — secondary dedupe if cookie is cleared */
  ipHash?: string;
  firstViewedAt: Date;
}

const ContentViewSchema = new Schema<IContentView>(
  {
    contentType: {
      type: String,
      enum: ["article", "video", "live"],
      required: true,
    },
    contentId: { type: Schema.Types.ObjectId, required: true },
    visitorKey: { type: String, required: true },
    ipHash: { type: String },
    firstViewedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

ContentViewSchema.index(
  { contentType: 1, contentId: 1, visitorKey: 1 },
  { unique: true }
);
ContentViewSchema.index(
  { contentType: 1, contentId: 1, ipHash: 1 },
  { unique: true, sparse: true }
);
ContentViewSchema.index({ contentId: 1, contentType: 1 });

export const ContentView = registerModel<IContentView>("ContentView", ContentViewSchema);
