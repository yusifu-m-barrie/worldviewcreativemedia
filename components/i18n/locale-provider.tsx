"use client";

import { createContext, useContext, useMemo } from "react";
import { createTranslator, type Messages, type Translator } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

interface LocaleContextValue {
  locale: Locale;
  messages: Messages;
  t: Translator;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  const value = useMemo(
    () => ({ locale, messages, t: createTranslator(messages) }),
    [locale, messages]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx.locale;
}

export function useTranslations() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useTranslations must be used within LocaleProvider");
  return ctx.t;
}
