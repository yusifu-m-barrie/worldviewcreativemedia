"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB, isDbConfigured } from "@/lib/db";
import { ADMIN_ROLES } from "@/config/roles";
import { Article } from "@/models/Article";
import { Category } from "@/models/Category";
import type { Role } from "@/config/roles";

const articleSchema = z.object({
  title: z.string().min(3),
  excerpt: z.string().min(10),
  content: z.string().min(20),
  categorySlug: z.string().min(1),
  featuredImage: z.string().optional(),
  galleryImages: z.array(z.string().min(1)).optional(),
  status: z.enum(["draft", "published"]),
  isBreaking: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  region: z.string().optional(),
});

export async function createArticle(formData: FormData) {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  if (!session?.user?.id || !role || !ADMIN_ROLES.includes(role)) {
    return { error: "Unauthorized" };
  }

  if (!isDbConfigured()) {
    return { error: "Database not configured. Set MONGODB_URI in .env.local" };
  }

  let galleryImages: string[] = [];
  const galleryRaw = formData.get("galleryImages");
  if (typeof galleryRaw === "string" && galleryRaw) {
    try {
      const parsedGallery = JSON.parse(galleryRaw) as unknown;
      if (Array.isArray(parsedGallery)) {
        galleryImages = parsedGallery.filter((u): u is string => typeof u === "string" && u.length > 0);
      }
    } catch {
      galleryImages = [];
    }
  }

  const parsed = articleSchema.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    categorySlug: formData.get("categorySlug"),
    featuredImage: formData.get("featuredImage") || undefined,
    galleryImages,
    status: formData.get("status") || "draft",
    isBreaking: formData.get("isBreaking") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    region: (formData.get("region") as string) || undefined,
  });

  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.flatten() };
  }

  const data = parsed.data;
  await connectDB();

  const category = await Category.findOne({ slug: data.categorySlug });
  if (!category) {
    return { error: "Category not found" };
  }

  const slug = slugify(data.title, { lower: true, strict: true });
  const existing = await Article.findOne({ slug });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  const article = await Article.create({
    title: data.title,
    slug: finalSlug,
    excerpt: data.excerpt,
    content: data.content,
    featuredImage: data.featuredImage,
    gallery: data.galleryImages ?? [],
    category: category._id,
    author: session.user.id,
    status: data.status,
    isBreaking: data.isBreaking ?? false,
    isFeatured: data.isFeatured ?? false,
    region: data.region || undefined,
    publishedAt: data.status === "published" ? new Date() : undefined,
    tags: [],
  });

  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/articles");
  redirect(`/admin/articles?created=${article.slug}`);
}
