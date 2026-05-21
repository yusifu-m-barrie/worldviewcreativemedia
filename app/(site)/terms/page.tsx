import { LegalPage } from "@/components/legal/legal-page";
import { getServerTranslations } from "@/lib/i18n/server";
import { siteConfig } from "@/config/site";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return {
    title: `${t("legal.termsTitle")} | ${siteConfig.name}`,
    description: t("legal.termsTitle"),
  };
}

export default async function TermsPage() {
  const { t } = await getServerTranslations();

  return (
    <LegalPage titleKey="legal.termsTitle">
      <p>{t("legal.termsIntro")}</p>
      <h2 className="text-xl font-bold text-foreground">{t("legal.termsContentTitle")}</h2>
      <p>{t("legal.termsContent")}</p>
      <h2 className="text-xl font-bold text-foreground">{t("legal.termsAdsTitle")}</h2>
      <p>{t("legal.termsAds")}</p>
    </LegalPage>
  );
}
