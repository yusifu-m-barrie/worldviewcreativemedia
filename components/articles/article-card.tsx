import Image from "next/image";
import Link from "next/link";
import { Clock, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, truncate } from "@/lib/utils";
import type { ArticleCard as ArticleCardType } from "@/types";

interface ArticleCardProps {
  article: ArticleCardType;
  variant?: "default" | "featured" | "compact";
  /** First above-the-fold card — improves LCP */
  priority?: boolean;
}

export function ArticleCard({ article, variant = "default", priority = false }: ArticleCardProps) {
  const href = `/news/${article.slug}`;

  if (variant === "featured") {
    return (
      <Link href={href} className="group relative block overflow-hidden rounded-2xl">
        <div className="relative aspect-[16/9]">
          {article.featuredImage && (
            <Image
              src={article.featuredImage}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 66vw"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2E2A86]/95 via-[#2E2A86]/40 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          {article.isBreaking && <Badge variant="live" className="mb-2">Breaking</Badge>}
          {article.category && (
            <span className="mb-2 inline-block text-xs font-bold uppercase text-[#E8872A]">
              {article.category.name}
            </span>
          )}
          <h2 className="text-2xl font-bold leading-tight group-hover:text-[#E8872A] lg:text-3xl">
            {article.title}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm text-white/80">{article.excerpt}</p>
          <ArticleMeta article={article} light />
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={href} className="group flex gap-3 border-b border-gray-100 py-3 last:border-0 dark:border-gray-800">
        {article.featuredImage && (
          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md">
            <Image src={article.featuredImage} alt={article.title} fill className="object-cover" sizes="96px" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-[#2E2A86] dark:group-hover:text-[#E8872A]">
            {article.title}
          </h3>
          <ArticleMeta article={article} compact />
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className="group block overflow-hidden rounded-xl border border-border bg-background shadow-sm transition hover:shadow-md">
      {article.featuredImage && (
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {article.isBreaking && (
            <Badge variant="live" className="absolute left-3 top-3">Breaking</Badge>
          )}
        </div>
      )}
      <div className="p-4">
        {article.category && (
          <span className="text-xs font-bold uppercase text-[#E8872A]">{article.category.name}</span>
        )}
        <h3 className="mt-1 line-clamp-2 font-bold text-foreground group-hover:text-[#2E2A86] dark:group-hover:text-[#E8872A]">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-foreground/65">{truncate(article.excerpt, 100)}</p>
        <ArticleMeta article={article} />
      </div>
    </Link>
  );
}

function ArticleMeta({
  article,
  light,
  compact,
}: {
  article: ArticleCardType;
  light?: boolean;
  compact?: boolean;
}) {
  const color = light ? "text-white/70" : "text-foreground/55";
  return (
    <div className={`mt-2 flex flex-wrap items-center gap-3 text-xs ${color}`}>
      {article.publishedAt && (
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDate(article.publishedAt)}
        </span>
      )}
      {!compact && article.viewCount != null && (
        <span className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {article.viewCount.toLocaleString()}
        </span>
      )}
      {article.author && <span>{article.author.name}</span>}
    </div>
  );
}

