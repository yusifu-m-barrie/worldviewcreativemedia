import { connectDB, isDbConfigured, tryConnectDB } from "@/lib/db";
import {
  ABOUT_SETTINGS_KEY,
  defaultAboutPage,
  type AboutPageValue,
} from "@/lib/about-defaults";
import { SiteSettings } from "@/models/SiteSettings";

export async function getAboutPage(): Promise<AboutPageValue> {
  if (!isDbConfigured() || !(await tryConnectDB())) {
    return defaultAboutPage;
  }

  const doc = await SiteSettings.findOne({ key: ABOUT_SETTINGS_KEY }).lean();
  if (!doc?.value) return defaultAboutPage;

  const stored = doc.value as Partial<AboutPageValue>;
  return {
    ...defaultAboutPage,
    ...stored,
    teamMembers: Array.isArray(stored.teamMembers)
      ? stored.teamMembers.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      : [],
  };
}

export async function saveAboutPage(value: AboutPageValue): Promise<void> {
  await connectDB();
  await SiteSettings.findOneAndUpdate(
    { key: ABOUT_SETTINGS_KEY },
    { key: ABOUT_SETTINGS_KEY, value },
    { upsert: true, returnDocument: "after" }
  );
}
