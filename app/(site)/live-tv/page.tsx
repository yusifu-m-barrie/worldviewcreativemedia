import { LivePlayer } from "@/components/live/live-player";
import { SectionHeading } from "@/components/home/section-heading";
import { Badge } from "@/components/ui/badge";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { getCurrentLiveStream, getUpcomingStreams, getStreamArchive } from "@/services/livestream.service";
import { getSiteSettings } from "@/services/settings.service";
import { Calendar } from "lucide-react";
import Image from "next/image";

export const metadata = buildMetadata({
  title: "Live TV",
  description: "Watch WorldView Creative Media live — breaking news and special broadcasts.",
  path: "/live-tv",
});

export default async function LiveTVPage() {
  const [current, upcoming, archive, settings] = await Promise.all([
    getCurrentLiveStream(),
    getUpcomingStreams(),
    getStreamArchive(),
    getSiteSettings(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <SectionHeading title="Live TV" subtitle="Watch WorldView live from Freetown and West Africa" />

      <section className="mb-12">
        <LivePlayer
          stream={current}
          facebookPageUrl={settings.live.facebookPageUrl}
          youtubeChannelUrl={settings.live.youtubeChannelUrl}
          tiktokProfileUrl={settings.live.tiktokProfileUrl}
          offlineMessage={settings.live.offlineMessage}
        />
      </section>

      {upcoming.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-bold text-[#2E2A86] dark:text-white">Upcoming</h2>
          <ul className="space-y-3">
            {upcoming.map((s) => (
              <li
                key={s._id}
                className="flex items-center gap-3 rounded-lg border border-gray-100 p-4 dark:border-gray-800"
              >
                <Calendar className="h-5 w-5 text-[#E8872A]" />
                <div>
                  <p className="font-semibold">{s.title}</p>
                  {s.scheduledAt && (
                    <p className="text-sm text-gray-500">{formatDate(s.scheduledAt)}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {archive.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold text-[#2E2A86] dark:text-white">Replay Archive</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {archive.map((item) => {
              const a = item as {
                _id: unknown;
                title: string;
                replayUrl?: string;
                thumbnail?: string;
              };
              return (
                <div
                  key={String(a._id)}
                  className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800"
                >
                  {a.replayUrl ? (
                    <div className="relative aspect-video">
                      <iframe
                        src={a.replayUrl}
                        title={a.title}
                        className="absolute inset-0 h-full w-full border-0"
                        allowFullScreen
                      />
                    </div>
                  ) : a.thumbnail ? (
                    <div className="relative aspect-video">
                      <Image src={a.thumbnail} alt={a.title} fill className="object-cover" />
                    </div>
                  ) : null}
                  <p className="p-4 font-semibold">{a.title}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
