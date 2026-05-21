import { getAdsenseConfig, type AdSlotKey } from "@/lib/adsense";
import { AdSlot } from "@/components/ads/ad-slot";

interface AdSlotServerProps {
  slotKey: AdSlotKey;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
  minHeight?: number;
}

/** Renders an AdSense unit only when client ID + slot ID are configured. */
export async function AdSlotServer({ slotKey, format, className, minHeight }: AdSlotServerProps) {
  const { clientId, enabled, slots } = await getAdsenseConfig();
  const slotId = slots[slotKey];

  if (!enabled || !clientId || !slotId) return null;

  return (
    <AdSlot
      slotKey={slotKey}
      slotId={slotId}
      clientId={clientId}
      format={format}
      className={className}
      minHeight={minHeight}
    />
  );
}
