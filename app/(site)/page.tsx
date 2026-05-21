import { HeroSection } from "@/components/home/hero-section";
import { FeaturedSlider } from "@/components/home/featured-slider";
import { SectionHeading } from "@/components/home/section-heading";
import { NewsletterForm } from "@/components/home/newsletter-form";
import { LiveTVSection } from "@/components/home/live-tv-section";
import { CategoriesGrid } from "@/components/home/categories-grid";
import { VideoHighlights } from "@/components/home/video-highlights";
import { LatestStoriesSection } from "@/components/home/latest-stories-section";
import { TrendingNowSidebar } from "@/components/home/trending-now-sidebar";
import { AdSlotServer } from "@/components/ads/ad-slot-server";
import { getServerTranslations } from "@/lib/i18n/server";
import { getPublishedArticles } from "@/services/article.service";
import { getPublishedVideos } from "@/services/video.service";
import { getCurrentLiveStream } from "@/services/livestream.service";
import { getActiveCategories, getCategoriesWithCounts } from "@/services/category.service";

export default async function HomePage() {
  const { t, locale } = await getServerTranslations();
  const [featured, latest, videos, liveStream, categories, categoriesWithCounts] =
    await Promise.all([
      getPublishedArticles({ featured: true, limit: 8, locale }),
      getPublishedArticles({ limit: 12, locale }),
      getPublishedVideos({ limit: 3, locale }),
      getCurrentLiveStream(locale),
      getActiveCategories(locale),
      getCategoriesWithCounts(locale),
    ]);

  const heroFeatured = featured.data[0];
  const sliderArticles = featured.data.length ? featured.data : latest.data.slice(0, 3);
  const trendingFeatured = featured.data.filter((a) => a.isFeatured);

  return (
    <>
      <HeroSection featured={heroFeatured} />
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <AdSlotServer slotKey="homepageHero" format="horizontal" minHeight={90} className="py-4" />
      </div>

      <section className="border-b border-border bg-background py-10 lg:py-14">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-3 lg:gap-12 lg:px-6">
          <div className="lg:col-span-2">
            <LatestStoriesSection articles={latest.data} categories={categories} />
          </div>
          <div className="space-y-6 lg:col-span-1">
            <TrendingNowSidebar
              articles={trendingFeatured.length > 0 ? trendingFeatured : featured.data}
            />
            <AdSlotServer slotKey="homepageSidebar" format="rectangle" minHeight={250} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-12 lg:px-6">
        <section>
          <SectionHeading title={t("home.featuredStories")} href="/news" linkLabel={t("common.viewAll")} />
          <FeaturedSlider articles={sliderArticles} />
        </section>

        <LiveTVSection
          stream={liveStream}
          labels={{
            badge: t("nav.liveTv"),
            subtitle: t("home.liveTvSubtitle"),
            cta: t("home.fullLiveTv"),
          }}
        />

        <AdSlotServer slotKey="homepageMid" format="auto" minHeight={90} />

        <section>
          <SectionHeading title={t("home.browseCategories")} href="/categories" linkLabel={t("common.viewAll")} />
          <CategoriesGrid categories={categoriesWithCounts} articlesLabel={t("categories.articles")} />
        </section>

        <section>
          <SectionHeading title={t("home.videoHighlights")} href="/videos" linkLabel={t("common.viewAll")} />
          <VideoHighlights videos={videos.data} />
        </section>

        <section className="rounded-2xl bg-[#2E2A86] p-8 text-white lg:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold lg:text-3xl">{t("home.newsletterTitle")}</h2>
            <p className="mt-2 text-white/70">{t("home.newsletterSubtitle")}</p>
            <div className="mt-6">
              <NewsletterForm />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
