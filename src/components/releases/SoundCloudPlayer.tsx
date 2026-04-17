interface Props {
  /** Full SoundCloud track or playlist URL */
  trackUrl: string;
  title: string;
  artist: string;
}

/**
 * Renders the SoundCloud embedded widget.
 * Uses the visual player (waveform) for a full-size look on the detail page.
 *
 * Colors are hardcoded for the dark theme — the widget doesn't inherit
 * CSS variables from the parent document.
 */
export function SoundCloudPlayer({ trackUrl, title, artist }: Props) {
  const src =
    "https://w.soundcloud.com/player/?" +
    new URLSearchParams({
      url: trackUrl,
      color: "%23ffffff",
      auto_play: "false",
      hide_related: "true",
      show_comments: "false",
      show_user: "true",
      show_reposts: "false",
      show_teaser: "false",
      visual: "true",
    }).toString();

  return (
    <div
      className="w-full overflow-hidden rounded-lg"
      style={{ border: "1px solid var(--border)" }}
    >
      <iframe
        src={src}
        style={{ border: 0, width: "100%", height: 300 }}
        scrolling="no"
        allow="autoplay; encrypted-media"
        loading="lazy"
        title={`${title} by ${artist} — SoundCloud player`}
      />
    </div>
  );
}
