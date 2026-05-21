"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DeleteItemButtonProps {
  label: string;
  confirmMessage: string;
  onDelete: () => Promise<{ error?: string; success?: boolean } | void>;
}

export function DeleteItemButton({ label, confirmMessage, onDelete }: DeleteItemButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm(confirmMessage)) return;
    setPending(true);
    const result = await onDelete();
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`${label} deleted`);
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-9 gap-1 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
      disabled={pending}
      onClick={handleDelete}
      aria-label={`Delete ${label}`}
      title={`Delete ${label}`}
    >
      <Trash2 className="h-4 w-4" />
      <span className="hidden sm:inline">Delete</span>
    </Button>
  );
}
