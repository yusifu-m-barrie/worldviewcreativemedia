import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { ensureEducationCategory } from "@/actions/category.actions";
import { canEditArticle } from "@/lib/permissions";
import type { Role } from "@/config/roles";
import { ArticleForm } from "@/components/admin/article-form";
import { Button } from "@/components/ui/button";
import { isDbConfigured, tryConnectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import { demoCategories } from "@/lib/demo-data";
import { getArticleForAdminEdit } from "@/services/article.service";
import { adminPageTitle } from "@/lib/admin-ui";

async function getCategories() {
  if (!isDbConfigured()) return demoCategories.map((c) => ({ name: c.name, slug: c.slug }));
  if (!(await tryConnectDB())) {
    return demoCategories.map((c) => ({ name: c.name, slug: c.slug }));
  }
  await ensureEducationCategory();
  const cats = await Category.find({ isActive: true }).sort({ order: 1 }).lean();
  return cats.map((c) => ({ name: c.name, slug: c.slug }));
}

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  const userId = session?.user?.id;

  const [article, categories] = await Promise.all([getArticleForAdminEdit(id), getCategories()]);

  if (!article) notFound();

  if (!canEditArticle(role, session?.user?.permissions, userId, article.authorId)) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className={adminPageTitle}>Edit Article</h1>
          <p className="mt-1 truncate text-sm text-foreground-muted">/{article.slug}</p>
        </div>
        <Button asChild variant="outline" className="w-full shrink-0 sm:w-auto">
          <Link href="/admin/articles">Back to Articles</Link>
        </Button>
      </div>

      <ArticleForm
        mode="edit"
        articleId={article.id}
        categories={categories}
        initial={{
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          categorySlug: article.categorySlug,
          featuredImage: article.featuredImage,
          galleryImages: article.galleryImages,
          isBreaking: article.isBreaking,
          isFeatured: article.isFeatured,
          status: article.status === "published" ? "published" : "draft",
        }}
      />
    </div>
  );
}
