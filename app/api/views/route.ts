import { NextResponse } from "next/server";
import { z } from "zod";
import { recordUniqueContentView } from "@/lib/content-views";
import {
  VIEWER_COOKIE_MAX_AGE,
  VIEWER_COOKIE_NAME,
  buildVisitorKey,
  getClientIp,
  hashVisitorFingerprint,
  isBotUserAgent,
} from "@/lib/visitor-key";
import type { ViewContentType } from "@/models/ContentView";

export const runtime = "nodejs";

const bodySchema = z.object({
  contentType: z.enum(["article", "video", "live"]),
  contentId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const userAgent = req.headers.get("user-agent") || "";
    if (isBotUserAgent(userAgent)) {
      return NextResponse.json({ counted: false, viewCount: 0 });
    }

    const cookieHeader = req.headers.get("cookie") || "";
    const cookieMatch = cookieHeader.match(
      new RegExp(`(?:^|;\\s*)${VIEWER_COOKIE_NAME}=([^;]+)`)
    );
    const cookieId = cookieMatch?.[1] ? decodeURIComponent(cookieMatch[1]) : undefined;

    const ip = getClientIp(req.headers);
    const { visitorKey, newCookieId } = buildVisitorKey(cookieId, ip, userAgent);

    const { contentType, contentId } = parsed.data;
    const ipHash = ip.trim()
      ? hashVisitorFingerprint(ip.trim(), userAgent)
      : undefined;

    const result = await recordUniqueContentView(
      contentType as ViewContentType,
      contentId,
      visitorKey,
      ipHash
    );

    const res = NextResponse.json(result);

    if (newCookieId) {
      res.cookies.set(VIEWER_COOKIE_NAME, newCookieId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: VIEWER_COOKIE_MAX_AGE,
        path: "/",
      });
    }

    return res;
  } catch (err) {
    console.error("View recording error:", err);
    return NextResponse.json({ error: "Could not record view" }, { status: 500 });
  }
}
