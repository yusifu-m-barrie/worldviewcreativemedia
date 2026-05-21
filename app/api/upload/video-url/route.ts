import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import {
  MAX_VIDEO_DURATION_SEC,
  formatMaxVideoDuration,
  getOptimizedVideoPlaybackUrl,
  getVideoThumbnailUrl,
  isEmbedPlatformUrl,
  parseCloudinaryVideoUrl,
} from "@/lib/cloudinary-video";
import { ADMIN_ROLES } from "@/config/roles";
import { hasPermission, type AdminPermissions } from "@/lib/admin-permissions";
import type { Role } from "@/config/roles";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  const perms = session?.user?.permissions as AdminPermissions | undefined;
  if (!session?.user?.id || !role || !ADMIN_ROLES.includes(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(role, perms, "videos")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const sourceUrl = (body.url as string)?.trim();

    if (!sourceUrl) {
      return NextResponse.json({ error: "Video URL is required" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(sourceUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: "URL must start with http:// or https://" }, { status: 400 });
    }

    if (isEmbedPlatformUrl(sourceUrl)) {
      return NextResponse.json(
        {
          error:
            "YouTube and Facebook links should go in the “Embed URL” field below, not here.",
        },
        { status: 400 }
      );
    }

    const existingPublicId = parseCloudinaryVideoUrl(sourceUrl);
    if (existingPublicId) {
      return NextResponse.json({
        url: getOptimizedVideoPlaybackUrl(existingPublicId),
        publicId: existingPublicId,
        thumbnail: getVideoThumbnailUrl(existingPublicId),
        resourceType: "video",
      });
    }

    const result = await cloudinary.uploader.upload(sourceUrl, {
      resource_type: "video",
      folder: "worldview/videos",
      timeout: 600000,
    });

    const duration = result.duration ?? 0;
    if (duration > MAX_VIDEO_DURATION_SEC) {
      try {
        await cloudinary.uploader.destroy(result.public_id, { resource_type: "video" });
      } catch {
        /* ignore */
      }
      return NextResponse.json(
        { error: `Video at this URL is longer than ${formatMaxVideoDuration()}` },
        { status: 400 }
      );
    }

    const publicId = result.public_id;

    return NextResponse.json({
      url: getOptimizedVideoPlaybackUrl(publicId),
      rawUrl: result.secure_url,
      publicId,
      duration: Math.round(duration),
      thumbnail: getVideoThumbnailUrl(publicId),
      width: result.width,
      height: result.height,
      resourceType: "video",
    });
  } catch (err) {
    console.error("Video URL import error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not import video from URL" },
      { status: 500 }
    );
  }
}
