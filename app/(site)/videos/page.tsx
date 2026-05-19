import { VideoHighlights } from "@/components/home/video-highlights";
import { SectionHeading } from "@/components/home/section-heading";
import { buildMetadata } from "@/lib/seo";
import { getPublishedVideos } from "@/services/video.service";

export const metadata = buildMetadata({
  title: "Videos",
  description: "Video journalism, documentaries, and highlights from WorldView Creative Media.",
  path: "/videos",
});

export default async function VideosPage() {
  const { data: videos, total } = await getPublishedVideos({ limit: 12 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <SectionHeading title="Videos" subtitle={`${total} videos available`} />
      <VideoHighlights videos={videos} />
    </div>
  );
}
