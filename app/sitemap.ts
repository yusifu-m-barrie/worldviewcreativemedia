import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { demoArticles, demoCategories } from "@/lib/demo-data";
import { getPublishedArticles } from "@/services/article.service";
import { isDbConfigured } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${base}/news`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/live-tv`, changeFrequency: "always", priority: 0.9 },
    { url: `${base}/videos`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/blog`, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/categories`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/search`, changeFrequency: "monthly", priority: 0.3 },
  ];

  let articles = demoArticles;
  if (isDbConfigured()) {
    try {
      const result = await getPublishedArticles({ limit: 500 });
      articles = result.data;
    } catch {
      /* fallback to demo */
    }
  }

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${base}/news/${a.slug}`,
    lastModified: a.publishedAt ? new Date(a.publishedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = demoCategories.map((c) => ({
    url: `${base}/category/${c.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...articleRoutes, ...categoryRoutes];
}
