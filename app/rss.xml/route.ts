import { siteConfig } from "@/config/site";
import { demoArticles } from "@/lib/demo-data";
import { getPublishedArticles } from "@/services/article.service";
import { isDbConfigured } from "@/lib/db";
import { absoluteUrl } from "@/lib/utils";

export async function GET() {
  let articles = demoArticles;
  if (isDbConfigured()) {
    try {
      const result = await getPublishedArticles({ limit: 50 });
      articles = result.data;
    } catch {
      /* use demo */
    }
  }

  const items = articles
    .map(
      (a) => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${absoluteUrl(`/news/${a.slug}`)}</link>
      <guid>${absoluteUrl(`/news/${a.slug}`)}</guid>
      <description><![CDATA[${a.excerpt}]]></description>
      ${a.publishedAt ? `<pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>` : ""}
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteConfig.name}</title>
    <link>${siteConfig.url}</link>
    <description>${siteConfig.description}</description>
    <language>en</language>
    <atom:link href="${absoluteUrl("/rss.xml")}" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
