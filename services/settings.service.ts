import { connectDB, isDbConfigured, tryConnectDB } from "@/lib/db";
import {
  defaultSiteSettings,
  SETTINGS_KEY,
  type SiteSettingsValue,
} from "@/lib/settings-defaults";
import { SiteSettings } from "@/models/SiteSettings";

export async function getSiteSettings(): Promise<SiteSettingsValue> {
  if (!isDbConfigured()) return defaultSiteSettings;

  if (!(await tryConnectDB())) return defaultSiteSettings;

  const doc = await SiteSettings.findOne({ key: SETTINGS_KEY }).lean();
  if (!doc?.value) return defaultSiteSettings;

  const stored = doc.value as unknown as Partial<SiteSettingsValue>;

  return {
    ...defaultSiteSettings,
    ...stored,
    social: {
      ...defaultSiteSettings.social,
      ...(stored.social || {}),
    },
    live: {
      ...defaultSiteSettings.live,
      ...(stored.live || {}),
    },
    analytics: {
      ...defaultSiteSettings.analytics,
      ...(stored.analytics || {}),
    },
  };
}

export async function saveSiteSettings(value: SiteSettingsValue): Promise<void> {
  await connectDB();
  await SiteSettings.findOneAndUpdate(
    { key: SETTINGS_KEY },
    { key: SETTINGS_KEY, value },
    { upsert: true, new: true }
  );
}
