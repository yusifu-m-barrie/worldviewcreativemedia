"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ArticleGalleryProps {
  images: string[];
  title: string;
}

export function ArticleGallery({ images, title }: ArticleGalleryProps) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (!images.length) return null;

  const filtered = images.filter((url) => url && url.trim());

  if (!filtered.length) return null;

  return (
  <>
      <section className="mt-10">
        <h2 className="mb-4 text-lg font-bold text-[#2E2A86] dark:text-white">Photo Gallery</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setLightbox(index)}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#E8872A] dark:border-gray-800"
            >
              <Image
                src={url}
                alt={`${title} — photo ${index + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
            </button>
          ))}
        </div>
      </section>

      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          {filtered.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((lightbox - 1 + filtered.length) % filtered.length);
                }}
                aria-label="Previous"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                type="button"
                className="absolute right-16 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((lightbox + 1) % filtered.length);
                }}
                aria-label="Next"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}
          <div
            className="relative h-[70vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={filtered[lightbox]}
              alt={`${title} — photo ${lightbox + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-white/80">
            {lightbox + 1} / {filtered.length}
          </p>
        </div>
      )}
    </>
  );
}
