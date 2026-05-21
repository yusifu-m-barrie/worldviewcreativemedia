import { getServerTranslations } from "@/lib/i18n/server";
import { getSiteSettings } from "@/services/settings.service";
import { siteConfig } from "@/config/site";

interface LegalPageProps {
  titleKey: "legal.privacyTitle" | "legal.termsTitle" | "legal.contactTitle";
  children: React.ReactNode;
}

export async function LegalPage({ titleKey, children }: LegalPageProps) {
  const { t } = await getServerTranslations();
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-6">
      <h1 className="text-3xl font-bold text-foreground">{t(titleKey)}</h1>
      <p className="mt-2 text-sm text-foreground-muted">
        {t("legal.lastUpdated", { date: "May 2026" })}
      </p>
      <div className="prose-article mt-8 space-y-4 text-foreground-muted">{children}</div>
      {titleKey === "legal.contactTitle" && (
        <ul className="mt-8 space-y-2 text-foreground">
          <li>
            <strong>Email:</strong>{" "}
            <a href={`mailto:${settings.contactEmail}`} className="text-[#E8872A] hover:underline">
              {settings.contactEmail}
            </a>
          </li>
          {settings.contactPhone ? (
            <li>
              <strong>Phone:</strong> {settings.contactPhone}
            </li>
          ) : null}
          {settings.contactAddress ? (
            <li>
              <strong>Address:</strong> {settings.contactAddress}
            </li>
          ) : null}
          <li>
            <strong>Website:</strong> {siteConfig.url}
          </li>
        </ul>
      )}
    </div>
  );
}
