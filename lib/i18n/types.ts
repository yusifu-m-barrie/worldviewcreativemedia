import type { Locale } from "@/lib/i18n/config";

export type LocalizedLocale = Exclude<Locale, "en">;

export interface LocaleContentFields {
  title?: string;
  excerpt?: string;
  content?: string;
  description?: string;
  name?: string;
  headline?: string;
  mission?: string;
  bio?: string;
}

export type ContentTranslations = Partial<Record<LocalizedLocale, LocaleContentFields>>;

export interface LocalizableDoc {
  slug?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  description?: string;
  name?: string;
  headline?: string;
  mission?: string;
  translations?: ContentTranslations;
}
