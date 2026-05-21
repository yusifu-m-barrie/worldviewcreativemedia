import { VideoHighlights } from "@/components/home/video-highlights";
import { SectionHeading } from "@/components/home/section-heading";
import { buildMetadata } from "@/lib/seo";
import { getServerTranslations } from "@/lib/i18n/server";
import { getPublishedVideos } from "@/services/video.service";

export const metadata = buildMetadata({
  title: "Videos",
  description: "Video journalism, documentaries, and highlights from WorldView Creative Media.",
  path: "/videos",
});

export default async function VideosPage() {
  const { t, locale } = await getServerTranslations();
  const { data: videos, total } = await getPublishedVideos({ limit: 12, locale });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <SectionHeading title={t("videos.title")} subtitle={t("videos.subtitle")} />
      <VideoHighlights videos={videos} />
    </div>
  );
}
