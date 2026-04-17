import type { ReleaseType } from "@/data/releases";

interface Props {
  /** Numeric Bandcamp ID — found in the embed code as album=<ID> or track=<ID> */
  embedId: string;
  type: ReleaseType;
  /** Release title — used as accessible label */
  title: string;
  artist: string;
}

/**
 * Renders the official Bandcamp embedded player iframe.
 *
 * Player dimensions:
 * - Single: compact (height 120px) — just the player bar, no tracklist
 * - EP / Album: large (height 472px) — artwork + tracklist
 *
 * Colors are hardcoded to match the site's dark theme tokens
 * (Bandcamp iframe doesn't inherit CSS variables from the parent).
 * When the light theme is needed, add a `theme` prop and swap bgcol/linkcol.
 */
export function BandcampPlayer({ embedId, type, title, artist }: Props) {
  const isSingle = type === "single";

  // Bandcamp always uses album= in the embed URL — even for singles.
  // (A single on Bandcamp is technically a 1-track album release.)
  // Only use track= if you explicitly copied a per-track embed code.
  const embedType = "album";
  const height = isSingle ? 120 : 472;
  const tracklist = isSingle ? "false" : "true";
  const artwork = isSingle ? "small" : "large";

  const src = [
    `https://bandcamp.com/EmbeddedPlayer/${embedType}=${embedId}`,
    "size=large",
    "bgcol=000000",
    "linkcol=ffffff",
    `tracklist=${tracklist}`,
    `artwork=${artwork}`,
    "transparent=true",
  ].join("/") + "/";

  return (
    <div className="w-full overflow-hidden rounded-lg" style={{ border: "1px solid var(--border)" }}>
      <iframe
        src={src}
        style={{ border: 0, width: "100%", height }}
        seamless
        title={`${title} by ${artist} — Bandcamp player`}
        allow="autoplay"
        loading="lazy"
      />
    </div>
  );
}
