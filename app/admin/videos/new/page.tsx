import { isDbConfigured, tryConnectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import { VideoForm } from "./video-form";

async function getCategories() {
  if (!isDbConfigured()) {
    return [
      { name: "National", slug: "national" },
      { name: "Sports", slug: "sports" },
    ];
  }
  if (!(await tryConnectDB())) {
    return [
      { name: "National", slug: "national" },
      { name: "Sports", slug: "sports" },
    ];
  }

  const cats = await Category.find({ isActive: true }).sort({ order: 1 }).lean();
  return cats.map((c) => ({ name: c.name, slug: c.slug }));
}

export default async function NewVideoPage() {
  const categories = await getCategories();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#2E2A86] dark:text-white">New Video</h1>
      <VideoForm categories={categories} />
    </div>
  );
}
