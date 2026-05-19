"use server";

import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB, isDbConfigured } from "@/lib/db";
import type { LivePlatform } from "@/lib/live-embed";
import { ADMIN_ROLES } from "@/config/roles";
import { LiveStream } from "@/models/LiveStream";
import type { Role } from "@/config/roles";

const liveSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  platform: z.enum(["facebook", "youtube", "custom"]),
  facebookVideoUrl: z.string().optional(),
  youtubeEmbedUrl: z.string().optional(),
  customEmbedUrl: z.string().optional(),
  isLive: z.coerce.boolean(),
  scheduledAt: z.string().optional(),
  replayUrl: z.string().optional(),
});

async function requireAdmin() {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  if (!session?.user?.id || !role || !ADMIN_ROLES.includes(role)) {
    return { error: "Unauthorized" as const };
  }
  if (!isDbConfigured()) {
    return { error: "Database not configured" as const };
  }
  return { error: null };
}

/** End all other live streams, then save current broadcast */
export async function saveLiveBroadcast(formData: FormData) {
  const check = await requireAdmin();
  if (check.error) return { error: check.error };

  const parsed = liveSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    thumbnail: formData.get("thumbnail") || undefined,
    platform: formData.get("platform") || "facebook",
    facebookVideoUrl: formData.get("facebookVideoUrl") || undefined,
    youtubeEmbedUrl: formData.get("youtubeEmbedUrl") || undefined,
    customEmbedUrl: formData.get("customEmbedUrl") || undefined,
    isLive: formData.get("isLive") === "on" || formData.get("isLive") === "true",
    scheduledAt: formData.get("scheduledAt") || undefined,
    replayUrl: formData.get("replayUrl") || undefined,
  });

  if (!parsed.success) return { error: "Invalid form data" };

  const data = parsed.data;
  await connectDB();

  const streamId = formData.get("streamId") as string | null;
  const slug = slugify(data.title, { lower: true, strict: true });

  if (data.isLive) {
    await LiveStream.updateMany(
      { isLive: true, ...(streamId ? { _id: { $ne: streamId } } : {}) },
      { isLive: false, endedAt: new Date() }
    );
  }

  const payload = {
    title: data.title,
    slug,
    description: data.description,
    thumbnail: data.thumbnail,
    platform: data.platform as LivePlatform,
    facebookVideoUrl: data.facebookVideoUrl,
    youtubeEmbedUrl: data.youtubeEmbedUrl,
    customEmbedUrl: data.customEmbedUrl,
    isLive: data.isLive,
    scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
    replayUrl: data.replayUrl,
    endedAt: data.isLive ? undefined : new Date(),
  };

  if (streamId) {
    await LiveStream.findByIdAndUpdate(streamId, payload);
  } else {
    const existing = await LiveStream.findOne({ slug });
    if (existing) {
      await LiveStream.findByIdAndUpdate(existing._id, payload);
    } else {
      await LiveStream.create(payload);
    }
  }

  revalidatePath("/");
  revalidatePath("/live-tv");
  revalidatePath("/admin/live");
  return { success: true };
}

export async function endLiveBroadcast(streamId: string) {
  const check = await requireAdmin();
  if (check.error) return { error: check.error };

  await connectDB();
  await LiveStream.findByIdAndUpdate(streamId, {
    isLive: false,
    endedAt: new Date(),
  });

  revalidatePath("/");
  revalidatePath("/live-tv");
  revalidatePath("/admin/live");
  return { success: true };
}

export async function deleteLiveStream(id: string) {
  const check = await requireAdmin();
  if (check.error) return { error: check.error };

  await connectDB();
  await LiveStream.findByIdAndDelete(id);
  revalidatePath("/admin/live");
  return { success: true };
}
