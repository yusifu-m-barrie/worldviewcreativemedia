import { isDbConfigured, tryConnectDB } from "@/lib/db";
import { demoCategories } from "@/lib/demo-data";
import type { Locale } from "@/lib/i18n/config";
import { resolveLocalizedFields } from "@/lib/i18n/localize";
import { Category } from "@/models/Category";
import { Article } from "@/models/Article";

function localizeCategoryName(name: string, slug: string, locale: Locale) {
  const { name: localized } = resolveLocalizedFields(
    { slug, name },
    locale,
    ["name"],
    "category"
  );
  return localized || name;
}

export interface CategoryOption {
  name: string;
  slug: string;
}

export interface CategoryWithCount extends CategoryOption {
  count: number;
}

export async function getActiveCategories(locale: Locale = "en"): Promise<CategoryOption[]> {
  const withCounts = await getCategoriesWithCounts(locale);
  return withCounts.map(({ name, slug }) => ({ name, slug }));
}

export async function getCategoriesWithCounts(locale: Locale = "en"): Promise<CategoryWithCount[]> {
  if (!isDbConfigured() || !(await tryConnectDB())) {
    return demoCategories.map((c) => ({
      name: localizeCategoryName(c.name, c.slug, locale),
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
      return {
        name: localizeCategoryName(c.name, c.slug, locale),
        slug: c.slug,
        count,
      };
    })
  );

  return result;
}

export async function getCategoryBySlug(
  slug: string,
  locale: Locale = "en"
): Promise<CategoryWithCount | null> {
  const all = await getCategoriesWithCounts(locale);
  return all.find((c) => c.slug === slug) ?? null;
}
