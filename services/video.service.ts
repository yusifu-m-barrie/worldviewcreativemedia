import { isDbConfigured, tryConnectDB } from "@/lib/db";
import { demoVideos } from "@/lib/demo-data";
import type { Locale } from "@/lib/i18n/config";
import { localizeVideo } from "@/lib/i18n/localize";
import { Video } from "@/models/Video";
import type { PaginatedResult, VideoCard } from "@/types";

export async function getPublishedVideos(options: {
  page?: number;
  limit?: number;
  featured?: boolean;
  locale?: Locale;
}): Promise<PaginatedResult<VideoCard>> {
  const locale = options.locale || "en";
  const page = options.page || 1;
  const limit = options.limit || 12;
  const skip = (page - 1) * limit;

  if (!isDbConfigured()) {
    const data = demoVideos.slice(skip, skip + limit).map((v) => localizeVideo(v, locale));
    return {
      data,
      total: demoVideos.length,
      page,
      totalPages: 1,
    };
  }

  if (!(await tryConnectDB())) {
    const data = demoVideos.slice(skip, skip + limit).map((v) => localizeVideo(v, locale));
    return {
      data,
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
    data: videos.map((v) =>
      localizeVideo(
        {
          _id: String(v._id),
          title: v.title,
          slug: v.slug,
          thumbnail: v.thumbnail,
          duration: v.duration,
          viewCount: v.viewCount,
          publishedAt: v.publishedAt?.toISOString(),
          description: v.description,
          translations: v.translations,
        },
        locale
      )
    ),
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function getVideoBySlug(slug: string, locale: Locale = "en") {
  if (!isDbConfigured()) {
    const v = demoVideos.find((item) => item.slug === slug);
    return v ? localizeVideo({ ...v, description: "" }, locale) : null;
  }
  if (!(await tryConnectDB())) {
    const v = demoVideos.find((item) => item.slug === slug);
    return v ? localizeVideo({ ...v, description: "" }, locale) : null;
  }
  const video = await Video.findOne({ slug, status: "published" }).lean();
  if (!video) return null;
  return localizeVideo(
    {
      ...video,
      _id: String(video._id),
      publishedAt: video.publishedAt?.toISOString(),
    },
    locale
  );
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
