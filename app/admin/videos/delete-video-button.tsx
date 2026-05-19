"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteVideo } from "@/actions/video.actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DeleteVideoButton({ id }: { id: string }) {
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this video?")) return;
    setPending(true);
    const result = await deleteVideo(id);
    setPending(false);
    if (result?.error) toast.error(result.error);
    else toast.success("Video deleted");
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-red-600 hover:text-red-700"
      disabled={pending}
      onClick={handleDelete}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
