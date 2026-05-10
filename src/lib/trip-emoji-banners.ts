/** Banner files live in `public/trip-banners/{slug}.{TRIP_BANNER_EXT}` */
export const TRIP_BANNER_EXT = "png" as const;

export const TRIP_EMOJI_OPTIONS = [
  { emoji: "✈️", slug: "plane" },
  { emoji: "🚗", slug: "car" },
  { emoji: "🏖️", slug: "beach" },
  { emoji: "🏔️", slug: "mountain" },
  { emoji: "🎉", slug: "party" },
  { emoji: "🍕", slug: "pizza" },
  { emoji: "🏕️", slug: "camping" },
  { emoji: "🚂", slug: "train" },
  { emoji: "🚢", slug: "ship" },
  { emoji: "🎡", slug: "ferris" },
] as const;

export const TRIP_EMOJIS = TRIP_EMOJI_OPTIONS.map((o) => o.emoji);

function normalizeEmoji(emoji: string): string {
  return emoji.normalize("NFC").trim();
}

export function slugForTripEmoji(emoji: string): string {
  const n = normalizeEmoji(emoji);
  const found = TRIP_EMOJI_OPTIONS.find((o) => o.emoji === n);
  if (found) return found.slug;
  const stripVs = (s: string) => s.replace(/\uFE0F/g, "");
  const ns = stripVs(n);
  const foundLoose = TRIP_EMOJI_OPTIONS.find((o) => stripVs(o.emoji) === ns);
  return foundLoose?.slug ?? "default";
}

/** Paths under `public/trip-banners/`. Change `TRIP_BANNER_EXT` if you use `.jpg` / `.webp`. */
export function tripBannerPathForEmoji(emoji: string): string {
  return `/trip-banners/${slugForTripEmoji(emoji)}.${TRIP_BANNER_EXT}`;
}

export function defaultTripBannerPath(): string {
  return `/trip-banners/default.${TRIP_BANNER_EXT}`;
}
