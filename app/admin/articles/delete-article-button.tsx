"use client";

import { deleteArticle } from "@/actions/article.actions";
import { DeleteItemButton } from "@/components/admin/delete-item-button";

export function DeleteArticleButton({ id, title }: { id: string; title: string }) {
  return (
    <DeleteItemButton
      label="Article"
      confirmMessage={`Delete "${title}"? This cannot be undone.`}
      onDelete={() => deleteArticle(id)}
    />
  );
}
