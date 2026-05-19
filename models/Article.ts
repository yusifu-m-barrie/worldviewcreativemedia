import mongoose, { Schema, type Model } from "mongoose";

export type ArticleStatus = "draft" | "published" | "scheduled" | "archived";

export interface IArticle {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  /** Additional story images — separate from featuredImage */
  gallery: string[];
  category: mongoose.Types.ObjectId;
  tags: mongoose.Types.ObjectId[];
  author: mongoose.Types.ObjectId;
  status: ArticleStatus;
  isBreaking: boolean;
  isFeatured: boolean;
  isSponsored: boolean;
  publishedAt?: Date;
  scheduledAt?: Date;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  viewCount: number;
  shareCount: number;
  /** Region or city slug for local news filters (e.g. freetown, bombali) */
  region?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    featuredImage: String,
    gallery: { type: [String], default: [] },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["draft", "published", "scheduled", "archived"],
      default: "draft",
    },
    isBreaking: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isSponsored: { type: Boolean, default: false },
    publishedAt: Date,
    scheduledAt: Date,
    seoTitle: String,
    seoDescription: String,
    seoKeywords: [String],
    viewCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    region: { type: String, trim: true },
  },
  { timestamps: true }
);

ArticleSchema.index({ status: 1, publishedAt: -1 });
ArticleSchema.index({ isBreaking: 1, publishedAt: -1 });
ArticleSchema.index({ isFeatured: 1, publishedAt: -1 });
ArticleSchema.index({ title: "text", excerpt: "text", content: "text" });

export const Article: Model<IArticle> =
  mongoose.models.Article ?? mongoose.model<IArticle>("Article", ArticleSchema);
