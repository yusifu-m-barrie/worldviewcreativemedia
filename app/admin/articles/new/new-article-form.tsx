"use client";

import { useState } from "react";
import { createArticle } from "@/actions/article.actions";
import { GalleryUpload } from "@/components/admin/gallery-upload";
import { MediaUpload } from "@/components/admin/media-upload";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { adminField, adminLabel } from "@/lib/admin-ui";

interface NewArticleFormProps {
  categories: { name: string; slug: string }[];
}

const fieldClass = adminField;
const labelClass = adminLabel;

export function NewArticleForm({ categories }: NewArticleFormProps) {
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
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
    const result = await createArticle(formData);
    setPending(false);
    if (result?.error) toast.error(result.error);
  }

  return (
    <form id="article-form" className="max-w-3xl space-y-6" onSubmit={(e) => e.preventDefault()}>
      <div>
        <label htmlFor="title" className={labelClass}>
          Title
        </label>
        <Input id="title" name="title" required placeholder="Article headline" />
      </div>
      <div>
        <label htmlFor="excerpt" className={labelClass}>
          Excerpt
        </label>
        <Input id="excerpt" name="excerpt" required placeholder="Short summary for listings and SEO" />
      </div>
      <div>
        <label htmlFor="categorySlug" className={labelClass}>
          Category
        </label>
        <select id="categorySlug" name="categorySlug" required className={fieldClass}>
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
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" name="isBreaking" className="rounded border-gray-300 dark:border-gray-600" />
          Breaking news
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" name="isFeatured" className="rounded border-gray-300 dark:border-gray-600" />
          Featured on homepage (Trending Now sidebar)
        </label>
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="outline" disabled={pending} onClick={() => submit("draft")}>
          Save Draft
        </Button>
        <Button type="button" variant="orange" disabled={pending} onClick={() => submit("published")}>
          {pending ? "Publishing…" : "Publish"}
        </Button>
      </div>
    </form>
  );
}
