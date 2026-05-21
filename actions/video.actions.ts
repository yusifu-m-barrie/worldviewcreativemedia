"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB, isDbConfigured } from "@/lib/db";
import { canAccessPermission } from "@/lib/permissions";
import { requireSuperAdmin } from "@/lib/require-super-admin";
import type { AdminPermissions } from "@/lib/admin-permissions";
import { MAX_VIDEO_DURATION_SEC } from "@/lib/cloudinary-video";
import { Video } from "@/models/Video";
import { Category } from "@/models/Category";
import type { Role } from "@/config/roles";

const videoSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  videoUrl: z.string().optional(),
  embedUrl: z.string().optional(),
  cloudinaryPublicId: z.string().optional(),
  categorySlug: z.string().optional(),
  duration: z.coerce.number().optional(),
  status: z.enum(["draft", "published"]),
  isFeatured: z.coerce.boolean().optional(),
});

async function requireAdmin() {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  const perms = session?.user?.permissions as AdminPermissions | undefined;
  if (!session?.user?.id || !canAccessPermission(role, perms, "videos")) {
    return { error: "You do not have permission to manage videos." as const, session: null };
  }
  if (!isDbConfigured()) {
    return { error: "Database not configured" as const, session: null };
  }
  return { error: null, session };
}

export async function createVideo(formData: FormData) {
  const check = await requireAdmin();
  if (check.error) return { error: check.error };

  const parsed = videoSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    thumbnail: formData.get("thumbnail") || undefined,
    videoUrl: formData.get("videoUrl") || undefined,
    embedUrl: formData.get("embedUrl") || undefined,
    cloudinaryPublicId: formData.get("cloudinaryPublicId") || undefined,
    categorySlug: formData.get("categorySlug") || undefined,
    duration: formData.get("duration") || undefined,
    status: formData.get("status") || "draft",
    isFeatured: formData.get("isFeatured") === "on",
  });

  if (!parsed.success) return { error: "Invalid form data" };

  const data = parsed.data;

  if (data.duration && data.duration > MAX_VIDEO_DURATION_SEC) {
    return { error: "Video duration cannot exceed 15 minutes" };
  }

  if (!data.videoUrl && !data.embedUrl) {
    return { error: "Upload a video or provide an embed URL" };
  }
  await connectDB();

  let categoryId;
  if (data.categorySlug) {
    const cat = await Category.findOne({ slug: data.categorySlug });
    categoryId = cat?._id;
  }

  const slug = slugify(data.title, { lower: true, strict: true });
  const existing = await Video.findOne({ slug });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  await Video.create({
    title: data.title,
    slug: finalSlug,
    description: data.description,
    thumbnail: data.thumbnail,
    videoUrl: data.videoUrl,
    embedUrl: data.embedUrl,
    cloudinaryPublicId: data.cloudinaryPublicId,
    category: categoryId,
    duration: data.duration,
    status: data.status,
    isFeatured: data.isFeatured ?? false,
    publishedAt: data.status === "published" ? new Date() : undefined,
    author: check.session!.user.id,
  });

  revalidatePath("/videos");
  revalidatePath("/");
  revalidatePath("/admin/videos");
  redirect("/admin/videos?created=1");
}

export async function deleteVideo(id: string) {
  const check = await requireSuperAdmin();
  if (check.error) return { error: check.error };

  await connectDB();
  const video = await Video.findById(id).lean();
  if (!video) return { error: "Video not found" };

  await Video.findByIdAndDelete(id);
  revalidatePath("/videos");
  revalidatePath("/");
  revalidatePath("/admin/videos");
  if (video.slug) revalidatePath(`/videos/${video.slug}`);
  return { success: true };
}
