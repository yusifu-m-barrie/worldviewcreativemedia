"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArticleCard } from "@/components/articles/article-card";
import type { ArticleCard as ArticleCardType } from "@/types";

interface FeaturedSliderProps {
  articles: ArticleCardType[];
}

export function FeaturedSlider({ articles }: FeaturedSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || articles.length <= 1) return;
    const timer = setInterval(() => emblaApi.scrollNext(), 6000);
    return () => clearInterval(timer);
  }, [emblaApi, articles.length]);

  if (!articles.length) return null;

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden rounded-2xl">
        <div className="flex">
          {articles.map((article) => (
            <div key={article._id} className="min-w-0 shrink-0 grow-0 basis-full">
              <ArticleCard article={article} variant="featured" />
            </div>
          ))}
        </div>
      </div>
      {articles.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {articles.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-2 rounded-full transition-all ${
                i === selected ? "w-8 bg-[#E8872A]" : "w-2 bg-gray-300"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
