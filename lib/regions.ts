/** Sierra Leone regions for homepage story filters */
export const SIERRA_LEONE_REGIONS = [
  { name: "Freetown", slug: "freetown" },
  { name: "Western Area", slug: "western-area" },
  { name: "Bombali", slug: "bombali" },
  { name: "Bo", slug: "bo" },
  { name: "Kenema", slug: "kenema" },
  { name: "Kono", slug: "kono" },
  { name: "Port Loko", slug: "port-loko" },
  { name: "Tonkolili", slug: "tonkolili" },
] as const;

export function regionLabel(slug: string): string {
  return SIERRA_LEONE_REGIONS.find((r) => r.slug === slug)?.name ?? slug;
}
