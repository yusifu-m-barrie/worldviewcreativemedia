import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import {
  MAX_VIDEO_DURATION_SEC,
  MAX_VIDEO_FILE_BYTES,
  getVideoThumbnailUrl,
  getOptimizedVideoPlaybackUrl,
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
    return NextResponse.json(
      { error: "Cloudinary is not configured. Add CLOUDINARY_* to .env.local" },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "worldview/videos";
    const clientDuration = Number(formData.get("duration") || 0);

    if (!file) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("video/")) {
      return NextResponse.json({ error: "File must be a video" }, { status: 400 });
    }

    if (file.size > MAX_VIDEO_FILE_BYTES) {
      return NextResponse.json(
        {
          error: `Video is too large (max ${Math.round(MAX_VIDEO_FILE_BYTES / 1024 / 1024)}MB). Compress or shorten to 5 minutes.`,
        },
        { status: 400 }
      );
    }

    if (clientDuration > MAX_VIDEO_DURATION_SEC) {
      return NextResponse.json(
        { error: "Video must be 5 minutes or shorter" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{
      secure_url: string;
      public_id: string;
      duration?: number;
      width?: number;
      height?: number;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder,
          timeout: 300000,
          eager: [{ streaming_profile: "hd", format: "mp4" }],
          eager_async: true,
        },
        (err, res) => {
          if (err) reject(err);
          else if (res) resolve(res);
          else reject(new Error("Upload failed"));
        }
      );
      stream.end(buffer);
    });

    const duration = result.duration ?? clientDuration;
    if (duration > MAX_VIDEO_DURATION_SEC) {
      try {
        await cloudinary.uploader.destroy(result.public_id, { resource_type: "video" });
      } catch {
        /* ignore cleanup errors */
      }
      return NextResponse.json(
        { error: "Uploaded video exceeds 5 minutes. Please upload a shorter clip." },
        { status: 400 }
      );
    }

    const publicId = result.public_id;
    const playbackUrl = getOptimizedVideoPlaybackUrl(publicId);

    return NextResponse.json({
      url: playbackUrl || result.secure_url,
      rawUrl: result.secure_url,
      publicId,
      duration: Math.round(duration),
      thumbnail: getVideoThumbnailUrl(publicId),
      width: result.width,
      height: result.height,
      resourceType: "video",
    });
  } catch (err) {
    console.error("Video upload error:", err);
    const message = err instanceof Error ? err.message : "Video upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
