import mongoose, { Schema, type Model } from "mongoose";

export interface ISiteSettings {
  _id: mongoose.Types.ObjectId;
  key: string;
  value: Record<string, unknown>;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings ??
  mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);
