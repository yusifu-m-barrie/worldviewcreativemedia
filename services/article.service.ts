import { isDbConfigured, tryConnectDB } from "@/lib/db";
import { demoArticles } from "@/lib/demo-data";
import { getCatalogArticle } from "@/lib/i18n/catalog";
import type { Locale } from "@/lib/i18n/config";
import { localizeArticleCard, localizeArticleDetail } from "@/lib/i18n/localize";
import type { LocalizedLocale } from "@/lib/i18n/types";
import { Article } from "@/models/Article";
import type { ArticleCard, PaginatedResult } from "@/types";

function getDemoArticlesResult(
  options: {
    category?: string;
    featured?: boolean;
    breaking?: boolean;
    search?: string;
    locale?: Locale;
  },
  page: number,
  limit: number,
  skip: number
): PaginatedResult<ArticleCard> {
  const locale = options.locale || "en";
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
  const data = filtered
    .slice(skip, skip + limit)
    .map((a) => localizeArticleCard(a, locale));
  return {
    data,
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
    translations: doc.translations as ArticleCard["translations"],
  };
}

export async function getPublishedArticles(options: {
  page?: number;
  limit?: number;
  category?: string;
  featured?: boolean;
  breaking?: boolean;
  search?: string;
  locale?: Locale;
}): Promise<PaginatedResult<ArticleCard>> {
  const locale = options.locale || "en";
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
    data: articles.map((a) =>
      localizeArticleCard(mapArticle(a as unknown as Record<string, unknown>), locale)
    ),
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

function buildDemoArticleDetail(slug: string, locale: Locale) {
  const card = demoArticles.find((a) => a.slug === slug);
  if (!card) return null;

  const enContent = `<p>${card.excerpt}</p><p>WorldView Creative Media continues to bring you in-depth coverage of this developing story. Check back for updates.</p>`;
  let content = enContent;
  if (locale !== "en") {
    const cat = getCatalogArticle(slug, locale as LocalizedLocale);
    if (cat?.content) content = cat.content;
  }

  return localizeArticleDetail(
    {
      _id: card._id,
      title: card.title,
      slug: card.slug,
      excerpt: card.excerpt,
      content,
      featuredImage: card.featuredImage,
      category: card.category,
      author: card.author,
      publishedAt: card.publishedAt,
      isBreaking: card.isBreaking,
      viewCount: card.viewCount,
    },
    locale
  );
}

export async function getArticleBySlug(slug: string, locale: Locale = "en") {
  if (!isDbConfigured()) {
    return buildDemoArticleDetail(slug, locale);
  }

  if (!(await tryConnectDB())) {
    return buildDemoArticleDetail(slug, locale);
  }

  const article = await Article.findOne({ slug, status: "published" })
    .populate("category", "name slug")
    .populate("author", "name image bio")
    .populate("tags", "name slug")
    .lean();

  if (!article) return null;
  return localizeArticleDetail(article as unknown as Record<string, unknown>, locale);
}

export async function getRelatedArticles(
  slug: string,
  categorySlug?: string,
  limit = 4,
  locale: Locale = "en"
): Promise<ArticleCard[]> {
  const result = await getPublishedArticles({
    category: categorySlug,
    limit: limit + 1,
    locale,
  });
  return result.data.filter((a) => a.slug !== slug).slice(0, limit);
}

/** @deprecated Views are recorded via POST /api/views (unique per visitor). */
export async function incrementArticleViews(_id: string) {
  /* no-op — kept for backwards compatibility */
}

export interface ArticleAdminEdit {
  id: string;
  authorId: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  categorySlug: string;
  featuredImage: string;
  galleryImages: string[];
  isBreaking: boolean;
  isFeatured: boolean;
  status: "draft" | "published" | "scheduled" | "archived";
  translationsFr?: { title?: string; excerpt?: string; content?: string };
  translationsEs?: { title?: string; excerpt?: string; content?: string };
}

export async function getArticleForAdminEdit(id: string): Promise<ArticleAdminEdit | null> {
  if (!isDbConfigured() || !(await tryConnectDB())) return null;

  const article = await Article.findById(id).populate("category", "slug").lean();
  if (!article) return null;

  const category = article.category as { slug?: string } | null;
  const status = article.status as ArticleAdminEdit["status"];
  const editableStatus: ArticleAdminEdit["status"] =
    status === "published" || status === "draft" ? status : "draft";

  const tr = article.translations as {
    fr?: { title?: string; excerpt?: string; content?: string };
    es?: { title?: string; excerpt?: string; content?: string };
  } | undefined;

  return {
    id: String(article._id),
    authorId: String(article.author),
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    categorySlug: category?.slug ?? "",
    featuredImage: article.featuredImage ?? "",
    galleryImages: Array.isArray(article.gallery) ? article.gallery : [],
    isBreaking: Boolean(article.isBreaking),
    isFeatured: Boolean(article.isFeatured),
    status: editableStatus,
    translationsFr: tr?.fr,
    translationsEs: tr?.es,
  };
}
