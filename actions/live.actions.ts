"use server";

import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB, isDbConfigured } from "@/lib/db";
import type { LivePlatform } from "@/lib/live-embed";
import { publishLiveStreamAsVideo } from "@/lib/live-to-video";
import { canAccessPermission } from "@/lib/permissions";
import type { AdminPermissions } from "@/lib/admin-permissions";
import { LiveStream } from "@/models/LiveStream";
import type { Role } from "@/config/roles";

const liveSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  platform: z.enum(["facebook", "youtube", "tiktok", "custom"]),
  facebookVideoUrl: z.string().optional(),
  youtubeEmbedUrl: z.string().optional(),
  tiktokVideoUrl: z.string().optional(),
  customEmbedUrl: z.string().optional(),
  isLive: z.coerce.boolean(),
  scheduledAt: z.string().optional(),
  replayUrl: z.string().optional(),
});

async function requireLiveAdmin() {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  const perms = session?.user?.permissions as AdminPermissions | undefined;
  if (!session?.user?.id || !canAccessPermission(role, perms, "liveTv")) {
    return { error: "You do not have permission to manage live TV." as const, session: null };
  }
  if (!isDbConfigured()) {
    return { error: "Database not configured" as const, session: null };
  }
  return { error: null, session };
}

async function finishBroadcastAndPublish(streamId: string, authorId: string) {
  const publish = await publishLiveStreamAsVideo(streamId, authorId);
  revalidatePath("/");
  revalidatePath("/live-tv");
  revalidatePath("/videos");
  revalidatePath("/admin/live");
  revalidatePath("/admin/videos");
  return publish;
}

/** End all other live streams, then save current broadcast */
export async function saveLiveBroadcast(formData: FormData) {
  const check = await requireLiveAdmin();
  if (check.error) return { error: check.error };

  const parsed = liveSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    thumbnail: formData.get("thumbnail") || undefined,
    platform: formData.get("platform") || "facebook",
    facebookVideoUrl: formData.get("facebookVideoUrl") || undefined,
    youtubeEmbedUrl: formData.get("youtubeEmbedUrl") || undefined,
    tiktokVideoUrl: formData.get("tiktokVideoUrl") || undefined,
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

  let wasLive = false;
  if (streamId) {
    const prev = await LiveStream.findById(streamId).select("isLive").lean();
    wasLive = Boolean(prev?.isLive);
  }

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
    tiktokVideoUrl: data.tiktokVideoUrl,
    customEmbedUrl: data.customEmbedUrl,
    isLive: data.isLive,
    scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
    replayUrl: data.replayUrl,
    endedAt: data.isLive ? undefined : new Date(),
  };

  let savedId = streamId;
  if (streamId) {
    await LiveStream.findByIdAndUpdate(streamId, payload);
  } else {
    const existing = await LiveStream.findOne({ slug });
    if (existing) {
      await LiveStream.findByIdAndUpdate(existing._id, payload);
      savedId = String(existing._id);
    } else {
      const created = await LiveStream.create(payload);
      savedId = String(created._id);
    }
  }

  let publishResult = null;
  const justEnded = !data.isLive && (wasLive || streamId);
  if (justEnded && savedId && check.session?.user?.id) {
    publishResult = await finishBroadcastAndPublish(savedId, check.session.user.id);
  } else {
    revalidatePath("/");
    revalidatePath("/live-tv");
    revalidatePath("/admin/live");
  }

  return {
    success: true,
    videoSlug: publishResult?.videoSlug,
    videoPublished: publishResult?.created ?? false,
    publishMessage: publishResult?.message,
  };
}

export async function endLiveBroadcast(streamId: string) {
  const check = await requireLiveAdmin();
  if (check.error) return { error: check.error };

  await connectDB();
  await LiveStream.findByIdAndUpdate(streamId, {
    isLive: false,
    endedAt: new Date(),
  });

  const publish = check.session?.user?.id
    ? await finishBroadcastAndPublish(streamId, check.session.user.id)
    : { created: false };

  return {
    success: true,
    videoSlug: publish.videoSlug,
    videoPublished: publish.created,
    publishMessage: publish.message,
  };
}

export async function deleteLiveStream(id: string) {
  const check = await requireLiveAdmin();
  if (check.error) return { error: check.error };

  await connectDB();
  await LiveStream.findByIdAndDelete(id);
  revalidatePath("/admin/live");
  return { success: true };
}
