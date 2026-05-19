import mongoose, { Schema, type Model } from "mongoose";

export interface IComment {
  _id: mongoose.Types.ObjectId;
  content: string;
  author: mongoose.Types.ObjectId;
  article: mongoose.Types.ObjectId;
  parent?: mongoose.Types.ObjectId;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    content: { type: String, required: true, maxlength: 2000 },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    article: { type: Schema.Types.ObjectId, ref: "Article", required: true },
    parent: { type: Schema.Types.ObjectId, ref: "Comment" },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CommentSchema.index({ article: 1, createdAt: -1 });

export const Comment: Model<IComment> =
  mongoose.models.Comment ?? mongoose.model<IComment>("Comment", CommentSchema);
