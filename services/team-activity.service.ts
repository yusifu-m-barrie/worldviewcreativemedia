import { isDbConfigured, tryConnectDB } from "@/lib/db";
import { CONTENT_ADMIN_ROLES } from "@/config/roles";
import { Article } from "@/models/Article";
import { User } from "@/models/User";

export interface AuthorStats {
  userId: string;
  name: string;
  email: string;
  role: string;
  postCount: number;
  editedCount: number;
}

export interface TeamArticleRow {
  _id: string;
  title: string;
  slug: string;
  status: string;
  editCount: number;
  wasEdited: boolean;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string; email: string; role: string };
  lastEditor?: { id: string; name: string };
}

export async function getTeamAuthorStats(): Promise<AuthorStats[]> {
  if (!isDbConfigured() || !(await tryConnectDB())) return [];

  const users = await User.find({
    role: { $in: CONTENT_ADMIN_ROLES },
    isActive: true,
  })
    .select("name email role")
    .lean();

  const counts = await Article.aggregate<{
    _id: unknown;
    postCount: number;
    editedCount: number;
  }>([
    {
      $group: {
        _id: "$author",
        postCount: { $sum: 1 },
        editedCount: { $sum: { $cond: [{ $gt: ["$editCount", 0] }, 1, 0] } },
      },
    },
  ]);

  const countMap = new Map(
    counts.map((c) => [String(c._id), { postCount: c.postCount, editedCount: c.editedCount }])
  );

  return users.map((u) => {
    const stats = countMap.get(String(u._id)) ?? { postCount: 0, editedCount: 0 };
    return {
      userId: String(u._id),
      name: u.name,
      email: u.email,
      role: u.role,
      postCount: stats.postCount,
      editedCount: stats.editedCount,
    };
  });
}

export async function getTeamArticles(limit = 50): Promise<TeamArticleRow[]> {
  if (!isDbConfigured() || !(await tryConnectDB())) return [];

  const articles = await Article.find()
    .sort({ updatedAt: -1 })
    .limit(limit)
    .populate("author", "name email role")
    .populate("lastEditedBy", "name")
    .select("title slug status editCount createdAt updatedAt author lastEditedBy")
    .lean();

  return articles.map((a) => {
    const authorRaw = a.author as unknown;
    const author =
      authorRaw &&
      typeof authorRaw === "object" &&
      "name" in authorRaw &&
      "email" in authorRaw &&
      "role" in authorRaw
        ? (authorRaw as { _id: unknown; name: string; email: string; role: string })
        : null;

    const lastRaw = a.lastEditedBy as unknown;
    const lastEditor =
      lastRaw &&
      typeof lastRaw === "object" &&
      "name" in lastRaw &&
      "_id" in lastRaw
        ? (lastRaw as { _id: unknown; name: string })
        : null;

    const editCount = a.editCount ?? 0;
    return {
      _id: String(a._id),
      title: a.title,
      slug: a.slug,
      status: a.status,
      editCount,
      wasEdited: editCount > 0,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
      author: {
        id: author ? String(author._id) : String(a.author),
        name: author?.name ?? "Unknown",
        email: author?.email ?? "",
        role: author?.role ?? "user",
      },
      lastEditor: lastEditor
        ? { id: String(lastEditor._id), name: lastEditor.name }
        : undefined,
    };
  });
}

export async function getMyArticleCount(authorId: string): Promise<number> {
  if (!isDbConfigured() || !(await tryConnectDB())) return 0;
  return Article.countDocuments({ author: authorId });
}
