import mongoose, { Schema } from "mongoose";
import { registerModel } from "@/lib/register-model";
import type { AdminPermissions } from "@/lib/admin-permissions";
import { ROLES, type Role } from "@/config/roles";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: Role;
  /** Access flags for dashboard sections (main admin assigns these) */
  permissions?: AdminPermissions;
  image?: string;
  bio?: string;
  socialLinks?: Record<string, string>;
  bookmarks: mongoose.Types.ObjectId[];
  isActive: boolean;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    permissions: {
      articles: { type: Boolean, default: true },
      videos: { type: Boolean, default: false },
      liveTv: { type: Boolean, default: false },
      settings: { type: Boolean, default: false },
    },
    image: String,
    bio: String,
    socialLinks: { type: Map, of: String },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: "Article" }],
    isActive: { type: Boolean, default: true },
    emailVerified: Date,
  },
  { timestamps: true }
);

UserSchema.index({ role: 1 });

export const User = registerModel<IUser>("User", UserSchema);
