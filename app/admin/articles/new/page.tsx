import { ensureEducationCategory } from "@/actions/category.actions";
import { isDbConfigured, tryConnectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import { demoCategories } from "@/lib/demo-data";
import { ArticleForm } from "@/components/admin/article-form";
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

export default async function NewArticlePage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <h1 className={adminPageTitle}>New Article</h1>
      <ArticleForm mode="create" categories={categories} />
    </div>
  );
}
