import Link from "next/link";
import { Eye } from "lucide-react";
import { auth } from "@/lib/auth";
import { isSuperAdmin } from "@/config/roles";
import { getAllLiveStreamsForAdmin } from "@/services/livestream.service";
import { getSiteSettings } from "@/services/settings.service";
import { LiveControlForm } from "./live-control-form";
import { DeleteLiveButton } from "./delete-live-button";
import type { Role } from "@/config/roles";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { adminMuted, adminPageTitle, adminSubtitle } from "@/lib/admin-ui";

export default async function AdminLivePage() {
  const session = await auth();
  const superAdmin = isSuperAdmin(session?.user?.role as Role | undefined);

  const [streams, settings] = await Promise.all([
    getAllLiveStreamsForAdmin(),
    getSiteSettings(),
  ]);

  const active = streams.find((s) => s.isLive) || streams[0] || null;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className={adminPageTitle}>Live TV Control</h1>
        <p className={`mt-1 ${adminSubtitle}`}>
          Go live on Facebook, YouTube, or TikTok. When you end a broadcast, the replay is published automatically to Videos.
        </p>
      </div>

      <div className="rounded-xl border border-[#E8872A]/30 bg-[#E8872A]/5 p-4 text-sm dark:bg-[#E8872A]/10 sm:p-5">
        <p className="font-semibold text-foreground">Auto-publish to Videos</p>
        <ul className={`mt-2 list-inside list-disc space-y-1 ${adminMuted}`}>
          <li>Paste your live video URL for the platform you are using (Facebook, YouTube, or TikTok).</li>
          <li>Toggle <strong>Live Now</strong> while streaming, then click <strong>End broadcast</strong> (or save with Live off).</li>
          <li>The replay appears on the public <Link href="/videos" className="text-[#E8872A] underline">Videos</Link> page automatically.</li>
        </ul>
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
                tiktokVideoUrl: active.tiktokVideoUrl || "",
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
          <h2 className="mb-4 text-lg font-bold text-foreground">Recent broadcasts</h2>
          <ul className="space-y-2">
            {streams.map((s) => (
              <li
                key={String(s._id)}
                className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{s.title}</p>
                  <p className={`text-xs ${adminMuted}`}>
                    {s.platform} · {s.updatedAt ? formatDate(s.updatedAt) : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1 text-xs ${adminMuted}`}>
                    <Eye className="h-3.5 w-3.5" />
                    {(s.viewCount ?? 0).toLocaleString()} views
                  </span>
                  {s.publishedVideoId ? (
                    <Badge variant="secondary">On Videos</Badge>
                  ) : null}
                  {s.isLive ? <Badge variant="live">Live</Badge> : <Badge variant="secondary">Offline</Badge>}
                  {superAdmin ? (
                    <DeleteLiveButton id={String(s._id)} title={s.title} />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
