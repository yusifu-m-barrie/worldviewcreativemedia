import Link from "next/link";
import { auth } from "@/lib/auth";
import { StatsCards } from "@/components/admin/stats-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isDbConfigured, tryConnectDB } from "@/lib/db";
import { demoArticles } from "@/lib/demo-data";
import { isSuperAdmin } from "@/config/roles";
import { adminMuted, adminPageHeader, adminPageTitle } from "@/lib/admin-ui";
import { getMyArticleCount, getTeamAuthorStats } from "@/services/team-activity.service";
import { Article } from "@/models/Article";
import { Video } from "@/models/Video";
import { LiveStream } from "@/models/LiveStream";
import type { Role } from "@/config/roles";

async function getSuperAdminStats() {
  if (!isDbConfigured() || !(await tryConnectDB())) {
    return {
      articles: demoArticles.length,
      views: demoArticles.reduce((s, a) => s + (a.viewCount || 0), 0),
      videos: 3,
      live: 1,
    };
  }

  const [articles, viewsAgg, videos, live] = await Promise.all([
    Article.countDocuments(),
    Article.aggregate([{ $group: { _id: null, total: { $sum: "$viewCount" } } }]),
    Video.countDocuments(),
    LiveStream.countDocuments({ isLive: true }),
  ]);

  return {
    articles,
    views: viewsAgg[0]?.total ?? 0,
    videos,
    live,
  };
}

export default async function AdminDashboardPage() {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  const userId = session?.user?.id ?? "";
  const superAdmin = isSuperAdmin(role);

  if (superAdmin) {
    const [stats, teamStats] = await Promise.all([
      getSuperAdminStats(),
      getTeamAuthorStats(),
    ]);

    const totalTeamPosts = teamStats.reduce((s, t) => s + t.postCount, 0);
    const totalEdited = teamStats.reduce((s, t) => s + t.editedCount, 0);

    return (
      <div className="space-y-6 sm:space-y-8">
        <div className={adminPageHeader}>
          <h1 className={adminPageTitle}>Main Admin Dashboard</h1>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/articles/new">New Article</Link>
          </Button>
        </div>

        <StatsCards
          stats={[
            { label: "Total Articles", value: stats.articles, icon: "articles" },
            { label: "Total Views", value: stats.views.toLocaleString(), icon: "views" },
            { label: "Videos", value: stats.videos, icon: "videos" },
            { label: "Live Streams", value: stats.live, icon: "live" },
          ]}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Team overview</CardTitle>
            </CardHeader>
            <CardContent className={`space-y-3 text-sm ${adminMuted}`}>
              <p>
                <span className="font-semibold text-foreground">{totalTeamPosts}</span> posts by
                content admins ·{" "}
                <span className="font-semibold text-foreground">{totalEdited}</span> edited after
                publish
              </p>
              <ul className="space-y-2">
                {teamStats.slice(0, 5).map((t) => (
                  <li key={t.userId} className="flex justify-between gap-2 border-b border-border pb-2 last:border-0">
                    <span className="text-foreground">{t.name}</span>
                    <span>
                      {t.postCount} posts · {t.editedCount} edited
                    </span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/team">View team activity →</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
              <Button asChild variant="orange">
                <Link href="/admin/users">Manage Admins</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/about">Edit About Page</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/articles">Manage Articles</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/settings">Site Settings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const myPosts = await getMyArticleCount(userId);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className={adminPageHeader}>
        <h1 className={adminPageTitle}>My Dashboard</h1>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/articles/new">New Article</Link>
        </Button>
      </div>

      <StatsCards
        stats={[{ label: "My Articles", value: myPosts, icon: "articles" }]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Your workspace</CardTitle>
        </CardHeader>
        <CardContent className={`space-y-3 text-sm ${adminMuted}`}>
          <p>
            You can create articles and edit <strong className="text-foreground">only your own posts</strong>.
            About page, site settings, videos, and live TV are managed by the main admin.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="orange">
              <Link href="/admin/articles/new">Write new article</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/articles">My articles</Link>
            </Button>
          </div>
          <Badge variant="secondary" className="w-fit">
            Content admin
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
