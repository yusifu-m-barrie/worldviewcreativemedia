import { isDbConfigured, tryConnectDB } from "@/lib/db";
import { demoCategories } from "@/lib/demo-data";
import { Category } from "@/models/Category";
import { Article } from "@/models/Article";

export interface CategoryOption {
  name: string;
  slug: string;
}

export interface CategoryWithCount extends CategoryOption {
  count: number;
}

export async function getActiveCategories(): Promise<CategoryOption[]> {
  const withCounts = await getCategoriesWithCounts();
  return withCounts.map(({ name, slug }) => ({ name, slug }));
}

export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  if (!isDbConfigured() || !(await tryConnectDB())) {
    return demoCategories.map((c) => ({
      name: c.name,
      slug: c.slug,
      count: c.count ?? 0,
    }));
  }

  const cats = await Category.find({ isActive: true }).sort({ order: 1 }).lean();

  const result = await Promise.all(
    cats.map(async (c) => {
      const count = await Article.countDocuments({
        category: c._id,
        status: "published",
      });
      return { name: c.name, slug: c.slug, count };
    })
  );

  return result;
}

export async function getCategoryBySlug(slug: string): Promise<CategoryWithCount | null> {
  const all = await getCategoriesWithCounts();
  return all.find((c) => c.slug === slug) ?? null;
}
