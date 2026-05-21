import { connectDB, isDbConfigured, tryConnectDB } from "@/lib/db";
import {
  ABOUT_SETTINGS_KEY,
  defaultAboutPage,
  type AboutPageValue,
} from "@/lib/about-defaults";
import type { Locale } from "@/lib/i18n/config";
import { localizeAboutPage } from "@/lib/i18n/localize";
import { SiteSettings } from "@/models/SiteSettings";

export async function getAboutPage(locale: Locale = "en"): Promise<AboutPageValue> {
  let base = defaultAboutPage;

  if (isDbConfigured() && (await tryConnectDB())) {
    const doc = await SiteSettings.findOne({ key: ABOUT_SETTINGS_KEY }).lean();
    if (doc?.value) {
      const stored = doc.value as Partial<AboutPageValue>;
      base = {
        ...defaultAboutPage,
        ...stored,
        teamMembers: Array.isArray(stored.teamMembers)
          ? stored.teamMembers.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          : [],
      };
    }
  }

  return localizeAboutPage(base, locale);
}

export async function saveAboutPage(value: AboutPageValue): Promise<void> {
  await connectDB();
  await SiteSettings.findOneAndUpdate(
    { key: ABOUT_SETTINGS_KEY },
    { key: ABOUT_SETTINGS_KEY, value },
    { upsert: true, returnDocument: "after" }
  );
}
