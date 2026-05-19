import mongoose, { Schema, type Model } from "mongoose";

export interface IMedia {
  _id: mongoose.Types.ObjectId;
  filename: string;
  url: string;
  publicId?: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  uploadedBy: mongoose.Types.ObjectId;
  alt?: string;
}

const MediaSchema = new Schema<IMedia>(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    publicId: String,
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    width: Number,
    height: Number,
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    alt: String,
  },
  { timestamps: true }
);

export const Media: Model<IMedia> =
  mongoose.models.Media ?? mongoose.model<IMedia>("Media", MediaSchema);
