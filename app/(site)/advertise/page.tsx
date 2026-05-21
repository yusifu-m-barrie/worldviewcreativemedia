import { buildMetadata } from "@/lib/seo";
import { getServerTranslations } from "@/lib/i18n/server";
import { getSiteSettings } from "@/services/settings.service";
import { siteConfig } from "@/config/site";

export const metadata = buildMetadata({
  title: "Advertise",
  description: `Advertise with ${siteConfig.name} — reach audiences across Sierra Leone and West Africa.`,
  path: "/advertise",
});

export default async function AdvertisePage() {
  const { t } = await getServerTranslations();
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-6">
      <h1 className="text-3xl font-bold text-foreground">{t("footer.advertise")}</h1>
      <div className="prose-article mt-8 space-y-4 text-foreground-muted">
        <p>
          Partner with {siteConfig.name} to reach engaged audiences through display advertising, sponsored content,
          and live event coverage.
        </p>
        <p>
          Email us at{" "}
          <a href={`mailto:${settings.contactEmail}`} className="text-[#E8872A] hover:underline">
            {settings.contactEmail}
          </a>{" "}
          with your campaign goals and budget.
        </p>
      </div>
    </div>
  );
}
