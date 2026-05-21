import Link from "next/link";
import { Eye, Pencil, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isSuperAdmin } from "@/config/roles";
import { canEditArticle } from "@/lib/permissions";
import { getAdminArticleList } from "@/services/admin-articles.service";
import { formatDate } from "@/lib/utils";
import {
  adminMuted,
  adminPageHeader,
  adminPageTitle,
  adminTable,
  adminTableHead,
  adminTableRow,
  adminTableWrap,
} from "@/lib/admin-ui";
import type { Role } from "@/config/roles";
import { DeleteArticleButton } from "./delete-article-button";

interface AdminArticlesPageProps {
  searchParams: Promise<{ created?: string; updated?: string }>;
}

export default async function AdminArticlesPage({ searchParams }: AdminArticlesPageProps) {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  const userId = session?.user?.id ?? "";
  const superAdmin = isSuperAdmin(role);

  const articles = await getAdminArticleList(role!, userId);
  const { created, updated } = await searchParams;
  const flash = created ? "created" : updated ? "updated" : null;

  return (
    <div className="space-y-6">
      <div className={adminPageHeader}>
        <div>
          <h1 className={adminPageTitle}>Articles</h1>
          {!superAdmin ? (
            <p className={`mt-1 text-sm ${adminMuted}`}>Your posts only — you can edit articles you created.</p>
          ) : null}
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/articles/new">
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Link>
        </Button>
      </div>

      {flash ? (
        <p
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200"
          role="status"
        >
          Article {flash === "created" ? "published" : "updated"} successfully.
        </p>
      ) : null}

      <div className={adminTableWrap}>
        <table className={adminTable}>
          <thead className={adminTableHead}>
            <tr>
              <th className="px-4 py-3 font-semibold">Title</th>
              {superAdmin ? (
                <th className="px-4 py-3 font-semibold">Author</th>
              ) : null}
              <th className="px-4 py-3 font-semibold">Status</th>
              {superAdmin ? (
                <th className="px-4 py-3 font-semibold">Edited</th>
              ) : null}
              <th className="px-4 py-3 font-semibold">Published</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => {
              const canEdit = canEditArticle(
                role,
                session?.user?.permissions,
                userId,
                article.authorId
              );
              return (
                <tr key={article._id} className={adminTableRow}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{article.title}</p>
                    <p className={`text-xs ${adminMuted}`}>{article.slug}</p>
                    {article.isBreaking ? (
                      <Badge variant="live" className="mt-1">
                        Breaking
                      </Badge>
                    ) : null}
                  </td>
                  {superAdmin ? (
                    <td className={`px-4 py-3 text-sm ${adminMuted}`}>
                      {article.authorName ?? "—"}
                    </td>
                  ) : null}
                  <td className="px-4 py-3">
                    <Badge variant={article.status === "published" ? "default" : "secondary"}>
                      {article.status}
                    </Badge>
                  </td>
                  {superAdmin ? (
                    <td className="px-4 py-3">
                      {article.wasEdited ? (
                        <Badge variant="orange">Edited</Badge>
                      ) : (
                        <span className={`text-sm ${adminMuted}`}>No</span>
                      )}
                    </td>
                  ) : null}
                  <td className={`px-4 py-3 ${adminMuted}`}>
                    {article.publishedAt ? formatDate(article.publishedAt) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {article.status === "published" ? (
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-[#E8872A] hover:bg-[#E8872A]/10 hover:text-[#E8872A]"
                        >
                          <Link
                            href={`/news/${article.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View ${article.title}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-foreground/30"
                          disabled
                          aria-label="View (publish first)"
                          title="Publish to view on site"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {canEdit ? (
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-[#2E2A86] hover:bg-[#2E2A86]/10 hover:text-[#2E2A86] dark:text-[#E8872A] dark:hover:bg-[#E8872A]/10"
                        >
                          <Link
                            href={`/admin/articles/${article._id}/edit`}
                            aria-label={`Edit ${article.title}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      {superAdmin ? (
                        <DeleteArticleButton id={article._id} title={article.title} />
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!articles.length ? (
          <p className={`p-8 text-center ${adminMuted}`}>No articles yet. Create your first article.</p>
        ) : null}
      </div>
    </div>
  );
}
