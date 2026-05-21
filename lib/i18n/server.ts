import { cookies } from "next/headers";
import {
  createTranslator,
  getDictionary,
  type Messages,
  type Translator,
} from "@/lib/i18n/get-dictionary";
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_COOKIE,
  type Locale,
} from "@/lib/i18n/config";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  if (value && isLocale(value)) return value;
  return DEFAULT_LOCALE;
}

export async function getServerTranslations(): Promise<{
  locale: Locale;
  messages: Messages;
  t: Translator;
}> {
  const locale = await getLocale();
  const messages = getDictionary(locale);
  return { locale, messages, t: createTranslator(messages) };
}
