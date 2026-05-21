"use client";

import { useEffect, useRef } from "react";

type ContentType = "article" | "video" | "live";

interface RecordContentViewProps {
  contentType: ContentType;
  contentId: string;
}

/**
 * Records one unique view per visitor (cookie + device fingerprint).
 * Safe to mount on public content pages — deduped server-side.
 */
export function RecordContentView({ contentType, contentId }: RecordContentViewProps) {
  const sent = useRef(false);

  useEffect(() => {
    if (!contentId || sent.current) return;
    sent.current = true;

    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ contentType, contentId }),
    }).catch(() => {
      /* non-blocking */
    });
  }, [contentType, contentId]);

  return null;
}
