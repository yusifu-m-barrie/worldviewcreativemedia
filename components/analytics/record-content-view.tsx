"use client";

import { useEffect, useRef, useState } from "react";
import { Eye } from "lucide-react";

type ContentType = "article" | "video" | "live";

interface RecordContentViewProps {
  contentType: ContentType;
  contentId: string;
  /** Show live-updated view count (used on Live TV) */
  showCount?: boolean;
  initialViewCount?: number;
  className?: string;
  label?: string;
}

/**
 * Records one unique view per visitor (cookie + hashed IP/device).
 * Mount on article, video, and live pages — deduped server-side.
 */
export function RecordContentView({
  contentType,
  contentId,
  showCount = false,
  initialViewCount = 0,
  className = "",
  label = "views",
}: RecordContentViewProps) {
  const sent = useRef(false);
  const [viewCount, setViewCount] = useState(initialViewCount);

  useEffect(() => {
    setViewCount(initialViewCount);
  }, [initialViewCount]);

  useEffect(() => {
    if (!contentId || sent.current) return;
    sent.current = true;

    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ contentType, contentId }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { viewCount?: number } | null) => {
        if (data && typeof data.viewCount === "number") {
          setViewCount(data.viewCount);
        }
      })
      .catch(() => {
        /* non-blocking */
      });
  }, [contentType, contentId]);

  if (!showCount) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm text-foreground-muted ${className}`}
    >
      <Eye className="h-4 w-4 shrink-0" />
      {viewCount.toLocaleString()} {label}
    </span>
  );
}
