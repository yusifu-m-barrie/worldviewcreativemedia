export const LOCALES = ["en", "fr", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_COOKIE = "wv_locale";
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
};

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}
