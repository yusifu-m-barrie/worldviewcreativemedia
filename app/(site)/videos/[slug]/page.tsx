import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";
import { VideoPlayer } from "@/components/video/video-player";
import { buildMetadata } from "@/lib/seo";
import { formatDate, formatDuration } from "@/lib/utils";
import { getVideoBySlug } from "@/services/video.service";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const video = await getVideoBySlug(slug);
  if (!video) return {};
  const v = video as { title: string; description?: string; thumbnail?: string };
  return buildMetadata({
    title: v.title,
    description: v.description,
    image: v.thumbnail,
    path: `/videos/${slug}`,
  });
}

export default async function VideoPage({ params }: PageProps) {
  const { slug } = await params;
  const video = await getVideoBySlug(slug);
  if (!video) notFound();

  const v = video as {
    title: string;
    slug: string;
    description?: string;
    thumbnail?: string;
    embedUrl?: string;
    videoUrl?: string;
    cloudinaryPublicId?: string;
    duration?: number;
    viewCount?: number;
    publishedAt?: string | Date;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:px-6">
      <Link href="/videos" className="mb-6 inline-flex items-center gap-2 text-sm text-[#2E2A86] hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to Videos
      </Link>
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
        <VideoPlayer
          title={v.title}
          videoUrl={v.videoUrl}
          embedUrl={v.embedUrl}
          cloudinaryPublicId={v.cloudinaryPublicId}
          thumbnail={v.thumbnail}
        />
      </div>
      <h1 className="mt-6 text-3xl font-bold text-foreground">{v.title}</h1>
      <div className="mt-3 flex flex-wrap gap-4 text-sm text-foreground-muted">
        {v.duration != null && <span>{formatDuration(v.duration)}</span>}
        {v.viewCount != null && (
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {v.viewCount.toLocaleString()} views
          </span>
        )}
        {v.publishedAt && <span>{formatDate(v.publishedAt)}</span>}
      </div>
      {v.description && (
        <p className="mt-6 text-foreground-muted dark:text-gray-300">{v.description}</p>
      )}
      {!v.description && v.thumbnail && (
        <div className="relative mt-6 hidden aspect-video">
          <Image src={v.thumbnail} alt={v.title} fill className="object-cover" />
        </div>
      )}
    </div>
  );
}
