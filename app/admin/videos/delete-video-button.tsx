"use client";

import { deleteVideo } from "@/actions/video.actions";
import { DeleteItemButton } from "@/components/admin/delete-item-button";

export function DeleteVideoButton({ id, title }: { id: string; title: string }) {
  return (
    <DeleteItemButton
      label="Video"
      confirmMessage={`Delete "${title}"? This cannot be undone.`}
      onDelete={() => deleteVideo(id)}
    />
  );
}
