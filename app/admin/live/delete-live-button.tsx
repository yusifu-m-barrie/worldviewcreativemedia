"use client";

import { deleteLiveStream } from "@/actions/live.actions";
import { DeleteItemButton } from "@/components/admin/delete-item-button";

export function DeleteLiveButton({ id, title }: { id: string; title: string }) {
  return (
    <DeleteItemButton
      label="Broadcast"
      confirmMessage={`Delete "${title}"? The live record will be removed. Published replay videos stay on the Videos page unless you delete them separately.`}
      onDelete={() => deleteLiveStream(id)}
    />
  );
}
