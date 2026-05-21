import { LegalPage } from "@/components/legal/legal-page";
import { getServerTranslations } from "@/lib/i18n/server";
import { siteConfig } from "@/config/site";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return {
    title: `${t("legal.privacyTitle")} | ${siteConfig.name}`,
    description: t("legal.privacyTitle"),
  };
}

export default async function PrivacyPage() {
  const { t } = await getServerTranslations();

  return (
    <LegalPage titleKey="legal.privacyTitle">
      <p>{t("legal.privacyIntro")}</p>
      <h2 className="text-xl font-bold text-foreground">{t("legal.privacyCookiesTitle")}</h2>
      <p>{t("legal.privacyCookies")}</p>
      <h2 className="text-xl font-bold text-foreground">{t("legal.privacyDataTitle")}</h2>
      <p>{t("legal.privacyData")}</p>
      <h2 className="text-xl font-bold text-foreground">{t("legal.privacyThirdTitle")}</h2>
      <p>{t("legal.privacyThird")}</p>
    </LegalPage>
  );
}
