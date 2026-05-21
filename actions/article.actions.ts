"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import mongoose from "mongoose";
import slugify from "slugify";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { isDbConfigured, tryConnectDB } from "@/lib/db";
import { ADMIN_ROLES } from "@/config/roles";
import { canAccessPermission, canEditArticle } from "@/lib/permissions";
import type { AdminPermissions } from "@/lib/admin-permissions";
import type { ContentTranslations } from "@/lib/i18n/types";
import { Article } from "@/models/Article";
import { Category } from "@/models/Category";
import type { Role } from "@/config/roles";

function buildArticleTranslations(formData: FormData): ContentTranslations | undefined {
  const fr = {
    title: (formData.get("titleFr") as string)?.trim() || undefined,
    excerpt: (formData.get("excerptFr") as string)?.trim() || undefined,
    content: (formData.get("contentFr") as string)?.trim() || undefined,
  };
  const es = {
    title: (formData.get("titleEs") as string)?.trim() || undefined,
    excerpt: (formData.get("excerptEs") as string)?.trim() || undefined,
    content: (formData.get("contentEs") as string)?.trim() || undefined,
  };
  const translations: ContentTranslations = {};
  if (fr.title || fr.excerpt || fr.content) translations.fr = fr;
  if (es.title || es.excerpt || es.content) translations.es = es;
  return Object.keys(translations).length > 0 ? translations : undefined;
}

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
  const perms = session?.user?.permissions as AdminPermissions | undefined;
  if (!session?.user?.id || !role || !ADMIN_ROLES.includes(role)) {
    return { error: "Unauthorized" };
  }
  if (!canAccessPermission(role, perms, "articles")) {
    return { error: "You do not have permission to manage articles." };
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

  if (!(await tryConnectDB())) {
    return {
      error:
        "Could not connect to the database. Check MONGODB_URI or MONGODB_URI_STANDARD in .env.local.",
    };
  }

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
    editCount: 0,
    tags: [],
    translations: buildArticleTranslations(formData),
  });

  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/articles");
  redirect(`/admin/articles?created=${article.slug}`);
}

export async function updateArticle(articleId: string, formData: FormData) {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  const perms = session?.user?.permissions as AdminPermissions | undefined;
  if (!session?.user?.id || !role || !ADMIN_ROLES.includes(role)) {
    return { error: "Unauthorized" };
  }
  if (!canAccessPermission(role, perms, "articles")) {
    return { error: "You do not have permission to manage articles." };
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

  if (!(await tryConnectDB())) {
    return {
      error:
        "Could not connect to the database. Check MONGODB_URI or MONGODB_URI_STANDARD in .env.local.",
    };
  }

  const article = await Article.findById(articleId);
  if (!article) {
    return { error: "Article not found" };
  }

  if (!canEditArticle(role, perms, session.user.id, String(article.author))) {
    return { error: "You can only edit your own articles." };
  }

  const category = await Category.findOne({ slug: data.categorySlug });
  if (!category) {
    return { error: "Category not found" };
  }

  const previousSlug = article.slug;

  article.title = data.title;
  article.excerpt = data.excerpt;
  article.content = data.content;
  article.featuredImage = data.featuredImage;
  article.gallery = data.galleryImages ?? [];
  article.category = category._id;
  article.status = data.status;
  article.isBreaking = data.isBreaking ?? false;
  article.isFeatured = data.isFeatured ?? false;
  article.region = data.region || undefined;

  if (data.status === "published" && !article.publishedAt) {
    article.publishedAt = new Date();
  }

  article.editCount = (article.editCount ?? 0) + 1;
  article.lastEditedBy = new mongoose.Types.ObjectId(session.user.id);
  article.translations = buildArticleTranslations(formData);

  await article.save();

  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath(`/news/${article.slug}`);
  if (previousSlug !== article.slug) {
    revalidatePath(`/news/${previousSlug}`);
  }
  revalidatePath("/admin/articles");
  revalidatePath(`/admin/articles/${articleId}/edit`);

  redirect(`/admin/articles?updated=${article.slug}`);
}
