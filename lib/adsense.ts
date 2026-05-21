import { getSiteSettings } from "@/services/settings.service";

const ADSENSE_CLIENT_PATTERN = /^ca-pub-\d+$/i;
const ADSENSE_SLOT_PATTERN = /^\d+$/;

export type AdSlotKey =
  | "homepageHero"
  | "homepageSidebar"
  | "homepageMid"
  | "articleMid"
  | "footer";

export function isValidAdsenseClientId(id: string): boolean {
  return ADSENSE_CLIENT_PATTERN.test(id.trim());
}

export function isValidAdsenseSlotId(id: string): boolean {
  return ADSENSE_SLOT_PATTERN.test(id.trim());
}

export async function getAdsenseConfig(): Promise<{
  clientId: string | null;
  enabled: boolean;
  slots: Partial<Record<AdSlotKey, string>>;
}> {
  const fromEnv = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim();
  const clientFromEnv = fromEnv && isValidAdsenseClientId(fromEnv) ? fromEnv : null;

  try {
    const settings = await getSiteSettings();
    const ads = settings.ads;
    const clientFromSettings =
      ads?.adsenseClientId && isValidAdsenseClientId(ads.adsenseClientId)
        ? ads.adsenseClientId
        : null;

    const clientId = clientFromEnv ?? clientFromSettings;
    const enabled = Boolean(clientId && ads?.enabled !== false);

    const slots: Partial<Record<AdSlotKey, string>> = {};
    const raw = ads?.slots ?? {};
    for (const key of Object.keys(raw) as AdSlotKey[]) {
      const slotId = raw[key];
      if (slotId && isValidAdsenseSlotId(slotId)) slots[key] = slotId;
    }

    return { clientId, enabled, slots };
  } catch {
    return { clientId: clientFromEnv, enabled: Boolean(clientFromEnv), slots: {} };
  }
}
