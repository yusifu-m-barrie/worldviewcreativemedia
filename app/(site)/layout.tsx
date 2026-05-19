import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BreakingTicker } from "@/components/layout/breaking-ticker";
import { getAnalyticsMeasurementId } from "@/lib/analytics";
import { demoBreakingHeadlines } from "@/lib/demo-data";
import { getPublishedArticles } from "@/services/article.service";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const gaId = await getAnalyticsMeasurementId();
  let headlines = demoBreakingHeadlines;
  try {
    const breaking = await getPublishedArticles({ breaking: true, limit: 5 });
    if (breaking.data.length) {
      headlines = breaking.data.map((a) => a.title);
    }
  } catch {
    /* use demo headlines */
  }

  return (
    <>
      {gaId ? <GoogleAnalytics measurementId={gaId} /> : null}
      <Header />
      <BreakingTicker headlines={headlines} />
      <main className="min-h-[60vh] flex-1 bg-background text-foreground">{children}</main>
      <Footer />
    </>
  );
}
