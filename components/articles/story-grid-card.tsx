import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getCategoryPillClass } from "@/lib/category-styles";
import type { ArticleCard } from "@/types";

interface StoryGridCardProps {
  article: ArticleCard;
}

export function StoryGridCard({ article }: StoryGridCardProps) {
  const href = `/news/${article.slug}`;
  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        {article.featuredImage ? (
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#2E2A86]/10 text-sm text-gray-500">
            No image
          </div>
        )}
        {article.isBreaking && (
          <Badge variant="live" className="absolute left-3 top-3 shadow-md">
            Breaking
          </Badge>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {article.category && (
          <span
            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getCategoryPillClass(article.category.slug)}`}
          >
            {article.category.name}
          </span>
        )}
      </div>

      <h3 className="mt-2 font-serif text-lg font-bold uppercase leading-snug tracking-tight text-foreground transition group-hover:text-[#2E2A86] dark:group-hover:text-[#E8872A] lg:text-xl">
        {article.title}
      </h3>
    </Link>
  );
}
