import { getSiteSettings } from "@/services/settings.service";

/** GA4 (G-XXXXXXXX) or Universal Analytics (UA-XXXXXXXX-X) */
const GA_ID_PATTERN = /^(G-[A-Z0-9]+|UA-\d+-\d+)$/i;

export function isValidGaMeasurementId(id: string): boolean {
  return GA_ID_PATTERN.test(id.trim());
}

export function normalizeGaMeasurementId(id?: string | null): string | null {
  if (!id) return null;
  const trimmed = id.trim();
  if (!trimmed) return null;
  return isValidGaMeasurementId(trimmed) ? trimmed : null;
}

/**
 * Env var wins on Vercel; otherwise Admin → Settings → Google Analytics ID in MongoDB.
 */
export async function getAnalyticsMeasurementId(): Promise<string | null> {
  const fromEnv = normalizeGaMeasurementId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
  if (fromEnv) return fromEnv;

  try {
    const settings = await getSiteSettings();
    return normalizeGaMeasurementId(settings.analytics?.googleAnalyticsId);
  } catch {
    return null;
  }
}
