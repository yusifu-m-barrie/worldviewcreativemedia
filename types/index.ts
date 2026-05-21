import type { Role } from "@/config/roles";
import type { AdminPermissions } from "@/lib/admin-permissions";
import type { ContentTranslations } from "@/lib/i18n/types";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: AdminPermissions;
  image?: string;
}

export interface ArticleCard {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  category?: { name: string; slug: string };
  author?: { name: string; image?: string };
  publishedAt?: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  viewCount?: number;
  /** Sierra Leone region / city for homepage filters */
  region?: string;
  translations?: ContentTranslations;
}

export interface VideoCard {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  duration?: number;
  viewCount?: number;
  publishedAt?: string;
}

export type LivePlatform = "facebook" | "youtube" | "tiktok" | "custom";

export interface LiveStreamCard {
  _id: string;
  title: string;
  slug: string;
  isLive: boolean;
  platform?: LivePlatform;
  embedUrl?: string | null;
  watchUrl?: string | null;
  youtubeEmbedUrl?: string;
  thumbnail?: string;
  scheduledAt?: string;
  description?: string;
  viewCount?: number;
}

export interface AdPlacement {
  _id: string;
  title: string;
  placement: string;
  imageUrl?: string;
  linkUrl?: string;
  adCode?: string;
  isActive: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}
