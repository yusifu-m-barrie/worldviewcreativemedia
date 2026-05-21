import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { GoogleAdsense } from "@/components/ads/google-adsense";
import { Header } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/site-footer";
import { BreakingTicker } from "@/components/layout/breaking-ticker";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { getAnalyticsMeasurementId } from "@/lib/analytics";
import { getAdsenseConfig } from "@/lib/adsense";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/server";
import { demoArticles } from "@/lib/demo-data";
import { getPublishedArticles } from "@/services/article.service";
import { localizeArticleCard } from "@/lib/i18n/localize";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [gaId, locale, adsense] = await Promise.all([
    getAnalyticsMeasurementId(),
    getLocale(),
    getAdsenseConfig(),
  ]);
  const messages = getDictionary(locale);

  let headlines = demoArticles
    .filter((a) => a.isBreaking)
    .map((a) => localizeArticleCard(a, locale).title);
  try {
    const breaking = await getPublishedArticles({ breaking: true, limit: 5, locale });
    if (breaking.data.length) {
      headlines = breaking.data.map((a) => a.title);
    }
  } catch {
    /* keep localized demo headlines */
  }

  return (
    <LocaleProvider locale={locale} messages={messages}>
      {gaId ? <GoogleAnalytics measurementId={gaId} /> : null}
      {adsense.enabled && adsense.clientId ? (
        <GoogleAdsense clientId={adsense.clientId} />
      ) : null}
      <Header />
      <BreakingTicker headlines={headlines} />
      <main className="min-h-[60vh] flex-1 bg-background text-foreground">{children}</main>
      <SiteFooter />
    </LocaleProvider>
  );
}
