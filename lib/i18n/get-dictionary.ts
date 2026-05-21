import type { Locale } from "@/lib/i18n/config";

import en from "@/messages/en.json";
import fr from "@/messages/fr.json";
import es from "@/messages/es.json";

export type Messages = typeof en;

const dictionaries: Record<Locale, Messages> = { en, fr, es };

export function getDictionary(locale: Locale): Messages {
  return dictionaries[locale] ?? dictionaries.en;
}

export function createTranslator(messages: Messages) {
  return function t(key: string, vars?: Record<string, string | number>): string {
    const parts = key.split(".");
    let value: unknown = messages;
    for (const part of parts) {
      if (value && typeof value === "object" && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        return key;
      }
    }
    if (typeof value !== "string") return key;
    let result = value;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        result = result.replaceAll(`{${k}}`, String(v));
      }
    }
    return result;
  };
}

export type Translator = ReturnType<typeof createTranslator>;
