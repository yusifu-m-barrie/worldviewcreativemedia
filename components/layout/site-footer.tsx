import { AdSlotServer } from "@/components/ads/ad-slot-server";
import { Footer } from "@/components/layout/footer";

export async function SiteFooter() {
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <AdSlotServer slotKey="footer" format="horizontal" minHeight={90} />
      </div>
      <Footer />
    </>
  );
}
