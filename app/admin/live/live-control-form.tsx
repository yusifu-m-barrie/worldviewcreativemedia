"use client";

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
  customEmbedUrl: string;
  isLive: boolean;
  scheduledAt: string;
  replayUrl: string;
}

interface LiveControlFormProps {
  stream: StreamData | null;
  defaultPlatform: LivePlatform;
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
    if (result?.error) toast.error(result.error);
    else toast.success(isLive ? "You are now LIVE on the site!" : "Broadcast saved");
  }

  async function handleEnd() {
    if (!stream?._id) return;
    setPending(true);
    const result = await endLiveBroadcast(stream._id);
    setPending(false);
    if (result?.error) toast.error(result.error);
    else {
      setIsLive(false);
      toast.success("Broadcast ended");
    }
  }

  return (
    <form id="live-form" className="max-w-2xl space-y-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
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
          {(["facebook", "youtube", "custom"] as LivePlatform[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
                platform === p
                  ? "bg-[#E8872A] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {p === "facebook" ? "Facebook Live" : p === "youtube" ? "YouTube Live" : "Custom embed"}
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
            Copy the link from your live video post on Facebook (while streaming or after).
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
          />
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

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="orange" disabled={pending} onClick={handleSave}>
          {isLive ? "Go Live" : "Save broadcast"}
        </Button>
        {stream?._id && stream.isLive && (
          <Button type="button" variant="destructive" disabled={pending} onClick={handleEnd}>
            End broadcast
          </Button>
        )}
      </div>
    </form>
  );
}

