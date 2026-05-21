import { AdSlotServer } from "@/components/ads/ad-slot-server";

interface ArticleContentWithAdsProps {
  html: string;
}

/**
 * Renders article HTML with one mid-content ad after the 2nd paragraph (if configured).
 */
export async function ArticleContentWithAds({ html }: ArticleContentWithAdsProps) {
  const parts = html.split(/(<\/p>)/i);
  const segments: string[] = [];
  let paragraphCount = 0;

  for (let i = 0; i < parts.length; i++) {
    segments.push(parts[i]);
    if (parts[i].toLowerCase() === "</p>") {
      paragraphCount++;
      if (paragraphCount === 2) {
        segments.push("<!--AD_MID-->");
      }
    }
  }

  const merged = segments.join("");
  const chunks = merged.split("<!--AD_MID-->");

  if (chunks.length === 1) {
    return (
      <div
        className="prose-article mt-8 dark:text-gray-300"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div className="prose-article mt-8 dark:text-gray-300">
      <div dangerouslySetInnerHTML={{ __html: chunks[0] }} />
      <AdSlotServer slotKey="articleMid" format="auto" minHeight={250} className="my-8" />
      <div dangerouslySetInnerHTML={{ __html: chunks.slice(1).join("") }} />
    </div>
  );
}
