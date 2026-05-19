import { CategoriesGrid } from "@/components/home/categories-grid";
import { SectionHeading } from "@/components/home/section-heading";
import { buildMetadata } from "@/lib/seo";
import { getCategoriesWithCounts } from "@/services/category.service";

export const metadata = buildMetadata({
  title: "Browse Categories",
  description: "Explore news by topic — National, Africa, Business, Sports, Education, and more.",
  path: "/categories",
});

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCounts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <SectionHeading
        title="Browse Categories"
        subtitle="Pick a topic to read the latest stories"
        href="/news"
        linkLabel="All news"
      />
      <CategoriesGrid categories={categories} />
    </div>
  );
}
