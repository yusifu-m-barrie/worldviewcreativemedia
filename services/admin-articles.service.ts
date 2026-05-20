import { isDbConfigured, tryConnectDB } from "@/lib/db";
import { demoArticles } from "@/lib/demo-data";
import { isSuperAdmin, type Role } from "@/config/roles";
import { Article } from "@/models/Article";

export interface AdminArticleListItem {
  _id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt?: string;
  isBreaking: boolean;
  isFeatured: boolean;
  editCount: number;
  wasEdited: boolean;
  authorId: string;
  authorName?: string;
  updatedAt?: string;
}

export async function getAdminArticleList(
  role: Role,
  userId: string
): Promise<AdminArticleListItem[]> {
  if (!isDbConfigured()) {
    return demoArticles.map((a) => ({
      _id: a._id,
      title: a.title,
      slug: a.slug,
      status: "published",
      publishedAt: a.publishedAt,
      isBreaking: a.isBreaking ?? false,
      isFeatured: a.isFeatured ?? false,
      editCount: 0,
      wasEdited: false,
      authorId: userId,
    }));
  }

  if (!(await tryConnectDB())) {
    return demoArticles.map((a) => ({
      _id: a._id,
      title: a.title,
      slug: a.slug,
      status: "published",
      publishedAt: a.publishedAt,
      isBreaking: a.isBreaking ?? false,
      isFeatured: a.isFeatured ?? false,
      editCount: 0,
      wasEdited: false,
      authorId: userId,
    }));
  }

  const filter = isSuperAdmin(role) ? {} : { author: userId };

  const articles = await Article.find(filter)
    .sort({ updatedAt: -1 })
    .limit(50)
    .populate("author", "name")
    .select("title slug status publishedAt isBreaking isFeatured editCount author updatedAt")
    .lean();

  return articles.map((a) => {
    const author = a.author as { _id?: unknown; name?: string } | null;
    const editCount = a.editCount ?? 0;
    return {
      _id: String(a._id),
      title: a.title,
      slug: a.slug,
      status: a.status,
      publishedAt: a.publishedAt?.toISOString(),
      isBreaking: a.isBreaking,
      isFeatured: a.isFeatured,
      editCount,
      wasEdited: editCount > 0,
      authorId: author?._id ? String(author._id) : String(a.author),
      authorName: author?.name,
      updatedAt: a.updatedAt?.toISOString(),
    };
  });
}
