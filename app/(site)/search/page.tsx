import { ArticleCard } from "@/components/articles/article-card";
import { SectionHeading } from "@/components/home/section-heading";
import { buildMetadata } from "@/lib/seo";
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
  const { q } = await searchParams;
  const query = q?.trim() || "";
  const results = query
    ? await getPublishedArticles({ search: query, limit: 24 })
    : { data: [], total: 0, page: 1, totalPages: 0 };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <SectionHeading
        title={query ? `Results for "${query}"` : "Search"}
        subtitle={query ? `${results.total} articles found` : "Enter a search term in the URL: /search?q=your+query"}
      />
      {results.data.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.data.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      ) : query ? (
        <p className="text-center text-gray-500">No articles found. Try a different search term.</p>
      ) : null}
    </div>
  );
}
