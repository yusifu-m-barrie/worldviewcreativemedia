import { ArticleCard } from "@/components/articles/article-card";
import { SectionHeading } from "@/components/home/section-heading";
import { buildMetadata } from "@/lib/seo";
import { getServerTranslations } from "@/lib/i18n/server";
import { getPublishedArticles } from "@/services/article.service";

export const metadata = buildMetadata({
  title: "Blog",
  description: "Opinion, analysis, and long-form stories from WorldView Creative Media.",
  path: "/blog",
});

export default async function BlogPage() {
  const { t, locale } = await getServerTranslations();
  const { data: articles, total } = await getPublishedArticles({
    limit: 12,
    category: "opinion",
    locale,
  });

  const display = articles.length
    ? articles
    : (await getPublishedArticles({ limit: 12, locale })).data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <SectionHeading title={t("blog.title")} subtitle={t("blog.subtitle")} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {display.map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </div>
    </div>
  );
}
