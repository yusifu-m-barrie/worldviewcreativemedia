import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ArticleCard } from "@/components/articles/article-card";
import { SectionHeading } from "@/components/home/section-heading";
import { buildMetadata } from "@/lib/seo";
import { getCategoryBySlug } from "@/services/category.service";
import { getPublishedArticles } from "@/services/article.service";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  const name = cat?.name || slug.replace(/-/g, " ");
  return buildMetadata({
    title: name,
    description: `Latest ${name} news from WorldView Creative Media.`,
    path: `/category/${slug}`,
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  const { data: articles, total } = await getPublishedArticles({ category: slug, limit: 24 });

  if (!cat && !articles.length) notFound();

  const title = cat?.name || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const count = cat?.count ?? total;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <Link
        href="/categories"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-foreground/70 hover:text-[#E8872A]"
      >
        <ChevronLeft className="h-4 w-4" />
        All categories
      </Link>

      <SectionHeading title={title} subtitle={`${count} ${count === 1 ? "story" : "stories"}`} />

      {articles.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-foreground/60">
          No published stories in this category yet. Check back soon.
        </p>
      )}
    </div>
  );
}
