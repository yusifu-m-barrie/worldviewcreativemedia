import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { canManageSite } from "@/lib/permissions";
import { getTeamArticles, getTeamAuthorStats } from "@/services/team-activity.service";
import { formatDate } from "@/lib/utils";
import {
  adminMuted,
  adminPageTitle,
  adminSubtitle,
  adminTable,
  adminTableHead,
  adminTableRow,
  adminTableWrap,
} from "@/lib/admin-ui";
import type { Role } from "@/config/roles";

export default async function AdminTeamPage() {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;

  if (!canManageSite(role)) {
    redirect("/admin/articles");
  }

  const [authorStats, articles] = await Promise.all([
    getTeamAuthorStats(),
    getTeamArticles(80),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className={adminPageTitle}>Team Activity</h1>
        <p className={`mt-1 ${adminSubtitle}`}>
          Overview of posts by content admins — post counts and whether articles were edited after
          publishing.
        </p>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-bold text-foreground">Posts by admin</h2>
        <div className={adminTableWrap}>
          <table className={adminTable}>
            <thead className={adminTableHead}>
              <tr>
                <th className="px-4 py-3 font-semibold">Admin</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Total posts</th>
                <th className="px-4 py-3 font-semibold">Edited posts</th>
              </tr>
            </thead>
            <tbody>
              {authorStats.map((row) => (
                <tr key={row.userId} className={adminTableRow}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{row.name}</p>
                    <p className={`text-xs ${adminMuted}`}>{row.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{row.role.replace(/_/g, " ")}</Badge>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">{row.postCount}</td>
                  <td className="px-4 py-3 text-foreground">{row.editedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!authorStats.length ? (
            <p className={`p-8 text-center ${adminMuted}`}>
              No content admins found. Create users with editor, journalist, or admin roles.
            </p>
          ) : null}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-foreground">All posts</h2>
        <div className={adminTableWrap}>
          <table className={adminTable}>
            <thead className={adminTableHead}>
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Author</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Edited</th>
                <th className="px-4 py-3 font-semibold">Updated</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article._id} className={adminTableRow}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{article.title}</p>
                    <p className={`text-xs ${adminMuted}`}>{article.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-foreground">{article.author.name}</p>
                    <p className={`text-xs ${adminMuted}`}>{article.author.role.replace(/_/g, " ")}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={article.status === "published" ? "default" : "secondary"}>
                      {article.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {article.wasEdited ? (
                      <Badge variant="orange">
                        Edited{article.editCount > 1 ? ` (${article.editCount}×)` : ""}
                      </Badge>
                    ) : (
                      <span className={`text-sm ${adminMuted}`}>Original</span>
                    )}
                    {article.lastEditor && article.wasEdited ? (
                      <p className={`mt-0.5 text-xs ${adminMuted}`}>by {article.lastEditor.name}</p>
                    ) : null}
                  </td>
                  <td className={`px-4 py-3 text-sm ${adminMuted}`}>
                    {formatDate(article.updatedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/articles/${article._id}/edit`}
                      className="text-sm text-[#E8872A] hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!articles.length ? (
            <p className={`p-8 text-center ${adminMuted}`}>No articles from team members yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
