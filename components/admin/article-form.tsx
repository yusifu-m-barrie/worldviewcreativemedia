"use client";

import { useState } from "react";
import { createArticle, updateArticle } from "@/actions/article.actions";
import { GalleryUpload } from "@/components/admin/gallery-upload";
import { MediaUpload } from "@/components/admin/media-upload";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { adminField, adminLabel } from "@/lib/admin-ui";

export interface ArticleFormInitial {
  title: string;
  excerpt: string;
  content: string;
  categorySlug: string;
  featuredImage: string;
  galleryImages: string[];
  isBreaking: boolean;
  isFeatured: boolean;
  status: "draft" | "published";
}

interface ArticleFormProps {
  categories: { name: string; slug: string }[];
  mode: "create" | "edit";
  articleId?: string;
  initial?: ArticleFormInitial;
}

const fieldClass = adminField;
const labelClass = adminLabel;

export function ArticleForm({ categories, mode, articleId, initial }: ArticleFormProps) {
  const [content, setContent] = useState(initial?.content ?? "");
  const [featuredImage, setFeaturedImage] = useState(initial?.featuredImage ?? "");
  const [galleryImages, setGalleryImages] = useState<string[]>(initial?.galleryImages ?? []);
  const [pending, setPending] = useState(false);

  async function submit(status: "draft" | "published") {
    const form = document.getElementById("article-form") as HTMLFormElement;
    if (!form) return;
    const formData = new FormData(form);
    formData.set("content", content);
    formData.set("featuredImage", featuredImage);
    formData.set("galleryImages", JSON.stringify(galleryImages));
    formData.set("status", status);
    setPending(true);

    if (mode === "edit" && articleId) {
      const result = await updateArticle(articleId, formData);
      setPending(false);
      if (result?.error) toast.error(result.error);
    } else {
      const result = await createArticle(formData);
      setPending(false);
      if (result?.error) toast.error(result.error);
    }
  }

  return (
    <form id="article-form" className="w-full max-w-3xl space-y-6" onSubmit={(e) => e.preventDefault()}>
      <div>
        <label htmlFor="title" className={labelClass}>
          Title
        </label>
        <Input
          id="title"
          name="title"
          required
          placeholder="Article headline"
          defaultValue={initial?.title}
        />
      </div>
      <div>
        <label htmlFor="excerpt" className={labelClass}>
          Excerpt
        </label>
        <Input
          id="excerpt"
          name="excerpt"
          required
          placeholder="Short summary for listings and SEO"
          defaultValue={initial?.excerpt}
        />
      </div>
      <div>
        <label htmlFor="categorySlug" className={labelClass}>
          Category
        </label>
        <select
          id="categorySlug"
          name="categorySlug"
          required
          className={fieldClass}
          defaultValue={initial?.categorySlug}
        >
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <MediaUpload
        label="Featured image (main cover)"
        accept="image/*"
        resourceType="image"
        folder="worldview/articles/featured"
        value={featuredImage}
        onChange={setFeaturedImage}
      />
      <input type="hidden" name="featuredImage" value={featuredImage} />

      <GalleryUpload
        label="Story gallery"
        folder="worldview/articles/gallery"
        images={galleryImages}
        onChange={setGalleryImages}
      />
      <div>
        <label className={labelClass}>Content</label>
        <TiptapEditor content={content} onChange={setContent} />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="isBreaking"
            defaultChecked={initial?.isBreaking}
            className="rounded border-gray-300 dark:border-gray-600"
          />
          Breaking news
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={initial?.isFeatured}
            className="rounded border-gray-300 dark:border-gray-600"
          />
          Featured on homepage (Trending Now sidebar)
        </label>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          className="w-full sm:w-auto"
          onClick={() => submit("draft")}
        >
          {mode === "edit" ? "Save as Draft" : "Save Draft"}
        </Button>
        <Button
          type="button"
          variant="orange"
          disabled={pending}
          className="w-full sm:w-auto"
          onClick={() => submit("published")}
        >
          {pending
            ? mode === "edit"
              ? "Saving…"
              : "Publishing…"
            : mode === "edit"
              ? "Update & Publish"
              : "Publish"}
        </Button>
      </div>
    </form>
  );
}
