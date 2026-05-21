import { ArticleCard } from "@/components/articles/article-card";
import { SectionHeading } from "@/components/home/section-heading";
import { buildMetadata } from "@/lib/seo";
import { getServerTranslations } from "@/lib/i18n/server";
import { getPublishedArticles } from "@/services/article.service";

export const metadata = buildMetadata({
  title: "News",
  description: "Latest news and breaking stories from WorldView Creative Media.",
  path: "/news",
});

export default async function NewsPage() {
  const { t, locale } = await getServerTranslations();
  const { data: articles, total, page, totalPages } = await getPublishedArticles({
    limit: 12,
    locale,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <SectionHeading title={t("news.title")} subtitle={t("news.subtitle")} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article, index) => (
          <ArticleCard key={article._id} article={article} priority={index === 0} />
        ))}
      </div>
      {totalPages > 1 && (
        <p className="mt-8 text-center text-sm text-foreground-muted">
          Page {page} of {totalPages}
        </p>
      )}
    </div>
  );
}
