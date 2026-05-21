import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Eye, ArrowLeft } from "lucide-react";
import { ArticleCard } from "@/components/articles/article-card";
import { ArticleGallery } from "@/components/articles/article-gallery";
import { ArticleContentWithAds } from "@/components/articles/article-content-with-ads";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/json-ld";
import { buildMetadata, articleJsonLd } from "@/lib/seo";
import { absoluteUrl, formatDate } from "@/lib/utils";
import { getServerTranslations } from "@/lib/i18n/server";
import { RecordContentView } from "@/components/analytics/record-content-view";
import { getArticleBySlug, getRelatedArticles } from "@/services/article.service";

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
  const { t, locale } = await getServerTranslations();
  const article = await getArticleBySlug(slug, locale);
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

  const related = await getRelatedArticles(slug, a.category?.slug, 4, locale);
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
      {a._id ? <RecordContentView contentType="article" contentId={a._id} /> : null}
      <JsonLd data={jsonLd} />
      <Link href="/news" className="mb-6 inline-flex items-center gap-2 text-sm text-[#2E2A86] hover:underline">
        <ArrowLeft className="h-4 w-4" />
        {t("common.backToNews")}
      </Link>
      {a.category && (
        <Link href={`/category/${a.category.slug}`} className="text-xs font-bold uppercase text-[#E8872A]">
          {a.category.name}
        </Link>
      )}
      <h1 className="mt-2 text-3xl font-bold text-foreground lg:text-4xl">{a.title}</h1>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-foreground-muted">
        {a.isBreaking && <Badge variant="live">{t("common.breaking")}</Badge>}
        {a.publishedAt && (
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatDate(a.publishedAt)}
          </span>
        )}
        {a.viewCount != null && (
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {a.viewCount.toLocaleString()} {t("common.views")}
          </span>
        )}
        {a.author && (
          <span>
            {t("common.by")} {a.author.name}
          </span>
        )}
      </div>
      {a.featuredImage && (
        <div className="relative mt-8 aspect-video overflow-hidden rounded-2xl">
          <Image src={a.featuredImage} alt={a.title} fill className="object-cover" priority sizes="(max-width: 896px) 100vw, 896px" />
        </div>
      )}
      <ArticleContentWithAds html={content} />
      {a.gallery && a.gallery.length > 0 && <ArticleGallery images={a.gallery} title={a.title} />}
      {related.length > 0 && (
        <section className="mt-16 border-t border-gray-200 pt-10 dark:border-gray-800">
          <h2 className="mb-6 text-xl font-bold text-[#2E2A86] dark:text-white">{t("common.relatedStories")}</h2>
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
