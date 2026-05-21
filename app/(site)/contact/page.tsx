import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { getServerTranslations } from "@/lib/i18n/server";
import { siteConfig } from "@/config/site";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return {
    title: `${t("legal.contactTitle")} | ${siteConfig.name}`,
    description: t("legal.contactTitle"),
  };
}

export default async function ContactPage() {
  const { t } = await getServerTranslations();

  return (
    <LegalPage titleKey="legal.contactTitle">
      <p>{t("legal.contactIntro")}</p>
      <p>
        {t("legal.contactAdvertise")}{" "}
        <Link href="/advertise" className="text-[#E8872A] hover:underline">
          {t("footer.advertise")}
        </Link>
        .
      </p>
    </LegalPage>
  );
}
