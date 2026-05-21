import crypto from "crypto";
import { cookies } from "next/headers";

export const VIEWER_COOKIE_NAME = "wv_visitor";
export const VIEWER_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createVisitorId(): string {
  return crypto.randomUUID();
}

export function isValidVisitorId(id: string): boolean {
  return UUID_RE.test(id);
}

/** Client IP from Vercel / proxy headers */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "";
}

/** One-way fingerprint from IP + browser — used when no visitor cookie yet */
export function hashVisitorFingerprint(ip: string, userAgent: string): string {
  const salt =
    process.env.VIEW_HASH_SALT?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    "worldview-view-salt";
  return crypto
    .createHash("sha256")
    .update(`${salt}|${ip}|${userAgent}`)
    .digest("hex");
}

/**
 * Stable visitor id for deduplication (one view per article/video/live per visitor).
 * Primary: long-lived cookie. Fallback: hashed IP + browser if cookies cannot be set.
 */
export function buildVisitorKey(cookieId: string | undefined, ip: string, userAgent: string): {
  visitorKey: string;
  newCookieId?: string;
} {
  if (cookieId && isValidVisitorId(cookieId)) {
    return { visitorKey: `c:${cookieId}` };
  }

  const newId = createVisitorId();
  return { visitorKey: `c:${newId}`, newCookieId: newId };
}

/** Server Components — read visitor cookie */
export async function getVisitorCookieId(): Promise<string | undefined> {
  const jar = await cookies();
  const value = jar.get(VIEWER_COOKIE_NAME)?.value;
  return value && isValidVisitorId(value) ? value : undefined;
}

/** Skip bots and preview crawlers */
export function isBotUserAgent(userAgent: string): boolean {
  return /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse/i.test(
    userAgent
  );
}
