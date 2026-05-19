import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isDbConfigured, tryConnectDB } from "@/lib/db";
import { demoArticles } from "@/lib/demo-data";
import { Article } from "@/models/Article";
import { formatDate } from "@/lib/utils";
import {
  adminMuted,
  adminPageTitle,
  adminTableHead,
  adminTableRow,
  adminTableWrap,
} from "@/lib/admin-ui";

async function getAdminArticles() {
  if (!isDbConfigured()) {
    return demoArticles.map((a) => ({
      _id: a._id,
      title: a.title,
      slug: a.slug,
      status: "published" as const,
      publishedAt: a.publishedAt,
      isBreaking: a.isBreaking,
    }));
  }

  if (!(await tryConnectDB())) {
    return demoArticles.map((a) => ({
      _id: a._id,
      title: a.title,
      slug: a.slug,
      status: "published" as const,
      publishedAt: a.publishedAt,
      isBreaking: a.isBreaking,
      isFeatured: a.isFeatured,
    }));
  }

  const articles = await Article.find()
    .sort({ updatedAt: -1 })
    .limit(50)
    .select("title slug status publishedAt isBreaking isFeatured")
    .lean();

  return articles.map((a) => ({
    _id: String(a._id),
    title: a.title,
    slug: a.slug,
    status: a.status,
    publishedAt: a.publishedAt?.toISOString(),
    isBreaking: a.isBreaking,
    isFeatured: a.isFeatured,
  }));
}

export default async function AdminArticlesPage() {
  const articles = await getAdminArticles();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={adminPageTitle}>Articles</h1>
        <Button asChild>
          <Link href="/admin/articles/new">
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Link>
        </Button>
      </div>

      <div className={adminTableWrap}>
        <table className="w-full text-left text-sm text-foreground">
          <thead className={adminTableHead}>
            <tr>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Published</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article._id} className={adminTableRow}>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{article.title}</p>
                  <p className={`text-xs ${adminMuted}`}>{article.slug}</p>
                  {article.isBreaking && <Badge variant="live" className="mt-1">Breaking</Badge>}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={article.status === "published" ? "default" : "secondary"}>
                    {article.status}
                  </Badge>
                </td>
                <td className={`px-4 py-3 ${adminMuted}`}>
                  {article.publishedAt ? formatDate(article.publishedAt) : "—"}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/news/${article.slug}`}
                    className="text-[#E8872A] hover:underline"
                    target="_blank"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!articles.length && (
          <p className={`p-8 text-center ${adminMuted}`}>No articles yet. Create your first article.</p>
        )}
      </div>
    </div>
  );
}
