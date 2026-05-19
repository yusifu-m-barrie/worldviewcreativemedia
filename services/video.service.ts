import { isDbConfigured, tryConnectDB } from "@/lib/db";
import { demoVideos } from "@/lib/demo-data";
import { Video } from "@/models/Video";
import type { PaginatedResult, VideoCard } from "@/types";

export async function getPublishedVideos(options: {
  page?: number;
  limit?: number;
  featured?: boolean;
}): Promise<PaginatedResult<VideoCard>> {
  const page = options.page || 1;
  const limit = options.limit || 12;
  const skip = (page - 1) * limit;

  if (!isDbConfigured()) {
    return {
      data: demoVideos.slice(skip, skip + limit),
      total: demoVideos.length,
      page,
      totalPages: 1,
    };
  }

  if (!(await tryConnectDB())) {
    return {
      data: demoVideos.slice(skip, skip + limit),
      total: demoVideos.length,
      page,
      totalPages: 1,
    };
  }

  const query: Record<string, unknown> = { status: "published" };
  if (options.featured) query.isFeatured = true;

  const [videos, total] = await Promise.all([
    Video.find(query).sort({ publishedAt: -1 }).skip(skip).limit(limit).lean(),
    Video.countDocuments(query),
  ]);

  return {
    data: videos.map((v) => ({
      _id: String(v._id),
      title: v.title,
      slug: v.slug,
      thumbnail: v.thumbnail,
      duration: v.duration,
      viewCount: v.viewCount,
      publishedAt: v.publishedAt?.toISOString(),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function getVideoBySlug(slug: string) {
  if (!isDbConfigured()) {
    return demoVideos.find((v) => v.slug === slug) || null;
  }
  if (!(await tryConnectDB())) {
    return demoVideos.find((v) => v.slug === slug) || null;
  }
  return Video.findOne({ slug, status: "published" }).lean();
}

export async function getAllVideosForAdmin() {
  if (!isDbConfigured()) return [];
  if (!(await tryConnectDB())) return [];
  return Video.find()
    .sort({ updatedAt: -1 })
    .limit(50)
    .populate("category", "name slug")
    .lean();
}
