"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { setLocale } from "@/actions/locale.actions";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n/config";
import { useLocale } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onChange(next: Locale) {
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Globe className="h-4 w-4 shrink-0 text-white/90" aria-hidden />
      <label htmlFor="site-language" className="sr-only">
        Language
      </label>
      <select
        id="site-language"
        value={locale}
        disabled={pending}
        onChange={(e) => onChange(e.target.value as Locale)}
        className="max-w-[7.5rem] cursor-pointer rounded-md border border-white/25 bg-[#2E2A86] px-2 py-1.5 text-xs font-semibold text-white shadow-sm outline-none transition hover:border-white/40 focus:border-[#E8872A] focus:ring-1 focus:ring-[#E8872A] disabled:opacity-60 sm:max-w-none sm:text-sm"
      >
        {LOCALES.map((code) => (
          <option key={code} value={code} className="bg-[#2E2A86] text-white">
            {LOCALE_LABELS[code]}
          </option>
        ))}
      </select>
    </div>
  );
}
