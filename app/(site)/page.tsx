import { HeroSection } from "@/components/home/hero-section";
import { FeaturedSlider } from "@/components/home/featured-slider";
import { SectionHeading } from "@/components/home/section-heading";
import { NewsletterForm } from "@/components/home/newsletter-form";
import { LiveTVSection } from "@/components/home/live-tv-section";
import { CategoriesGrid } from "@/components/home/categories-grid";
import { VideoHighlights } from "@/components/home/video-highlights";
import { LatestStoriesSection } from "@/components/home/latest-stories-section";
import { TrendingNowSidebar } from "@/components/home/trending-now-sidebar";
import { getPublishedArticles } from "@/services/article.service";
import { getPublishedVideos } from "@/services/video.service";
import { getCurrentLiveStream } from "@/services/livestream.service";
import { getActiveCategories, getCategoriesWithCounts } from "@/services/category.service";

export default async function HomePage() {
  const [featured, latest, videos, liveStream, categories, categoriesWithCounts] =
    await Promise.all([
      getPublishedArticles({ featured: true, limit: 8 }),
      getPublishedArticles({ limit: 12 }),
      getPublishedVideos({ limit: 3 }),
      getCurrentLiveStream(),
      getActiveCategories(),
      getCategoriesWithCounts(),
    ]);

  const heroFeatured = featured.data[0];
  const sliderArticles = featured.data.length ? featured.data : latest.data.slice(0, 3);
  const trendingFeatured = featured.data.filter((a) => a.isFeatured);

  return (
    <>
      <HeroSection featured={heroFeatured} />

      {/* Latest Stories + Trending — directly under hero */}
      <section className="border-b border-border bg-background py-10 lg:py-14">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-3 lg:gap-12 lg:px-6">
          <div className="lg:col-span-2">
            <LatestStoriesSection articles={latest.data} categories={categories} />
          </div>
          <div className="lg:col-span-1">
            <TrendingNowSidebar
              articles={trendingFeatured.length > 0 ? trendingFeatured : featured.data}
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-12 lg:px-6">
        <section>
          <SectionHeading title="Featured Stories" href="/news" />
          <FeaturedSlider articles={sliderArticles} />
        </section>

        <LiveTVSection stream={liveStream} />

        <section>
          <SectionHeading title="Browse Categories" href="/categories" />
          <CategoriesGrid categories={categoriesWithCounts} />
        </section>

        <section>
          <SectionHeading title="Video Highlights" href="/videos" />
          <VideoHighlights videos={videos.data} />
        </section>

        <section className="rounded-2xl bg-[#2E2A86] p-8 text-white lg:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold lg:text-3xl">Get WorldView in your inbox</h2>
            <p className="mt-2 text-white/70">
              Daily headlines, live TV alerts, and exclusive video journalism delivered to you.
            </p>
            <div className="mt-6">
              <NewsletterForm />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
