import mongoose, { Schema, type Model } from "mongoose";

export type AdPlacementType =
  | "homepage_hero"
  | "homepage_sidebar"
  | "article_top"
  | "article_sidebar"
  | "live_tv"
  | "footer"
  | "custom";

export interface IAdvertisement {
  _id: mongoose.Types.ObjectId;
  title: string;
  placement: AdPlacementType;
  imageUrl?: string;
  linkUrl?: string;
  adCode?: string;
  sponsorName?: string;
  startDate?: Date;
  endDate?: Date;
  clickCount: number;
  impressionCount: number;
  isActive: boolean;
  priority: number;
}

const AdvertisementSchema = new Schema<IAdvertisement>(
  {
    title: { type: String, required: true },
    placement: {
      type: String,
      enum: [
        "homepage_hero",
        "homepage_sidebar",
        "article_top",
        "article_sidebar",
        "live_tv",
        "footer",
        "custom",
      ],
      required: true,
    },
    imageUrl: String,
    linkUrl: String,
    adCode: String,
    sponsorName: String,
    startDate: Date,
    endDate: Date,
    clickCount: { type: Number, default: 0 },
    impressionCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Advertisement: Model<IAdvertisement> =
  mongoose.models.Advertisement ??
  mongoose.model<IAdvertisement>("Advertisement", AdvertisementSchema);
