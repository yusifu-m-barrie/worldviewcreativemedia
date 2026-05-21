"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StoryGridCard } from "@/components/articles/story-grid-card";
import { cn } from "@/lib/utils";
import type { ArticleCard } from "@/types";
import type { CategoryOption } from "@/services/category.service";
import { useTranslations } from "@/components/i18n/locale-provider";

interface LatestStoriesSectionProps {
  articles: ArticleCard[];
  categories: CategoryOption[];
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
        active
          ? "bg-[#2E2A86] text-white shadow-sm"
          : "bg-muted text-foreground-muted hover:bg-muted/80"
      )}
    >
      {children}
    </button>
  );
}

export function LatestStoriesSection({ articles, categories }: LatestStoriesSectionProps) {
  const t = useTranslations();
  const [categorySlug, setCategorySlug] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!categorySlug) return articles;
    return articles.filter((a) => a.category?.slug === categorySlug);
  }, [articles, categorySlug]);

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <h2 className="font-serif text-2xl font-bold text-foreground lg:text-3xl">
          Latest Stories
        </h2>
        <Link
          href="/news"
          className="flex items-center gap-1 text-sm font-semibold text-[#E8872A] hover:underline"
        >
          View all
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterPill active={!categorySlug} onClick={() => setCategorySlug(null)}>
          {t("home.filterAll")}
        </FilterPill>
        {categories.map((cat) => (
          <FilterPill
            key={cat.slug}
            active={categorySlug === cat.slug}
            onClick={() => setCategorySlug(cat.slug)}
          >
            {cat.name}
          </FilterPill>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2">
          {filtered.map((article) => (
            <StoryGridCard key={article._id} article={article} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border py-12 text-center text-foreground-muted">
          {t("home.noStoriesInCategory")}{" "}
          <button
            type="button"
            className="font-semibold text-[#E8872A] hover:underline"
            onClick={() => setCategorySlug(null)}
          >
            {t("home.showAll")}
          </button>
        </p>
      )}
    </section>
  );
}
