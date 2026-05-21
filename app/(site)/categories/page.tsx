import { CategoriesGrid } from "@/components/home/categories-grid";
import { SectionHeading } from "@/components/home/section-heading";
import { buildMetadata } from "@/lib/seo";
import { getServerTranslations } from "@/lib/i18n/server";
import { getCategoriesWithCounts } from "@/services/category.service";

export const metadata = buildMetadata({
  title: "Browse Categories",
  description: "Explore news by topic — National, Africa, Business, Sports, Education, and more.",
  path: "/categories",
});

export default async function CategoriesPage() {
  const { t, locale } = await getServerTranslations();
  const categories = await getCategoriesWithCounts(locale);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <SectionHeading
        title={t("categories.title")}
        subtitle={t("categories.subtitle")}
        href="/news"
        linkLabel={t("nav.news")}
      />
      <CategoriesGrid categories={categories} articlesLabel={t("categories.articles")} />
    </div>
  );
}
