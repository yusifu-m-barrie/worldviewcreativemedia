import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCloudinaryApiSecret, isCloudinaryConfigured } from "@/lib/cloudinary";
import { signCloudinaryUploadParams } from "@/lib/cloudinary-sign";
import { VIDEO_CHUNK_SIZE_BYTES } from "@/lib/cloudinary-video";
import { ADMIN_ROLES } from "@/config/roles";
import { hasPermission, type AdminPermissions } from "@/lib/admin-permissions";
import type { Role } from "@/config/roles";

export const runtime = "nodejs";

/** Returns signed params so the browser uploads directly to Cloudinary (fast, no Vercel size limit). */
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

  const apiSecret = getCloudinaryApiSecret();
  if (!apiSecret) {
    return NextResponse.json({ error: "Cloudinary API secret is missing" }, { status: 503 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const folder = (body.folder as string) || "worldview/videos";
    const fileSize = Number(body.fileSize) || 0;
    const useChunks = fileSize > VIDEO_CHUNK_SIZE_BYTES;
    const timestamp = Math.round(Date.now() / 1000);

    // resource_type is in the URL (/video/upload), not in the signed body.
    const paramsToSign: Record<string, string | number> = {
      timestamp,
      folder,
    };
    if (useChunks) {
      paramsToSign.chunk_size = VIDEO_CHUNK_SIZE_BYTES;
    }

    const signature = signCloudinaryUploadParams(paramsToSign, apiSecret);

    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim() || null;

    return NextResponse.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY?.trim(),
      cloudName: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
      folder,
      chunkSize: VIDEO_CHUNK_SIZE_BYTES,
      useChunks,
      /** Prefer unsigned preset uploads when set — no signature required */
      uploadPreset,
    });
  } catch (err) {
    console.error("Video signature error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not prepare upload" },
      { status: 500 }
    );
  }
}
