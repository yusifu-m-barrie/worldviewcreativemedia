import { isDbConfigured, tryConnectDB } from "@/lib/db";
import { demoArticles } from "@/lib/demo-data";
import { Article } from "@/models/Article";
import type { ArticleCard, PaginatedResult } from "@/types";

function getDemoArticlesResult(
  options: {
    category?: string;
    featured?: boolean;
    breaking?: boolean;
    search?: string;
  },
  page: number,
  limit: number,
  skip: number
): PaginatedResult<ArticleCard> {
  let filtered = [...demoArticles];
  if (options.category) {
    filtered = filtered.filter((a) => a.category?.slug === options.category);
  }
  if (options.featured) filtered = filtered.filter((a) => a.isFeatured);
  if (options.breaking) filtered = filtered.filter((a) => a.isBreaking);
  if (options.search) {
    const q = options.search.toLowerCase();
    filtered = filtered.filter(
      (a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q)
    );
  }
  return {
    data: filtered.slice(skip, skip + limit),
    total: filtered.length,
    page,
    totalPages: Math.ceil(filtered.length / limit) || 1,
  };
}

function mapArticle(doc: Record<string, unknown>): ArticleCard {
  const category = doc.category as { name?: string; slug?: string } | undefined;
  const author = doc.author as { name?: string; image?: string } | undefined;
  return {
    _id: String(doc._id),
    title: doc.title as string,
    slug: doc.slug as string,
    excerpt: doc.excerpt as string,
    featuredImage: doc.featuredImage as string | undefined,
    category: category?.name
      ? { name: category.name, slug: category.slug || "" }
      : undefined,
    author: author?.name ? { name: author.name, image: author.image } : undefined,
    publishedAt: doc.publishedAt
      ? new Date(doc.publishedAt as string).toISOString()
      : undefined,
    isBreaking: doc.isBreaking as boolean,
    isFeatured: doc.isFeatured as boolean,
    viewCount: doc.viewCount as number,
    region: doc.region as string | undefined,
  };
}

export async function getPublishedArticles(options: {
  page?: number;
  limit?: number;
  category?: string;
  featured?: boolean;
  breaking?: boolean;
  search?: string;
}): Promise<PaginatedResult<ArticleCard>> {
  const page = options.page || 1;
  const limit = options.limit || 12;
  const skip = (page - 1) * limit;

  if (!isDbConfigured()) {
    return getDemoArticlesResult(options, page, limit, skip);
  }

  if (!(await tryConnectDB())) {
    return getDemoArticlesResult(options, page, limit, skip);
  }

  const query: Record<string, unknown> = { status: "published" };
  if (options.featured) query.isFeatured = true;
  if (options.breaking) query.isBreaking = true;
  if (options.search) query.$text = { $search: options.search };

  let categoryId: string | undefined;
  if (options.category) {
    const { Category } = await import("@/models/Category");
    const cat = await Category.findOne({ slug: options.category });
    if (cat) query.category = cat._id;
  }

  const [articles, total] = await Promise.all([
    Article.find(query)
      .populate("category", "name slug")
      .populate("author", "name image")
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Article.countDocuments(query),
  ]);

  return {
    data: articles.map((a) => mapArticle(a as unknown as Record<string, unknown>)),
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function getArticleBySlug(slug: string) {
  if (!isDbConfigured()) {
    return demoArticles.find((a) => a.slug === slug) || null;
  }

  if (!(await tryConnectDB())) {
    return demoArticles.find((a) => a.slug === slug) || null;
  }

  const article = await Article.findOne({ slug, status: "published" })
    .populate("category", "name slug")
    .populate("author", "name image bio")
    .populate("tags", "name slug")
    .lean();

  if (!article) return null;
  return article;
}

export async function getRelatedArticles(
  slug: string,
  categorySlug?: string,
  limit = 4
): Promise<ArticleCard[]> {
  const result = await getPublishedArticles({
    category: categorySlug,
    limit: limit + 1,
  });
  return result.data.filter((a) => a.slug !== slug).slice(0, limit);
}

export async function incrementArticleViews(id: string) {
  if (!isDbConfigured() || !(await tryConnectDB())) return;
  await Article.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
}
