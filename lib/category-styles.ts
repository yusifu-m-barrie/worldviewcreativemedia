/** Category pill colors for story cards (matches news layout) */
const CATEGORY_COLORS: Record<string, string> = {
  national: "bg-[#2E2A86] text-white",
  africa: "bg-emerald-600 text-white",
  world: "bg-sky-700 text-white",
  business: "bg-amber-600 text-white",
  sports: "bg-green-700 text-white",
  entertainment: "bg-pink-600 text-white",
  technology: "bg-indigo-600 text-white",
  opinion: "bg-gray-700 text-white",
  environment: "bg-teal-600 text-white",
  media: "bg-violet-600 text-white",
  education: "bg-[#E8872A] text-white",
  health: "bg-rose-600 text-white",
  politics: "bg-red-700 text-white",
  development: "bg-lime-700 text-white",
};

export function getCategoryPillClass(slug?: string): string {
  if (!slug) return "bg-gray-600 text-white";
  return CATEGORY_COLORS[slug] ?? "bg-[#2E2A86] text-white";
}
