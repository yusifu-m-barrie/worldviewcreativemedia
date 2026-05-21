import Link from "next/link";
import { RecordContentView } from "@/components/analytics/record-content-view";
import { LivePlayer } from "@/components/live/live-player";
import { Button } from "@/components/ui/button";
import { getSiteSettings } from "@/services/settings.service";
import type { LiveStreamCard } from "@/types";

interface LiveTVSectionProps {
  stream: LiveStreamCard | null;
  labels?: { subtitle: string; cta: string; badge?: string };
}

export async function LiveTVSection({ stream, labels }: LiveTVSectionProps) {
  const settings = await getSiteSettings();

  return (
    <section className="overflow-hidden rounded-2xl bg-gray-900">
      <div className="grid lg:grid-cols-2">
        <LivePlayer
          stream={stream}
          facebookPageUrl={settings.live.facebookPageUrl}
          youtubeChannelUrl={settings.live.youtubeChannelUrl}
          tiktokProfileUrl={settings.live.tiktokProfileUrl}
          offlineMessage={settings.live.offlineMessage}
          compact
        />
        <div className="flex flex-col justify-center p-8 text-white">
          <span className="text-sm font-bold uppercase text-[#E8872A]">{labels?.badge ?? "Live TV"}</span>
          <h3 className="mt-2 text-2xl font-bold lg:text-3xl">
            {stream?.title || "WorldView Creative Media Live"}
          </h3>
          {stream?._id ? (
            <div className="mt-2">
              <RecordContentView
                contentType="live"
                contentId={stream._id}
                showCount
                initialViewCount={stream.viewCount ?? 0}
                className="text-white/70"
                label="views"
              />
            </div>
          ) : null}
          <p className="mt-3 text-white/70">
            {labels?.subtitle ??
              "Watch breaking news and special coverage live on our website — streaming from Facebook, YouTube, and TikTok."}
          </p>
          <Button asChild variant="orange" className="mt-6 w-fit">
            <Link href="/live-tv">{labels?.cta ?? "Full Live TV Page"}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
