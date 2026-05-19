import mongoose, { Schema, type Model } from "mongoose";

export interface ITag {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
}

const TagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const Tag: Model<ITag> =
  mongoose.models.Tag ?? mongoose.model<ITag>("Tag", TagSchema);
