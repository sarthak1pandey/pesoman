"use client";

import { useMemo, useState } from "react";
import {
  defaultTripBannerPath,
  tripBannerPathForEmoji,
} from "@/lib/trip-emoji-banners";

type Props = {
  emoji: string;
  coverImage?: string | null;
  alt: string;
  className?: string;
};

export default function TripBannerImage({ emoji, coverImage, alt, className }: Props) {
  const [failed, setFailed] = useState(false);
  const [candidateIndex, setCandidateIndex] = useState(0);

  const candidates = useMemo(() => {
    const list: string[] = [];
    const trimmed = coverImage?.trim();
    if (trimmed) list.push(trimmed);
    list.push(tripBannerPathForEmoji(emoji));
    list.push(defaultTripBannerPath());
    return [...new Set(list)];
  }, [coverImage, emoji]);

  const src = candidates[candidateIndex] ?? candidates[0];

  if (failed) {
    return (
      <div
        className={`bg-gradient-to-br from-primary/25 via-secondary/15 to-primary-container/30 ${className ?? ""}`}
        aria-hidden
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        if (candidateIndex < candidates.length - 1) {
          setCandidateIndex((i) => i + 1);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}
