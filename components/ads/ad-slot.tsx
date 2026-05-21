"use client";

import { useEffect, useRef } from "react";
import type { AdSlotKey } from "@/lib/adsense";
import { useTranslations } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

interface AdSlotProps {
  slotKey: AdSlotKey;
  slotId: string;
  clientId: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
  /** Min height placeholder while ad loads */
  minHeight?: number;
}

export function AdSlot({
  slotKey,
  slotId,
  clientId,
  format = "auto",
  className,
  minHeight = 90,
}: AdSlotProps) {
  const t = useTranslations();
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* ad blocker or script not ready */
    }
  }, []);

  return (
    <aside
      className={cn("ad-slot my-6 flex flex-col items-center", className)}
      data-ad-slot={slotKey}
      aria-label={t("common.advertisement")}
    >
      <p className="mb-1 w-full text-center text-[10px] font-medium uppercase tracking-wide text-foreground-subtle">
        {t("common.advertisement")}
      </p>
      <ins
        className="adsbygoogle block w-full"
        style={{ display: "block", minHeight }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </aside>
  );
}
