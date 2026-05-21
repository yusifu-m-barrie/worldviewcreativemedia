import type { Locale } from "@/lib/i18n/config";
import {
  getCatalogAbout,
  getCatalogArticle,
  getCatalogCategory,
  getCatalogLive,
  getCatalogVideo,
} from "@/lib/i18n/catalog";
import type {
  ContentTranslations,
  LocalizableDoc,
  LocaleContentFields,
  LocalizedLocale,
} from "@/lib/i18n/types";

function isLocalizedLocale(locale: Locale): locale is LocalizedLocale {
  return locale === "fr" || locale === "es";
}

function mergeFields(
  base: LocaleContentFields,
  overlay?: LocaleContentFields
): LocaleContentFields {
  if (!overlay) return base;
  const out = { ...base };
  for (const key of Object.keys(overlay) as (keyof LocaleContentFields)[]) {
    if (overlay[key]) out[key] = overlay[key];
  }
  return out;
}

function fromDocTranslations(
  translations: ContentTranslations | undefined,
  locale: LocalizedLocale
): LocaleContentFields | undefined {
  const t = translations?.[locale];
  if (!t) return undefined;
  return t;
}

function fromCatalog(
  slug: string | undefined,
  locale: LocalizedLocale,
  kind: "article" | "video" | "category" | "live"
): LocaleContentFields | undefined {
  if (!slug) return undefined;
  switch (kind) {
    case "article":
      return getCatalogArticle(slug, locale);
    case "video":
      return getCatalogVideo(slug, locale);
    case "category":
      return getCatalogCategory(slug, locale);
    case "live":
      return getCatalogLive(slug, locale);
    default:
      return undefined;
  }
}

export function resolveLocalizedFields(
  doc: LocalizableDoc,
  locale: Locale,
  fields: (keyof LocaleContentFields)[],
  catalogKind?: "article" | "video" | "category" | "live"
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const field of fields) {
    const enVal = doc[field as keyof LocalizableDoc];
    const english = typeof enVal === "string" ? enVal : "";

    if (locale === "en" || !isLocalizedLocale(locale)) {
      if (english) result[field] = english;
      continue;
    }

    const fromDb = fromDocTranslations(doc.translations, locale)?.[field];
    const fromBundle =
      catalogKind && doc.slug
        ? fromCatalog(doc.slug, locale, catalogKind)?.[field]
        : undefined;

    result[field] = fromDb || fromBundle || english;
  }

  return result;
}

export function localizeArticleCard<T extends { title: string; excerpt: string; slug: string; category?: { name: string; slug: string } }>(
  article: T,
  locale: Locale
): T {
  if (locale === "en") return article;

  const fields = resolveLocalizedFields(
    { slug: article.slug, title: article.title, excerpt: article.excerpt, translations: (article as LocalizableDoc).translations },
    locale,
    ["title", "excerpt"],
    "article"
  );

  let category = article.category;
  if (category) {
    const catName = resolveLocalizedFields(
      { slug: category.slug, name: category.name },
      locale,
      ["name"],
      "category"
    ).name;
    category = { ...category, name: catName || category.name };
  }

  return { ...article, ...fields, category } as T;
}

export function localizeArticleDetail(
  article: Record<string, unknown>,
  locale: Locale
): Record<string, unknown> {
  const slug = article.slug as string;
  const fields = resolveLocalizedFields(
    {
      slug,
      title: article.title as string,
      excerpt: article.excerpt as string,
      content: article.content as string,
      translations: article.translations as ContentTranslations,
    },
    locale,
    ["title", "excerpt", "content"],
    "article"
  );

  const category = article.category as { name?: string; slug?: string } | undefined;
  let localizedCategory = category;
  if (category?.slug) {
    const name = resolveLocalizedFields(
      { slug: category.slug, name: category.name },
      locale,
      ["name"],
      "category"
    ).name;
    localizedCategory = { ...category, name: name || category.name };
  }

  return { ...article, ...fields, category: localizedCategory };
}

export function localizeVideo<T extends { title: string; slug: string; description?: string }>(
  video: T,
  locale: Locale
): T {
  if (locale === "en") return video;
  const fields = resolveLocalizedFields(
    {
      slug: video.slug,
      title: video.title,
      description: video.description,
      translations: (video as LocalizableDoc).translations,
    },
    locale,
    ["title", "description"],
    "video"
  );
  return { ...video, ...fields };
}

export function localizeAboutPage<T extends { headline: string; description: string; mission: string; translations?: ContentTranslations }>(
  about: T,
  locale: Locale
): T {
  if (locale === "en") return about;

  const fromDb = isLocalizedLocale(locale)
    ? fromDocTranslations(about.translations, locale)
    : undefined;
  const fromBundle = isLocalizedLocale(locale) ? getCatalogAbout(locale) : undefined;

  return {
    ...about,
    headline: fromDb?.headline || fromBundle?.headline || about.headline,
    description: fromDb?.description || fromBundle?.description || about.description,
    mission: fromDb?.mission || fromBundle?.mission || about.mission,
  };
}

export function localizeLiveStream<T extends { title: string; slug: string; description?: string }>(
  stream: T,
  locale: Locale
): T {
  if (locale === "en") return stream;
  const fields = resolveLocalizedFields(
    {
      slug: stream.slug,
      title: stream.title,
      description: stream.description,
      translations: (stream as LocalizableDoc).translations,
    },
    locale,
    ["title", "description"],
    "live"
  );
  return { ...stream, ...fields };
}
