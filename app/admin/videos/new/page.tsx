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
    <div className="w-full space-y-6">
      <h1 className="text-xl font-bold text-foreground sm:text-2xl">New Video</h1>
      <VideoForm categories={categories} />
    </div>
  );
}
