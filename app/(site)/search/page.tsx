import { ArticleCard } from "@/components/articles/article-card";
import { SectionHeading } from "@/components/home/section-heading";
import { buildMetadata } from "@/lib/seo";
import { getServerTranslations } from "@/lib/i18n/server";
import { getPublishedArticles } from "@/services/article.service";

export const metadata = buildMetadata({
  title: "Search",
  description: "Search WorldView Creative Media news and stories.",
  path: "/search",
  noIndex: true,
});

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { t, locale } = await getServerTranslations();
  const { q } = await searchParams;
  const query = q?.trim() || "";
  const results = query
    ? await getPublishedArticles({ search: query, limit: 24, locale })
    : { data: [], total: 0, page: 1, totalPages: 0 };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <SectionHeading
        title={query ? t("search.resultsFor", { query }) : t("search.title")}
        subtitle={query ? `${results.total} articles` : t("search.title")}
      />
      {results.data.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.data.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      ) : query ? (
        <p className="text-center text-foreground-muted">{t("common.noResults")}</p>
      ) : null}
    </div>
  );
}
