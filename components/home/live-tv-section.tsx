import Link from "next/link";
import { LivePlayer } from "@/components/live/live-player";
import { Button } from "@/components/ui/button";
import { getSiteSettings } from "@/services/settings.service";
import type { LiveStreamCard } from "@/types";

interface LiveTVSectionProps {
  stream: LiveStreamCard | null;
}

export async function LiveTVSection({ stream }: LiveTVSectionProps) {
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
          <span className="text-sm font-bold uppercase text-[#E8872A]">Live TV</span>
          <h3 className="mt-2 text-2xl font-bold lg:text-3xl">
            {stream?.title || "WorldView Creative Media Live"}
          </h3>
          <p className="mt-3 text-white/70">
            Watch breaking news and special coverage live on our website — streaming from Facebook, YouTube, and TikTok.
          </p>
          <Button asChild variant="orange" className="mt-6 w-fit">
            <Link href="/live-tv">Full Live TV Page</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
