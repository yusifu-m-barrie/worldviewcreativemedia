import Image from "next/image";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { NewsletterForm } from "@/components/home/newsletter-form";
import { getCategoryPillClass } from "@/lib/category-styles";
import { formatRelativeTime } from "@/lib/utils";
import type { ArticleCard } from "@/types";

interface TrendingNowSidebarProps {
  articles: ArticleCard[];
}

export function TrendingNowSidebar({ articles }: TrendingNowSidebarProps) {
  return (
    <aside className="space-y-6">
      <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
        <h2 className="mb-5 flex items-center gap-2 font-serif text-xl font-bold text-foreground">
          <TrendingUp className="h-5 w-5 text-red-600" />
          Trending Now
        </h2>

        {articles.length > 0 ? (
          <ul className="space-y-4">
            {articles.map((article) => (
              <li key={article._id}>
                <Link
                  href={`/news/${article.slug}`}
                  className="group flex gap-3 border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  {article.featuredImage && (
                    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={article.featuredImage}
                        alt={article.title}
                        fill
                        className="object-cover transition group-hover:scale-105"
                        sizes="80px"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    {article.category && (
                      <span
                        className={`mb-1 inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${getCategoryPillClass(article.category.slug)}`}
                      >
                        {article.category.name}
                      </span>
                    )}
                    <p className="line-clamp-3 text-xs font-bold uppercase leading-snug text-foreground group-hover:text-[#2E2A86] dark:group-hover:text-[#E8872A]">
                      {article.title}
                    </p>
                    {article.publishedAt && (
                      <p className="mt-1 text-[11px] text-foreground/55">
                        {formatRelativeTime(article.publishedAt)}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-foreground/60">
            No featured stories yet. Mark articles as featured in the CMS to show them here.
          </p>
        )}
      </div>

      <div className="rounded-xl bg-gray-950 p-6 text-white">
        <h3 className="text-lg font-bold leading-tight">Get Sierra Leone news first</h3>
        <p className="mt-2 text-sm text-white/70">
          Free daily briefing — straight to your inbox.
        </p>
        <div className="mt-4">
          <NewsletterForm variant="sidebar" />
        </div>
      </div>
    </aside>
  );
}
