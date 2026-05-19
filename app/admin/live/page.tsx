import { getAllLiveStreamsForAdmin } from "@/services/livestream.service";
import { getSiteSettings } from "@/services/settings.service";
import { LiveControlForm } from "./live-control-form";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function AdminLivePage() {
  const [streams, settings] = await Promise.all([
    getAllLiveStreamsForAdmin(),
    getSiteSettings(),
  ]);

  const active = streams.find((s) => s.isLive) || streams[0] || null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#2E2A86] dark:text-white">Live TV Control</h1>
        <p className="mt-1 text-sm text-gray-500">
          Go live on Facebook (recommended) or YouTube. Paste your live video URL when broadcasting.
        </p>
      </div>

      <div className="rounded-xl border border-[#E8872A]/30 bg-[#E8872A]/5 p-4 text-sm dark:bg-[#E8872A]/10">
        <p className="font-semibold text-[#2E2A86] dark:text-white">How to go live on Facebook</p>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-gray-700 dark:text-gray-300">
          <li>Start your live broadcast on your Facebook Page as usual.</li>
          <li>On the live post, click the three dots → <strong>Copy link</strong> (or Embed).</li>
          <li>Paste that URL below and toggle <strong>Live Now</strong>.</li>
          <li>Your page URL for fallback: {settings.live.facebookPageUrl}</li>
        </ol>
      </div>

      <LiveControlForm
        stream={
          active
            ? {
                _id: String(active._id),
                title: active.title,
                description: active.description || "",
                thumbnail: active.thumbnail || "",
                platform: active.platform || settings.live.defaultPlatform,
                facebookVideoUrl: active.facebookVideoUrl || "",
                youtubeEmbedUrl: active.youtubeEmbedUrl || "",
                customEmbedUrl: active.customEmbedUrl || "",
                isLive: active.isLive,
                scheduledAt: active.scheduledAt
                  ? new Date(active.scheduledAt).toISOString().slice(0, 16)
                  : "",
                replayUrl: active.replayUrl || "",
              }
            : null
        }
        defaultPlatform={settings.live.defaultPlatform}
      />

      {streams.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold text-[#2E2A86] dark:text-white">Recent broadcasts</h2>
          <ul className="space-y-2">
            {streams.map((s) => (
              <li
                key={String(s._id)}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800"
              >
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-xs text-gray-500">
                    {s.platform} · {s.updatedAt ? formatDate(s.updatedAt) : ""}
                  </p>
                </div>
                {s.isLive ? <Badge variant="live">Live</Badge> : <Badge variant="secondary">Offline</Badge>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
