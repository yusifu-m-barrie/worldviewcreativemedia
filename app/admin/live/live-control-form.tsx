"use client";

import Link from "next/link";
import { useState } from "react";
import { saveLiveBroadcast, endLiveBroadcast } from "@/actions/live.actions";
import { MediaUpload } from "@/components/admin/media-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { LivePlatform } from "@/lib/live-embed";

interface StreamData {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  platform: LivePlatform;
  facebookVideoUrl: string;
  youtubeEmbedUrl: string;
  tiktokVideoUrl: string;
  customEmbedUrl: string;
  isLive: boolean;
  scheduledAt: string;
  replayUrl: string;
}

interface LiveControlFormProps {
  stream: StreamData | null;
  defaultPlatform: LivePlatform;
}

const PLATFORMS: { id: LivePlatform; label: string }[] = [
  { id: "facebook", label: "Facebook Live" },
  { id: "youtube", label: "YouTube Live" },
  { id: "tiktok", label: "TikTok Live" },
  { id: "custom", label: "Custom embed" },
];

function publishToast(
  result: {
    videoPublished?: boolean;
    videoSlug?: string;
    publishMessage?: string;
  } | undefined,
  ended: boolean
) {
  if (!ended) return;
  if (result?.videoPublished && result.videoSlug) {
    toast.success("Broadcast ended — published to Videos", {
      description: (
        <Link href={`/videos/${result.videoSlug}`} className="underline">
          View on site
        </Link>
      ),
    });
    return;
  }
  if (result?.publishMessage) {
    toast.warning(result.publishMessage);
  }
}

export function LiveControlForm({ stream, defaultPlatform }: LiveControlFormProps) {
  const [platform, setPlatform] = useState<LivePlatform>(stream?.platform || defaultPlatform);
  const [thumbnail, setThumbnail] = useState(stream?.thumbnail || "");
  const [isLive, setIsLive] = useState(stream?.isLive || false);
  const [pending, setPending] = useState(false);

  async function handleSave() {
    const form = document.getElementById("live-form") as HTMLFormElement;
    if (!form) return;
    const formData = new FormData(form);
    formData.set("platform", platform);
    formData.set("thumbnail", thumbnail);
    formData.set("isLive", isLive ? "true" : "false");
    if (stream?._id) formData.set("streamId", stream._id);

    setPending(true);
    const result = await saveLiveBroadcast(formData);
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    if (isLive) {
      toast.success("You are now LIVE on the site!");
    } else if (result?.videoPublished) {
      publishToast(result, true);
    } else {
      toast.success("Broadcast saved");
      if (result?.publishMessage) toast.info(result.publishMessage);
    }
  }

  async function handleEnd() {
    if (!stream?._id) return;
    setPending(true);
    const result = await endLiveBroadcast(stream._id);
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    setIsLive(false);
    publishToast(result, true);
    if (!result?.videoPublished && !result?.publishMessage) {
      toast.success("Broadcast ended");
    }
  }

  return (
    <form
      id="live-form"
      className="w-full max-w-2xl space-y-6 rounded-xl border border-border bg-background p-4 sm:p-6"
    >
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">Broadcast title</label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={stream?.title || "WorldView Live"}
          placeholder="e.g. Evening News Bulletin"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">Description</label>
        <textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={stream?.description}
          className="flex w-full rounded-md border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Platform</label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setPlatform(id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                platform === id
                  ? "bg-[#E8872A] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {platform === "facebook" && (
        <div>
          <label htmlFor="facebookVideoUrl" className="mb-1 block text-sm font-medium">
            Facebook Live video URL *
          </label>
          <Input
            id="facebookVideoUrl"
            name="facebookVideoUrl"
            defaultValue={stream?.facebookVideoUrl}
            placeholder="https://www.facebook.com/yourpage/videos/1234567890/"
            required={isLive}
          />
          <p className="mt-1 text-xs text-gray-500">
            Copy the link from your live video post on Facebook. When you end the broadcast, this link is used to publish the replay on Videos.
          </p>
        </div>
      )}

      {platform === "youtube" && (
        <div>
          <label htmlFor="youtubeEmbedUrl" className="mb-1 block text-sm font-medium">
            YouTube live URL or embed
          </label>
          <Input
            id="youtubeEmbedUrl"
            name="youtubeEmbedUrl"
            defaultValue={stream?.youtubeEmbedUrl}
            placeholder="https://www.youtube.com/embed/... or watch URL"
            required={isLive}
          />
          <p className="mt-1 text-xs text-gray-500">
            Paste your YouTube live or stream URL. After you end, it is published automatically to Videos.
          </p>
        </div>
      )}

      {platform === "tiktok" && (
        <div>
          <label htmlFor="tiktokVideoUrl" className="mb-1 block text-sm font-medium">
            TikTok live / video URL *
          </label>
          <Input
            id="tiktokVideoUrl"
            name="tiktokVideoUrl"
            defaultValue={stream?.tiktokVideoUrl}
            placeholder="https://www.tiktok.com/@username/live or /video/123..."
            required={isLive}
          />
          <p className="mt-1 text-xs text-gray-500">
            Paste your TikTok LIVE link or the video URL after the stream ends. It will appear on Videos when you end the broadcast.
          </p>
        </div>
      )}

      {platform === "custom" && (
        <div>
          <label htmlFor="customEmbedUrl" className="mb-1 block text-sm font-medium">Custom iframe URL</label>
          <Input
            id="customEmbedUrl"
            name="customEmbedUrl"
            defaultValue={stream?.customEmbedUrl}
            placeholder="https://..."
          />
        </div>
      )}

      {!isLive && (
        <div>
          <label htmlFor="replayUrl" className="mb-1 block text-sm font-medium">
            Replay URL (optional override)
          </label>
          <Input
            id="replayUrl"
            name="replayUrl"
            defaultValue={stream?.replayUrl}
            placeholder="https://..."
          />
          <p className="mt-1 text-xs text-gray-500">
            If set, this URL is used when publishing to Videos instead of the platform link above.
          </p>
        </div>
      )}

      <MediaUpload
        label="Thumbnail (optional)"
        accept="image/*"
        resourceType="image"
        folder="worldview/live"
        value={thumbnail}
        onChange={setThumbnail}
      />

      <div>
        <label htmlFor="scheduledAt" className="mb-1 block text-sm font-medium">Schedule (optional)</label>
        <Input
          id="scheduledAt"
          name="scheduledAt"
          type="datetime-local"
          defaultValue={stream?.scheduledAt}
        />
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
        <input
          type="checkbox"
          checked={isLive}
          onChange={(e) => setIsLive(e.target.checked)}
          className="h-5 w-5 rounded"
        />
        <div>
          <span className="font-bold text-red-700 dark:text-red-400">LIVE NOW</span>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Show this stream on the homepage and Live TV page
          </p>
        </div>
      </label>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
        <Button
          type="button"
          variant="orange"
          disabled={pending}
          className="w-full sm:w-auto"
          onClick={handleSave}
        >
          {isLive ? "Go Live" : "Save broadcast"}
        </Button>
        {stream?._id && stream.isLive && (
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            className="w-full sm:w-auto"
            onClick={handleEnd}
          >
            End broadcast
          </Button>
        )}
      </div>
    </form>
  );
}
