import Image from "next/image";
import Link from "next/link";
import { Play, Eye } from "lucide-react";
import { formatDate, formatDuration } from "@/lib/utils";
import type { VideoCard } from "@/types";

interface VideoHighlightsProps {
  videos: VideoCard[];
}

export function VideoHighlights({ videos }: VideoHighlightsProps) {
  if (!videos.length) return null;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <Link
          key={video._id}
          href={`/videos/${video.slug}`}
          className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="relative aspect-video overflow-hidden">
            {video.thumbnail && (
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
              <Play className="h-12 w-12 text-white" fill="white" />
            </div>
            {video.duration != null && (
              <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-xs font-medium text-white">
                {formatDuration(video.duration)}
              </span>
            )}
          </div>
          <div className="p-4">
            <h3 className="line-clamp-2 font-bold text-gray-900 group-hover:text-[#2E2A86] dark:text-gray-100">
              {video.title}
            </h3>
            <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
              {video.viewCount != null && (
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {video.viewCount.toLocaleString()}
                </span>
              )}
              {video.publishedAt && <span>{formatDate(video.publishedAt)}</span>}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
