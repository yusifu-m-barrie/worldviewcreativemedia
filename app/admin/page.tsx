import Link from "next/link";
import { StatsCards } from "@/components/admin/stats-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isDbConfigured, tryConnectDB } from "@/lib/db";
import { demoArticles } from "@/lib/demo-data";
import { adminMuted, adminPageTitle } from "@/lib/admin-ui";
import { Article } from "@/models/Article";
import { Video } from "@/models/Video";
import { LiveStream } from "@/models/LiveStream";

async function getDashboardStats() {
  if (!isDbConfigured()) {
    return {
      articles: demoArticles.length,
      views: demoArticles.reduce((s, a) => s + (a.viewCount || 0), 0),
      videos: 3,
      live: 1,
    };
  }

  if (!(await tryConnectDB())) {
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
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className={adminPageTitle}>Dashboard</h1>
        <Button asChild>
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
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="orange">
              <Link href="/admin/articles/new">Create Article</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/articles">Manage Articles</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">View Public Site</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className={`text-sm ${adminMuted}`}>
            <ul className="list-inside list-disc space-y-2">
              <li>Run <code className="rounded bg-muted px-1 text-foreground">npm run seed</code> to create admin user and categories</li>
              <li>Configure MongoDB Atlas in <code className="rounded bg-muted px-1 text-foreground">.env.local</code></li>
              <li>Add Cloudinary credentials for media uploads</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
