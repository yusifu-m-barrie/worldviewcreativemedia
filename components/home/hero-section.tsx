"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import type { ArticleCard } from "@/types";

const HERO_SLIDES = [
  { src: "/team1.jpeg", alt: "WorldView Creative Media team" },
  { src: "/team2.jpeg", alt: "WorldView Creative Media broadcast" },
] as const;

interface HeroSectionProps {
  featured?: ArticleCard;
}

export function HeroSection({ featured }: HeroSectionProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  function goTo(next: number) {
    setIndex((next + HERO_SLIDES.length) % HERO_SLIDES.length);
  }

  return (
    <section className="relative overflow-hidden bg-[#2E2A86] text-white">
      {/* Background slideshow */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={HERO_SLIDES[index].src}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <Image
              src={HERO_SLIDES[index].src}
              alt={HERO_SLIDES[index].alt}
              fill
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              className="object-cover object-center"
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-[#2E2A86]/95 via-[#2E2A86]/80 to-[#2E2A86]/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2E2A86] via-transparent to-transparent opacity-90" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-10 lg:px-6 lg:py-14">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Copy + logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 inline-block rounded-xl bg-white px-4 py-3 shadow-lg ring-1 ring-white/20">
              <Image
                src={siteConfig.logo}
                alt={siteConfig.name}
                width={280}
                height={80}
                className="h-14 w-auto object-contain sm:h-16 lg:h-[4.5rem]"
                priority
                loading="eager"
                fetchPriority="high"
              />
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-[#E8872A] px-4 py-1 text-xs font-bold uppercase">
              <Radio className="h-3 w-3 animate-pulse" />
              West Africa&apos;s Premier Media
            </span>

            <h1 className="mt-4 font-serif text-3xl font-extrabold leading-tight lg:text-5xl">
              Breaking news, live TV &amp; video journalism
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/85 lg:text-lg">
              Sierra Leone and West Africa — trusted coverage from WorldView Creative Media.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild variant="orange" size="lg">
                <Link href="/live-tv">
                  <Play className="h-4 w-4" />
                  Watch Live
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10"
              >
                <Link href="/news">Latest News</Link>
              </Button>
            </div>

            {featured && (
              <p className="mt-8 border-t border-white/20 pt-6 text-sm text-white/75">
                Top story:{" "}
                <Link
                  href={`/news/${featured.slug}`}
                  className="font-semibold text-[#E8872A] hover:underline"
                >
                  {featured.title}
                </Link>
              </p>
            )}
          </motion.div>

          {/* Slide preview + controls */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border-4 border-white/20 shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={HERO_SLIDES[index].src}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={HERO_SLIDES[index].src}
                    alt={HERO_SLIDES[index].alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 560px"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur hover:bg-black/60"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur hover:bg-black/60"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {HERO_SLIDES.map((slide, i) => (
                <button
                  key={slide.src}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === index ? "w-8 bg-[#E8872A]" : "w-2 bg-white/50 hover:bg-white/80"
                  )}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Mobile slide dots */}
        <div className="mt-6 flex justify-center gap-2 lg:hidden">
          {HERO_SLIDES.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-2 rounded-full transition-all",
                i === index ? "w-8 bg-[#E8872A]" : "w-2 bg-white/50"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
