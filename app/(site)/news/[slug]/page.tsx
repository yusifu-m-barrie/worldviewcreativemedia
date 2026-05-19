import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Eye, ArrowLeft } from "lucide-react";
import { ArticleCard } from "@/components/articles/article-card";
import { ArticleGallery } from "@/components/articles/article-gallery";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/json-ld";
import { buildMetadata, articleJsonLd } from "@/lib/seo";
import { absoluteUrl, formatDate } from "@/lib/utils";
import { getArticleBySlug, getRelatedArticles, incrementArticleViews } from "@/services/article.service";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  const title = (article as { title: string }).title;
  const excerpt = (article as { excerpt: string }).excerpt;
  const image = (article as { featuredImage?: string }).featuredImage;
  return buildMetadata({ title, description: excerpt, image, path: `/news/${slug}` });
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const a = article as {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    content?: string;
    featuredImage?: string;
    gallery?: string[];
    category?: { name: string; slug: string };
    author?: { name: string; image?: string; bio?: string };
    publishedAt?: string | Date;
    isBreaking?: boolean;
    viewCount?: number;
  };

  if (a._id) await incrementArticleViews(a._id);

  const related = await getRelatedArticles(slug, a.category?.slug, 4);
  const content =
    a.content ||
    `<p>${a.excerpt}</p><p>WorldView Creative Media continues to bring you in-depth coverage of this developing story. Check back for updates.</p>`;

  const jsonLd = articleJsonLd({
    title: a.title,
    description: a.excerpt,
    url: absoluteUrl(`/news/${slug}`),
    image: a.featuredImage,
    datePublished: a.publishedAt ? new Date(a.publishedAt).toISOString() : undefined,
    authorName: a.author?.name,
  });

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 lg:px-6">
      <JsonLd data={jsonLd} />
      <Link href="/news" className="mb-6 inline-flex items-center gap-2 text-sm text-[#2E2A86] hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to News
      </Link>
      {a.category && (
        <Link href={`/category/${a.category.slug}`} className="text-xs font-bold uppercase text-[#E8872A]">
          {a.category.name}
        </Link>
      )}
      <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white lg:text-4xl">{a.title}</h1>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
        {a.isBreaking && <Badge variant="live">Breaking</Badge>}
        {a.publishedAt && (
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatDate(a.publishedAt)}
          </span>
        )}
        {a.viewCount != null && (
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {a.viewCount.toLocaleString()} views
          </span>
        )}
        {a.author && <span>By {a.author.name}</span>}
      </div>
      {a.featuredImage && (
        <div className="relative mt-8 aspect-video overflow-hidden rounded-2xl">
          <Image src={a.featuredImage} alt={a.title} fill className="object-cover" priority sizes="(max-width: 896px) 100vw, 896px" />
        </div>
      )}
      <div className="prose-article mt-8 text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: content }} />
      {a.gallery && a.gallery.length > 0 && <ArticleGallery images={a.gallery} title={a.title} />}
      {related.length > 0 && (
        <section className="mt-16 border-t border-gray-200 pt-10 dark:border-gray-800">
          <h2 className="mb-6 text-xl font-bold text-[#2E2A86] dark:text-white">Related Stories</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {related.map((r) => (
              <ArticleCard key={r._id} article={r} variant="compact" />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
