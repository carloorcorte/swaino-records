import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Release } from "@/data/releases";

interface Props {
  release: Release;
  labels: {
    single: string;
    ep: string;
    album: string;
    listenOn: string;
    bandcamp: string;
    soundcloud: string;
  };
}

export function ReleaseCard({ release, labels }: Props) {
  const typeLabel =
    release.type === "single"
      ? labels.single
      : release.type === "ep"
        ? labels.ep
        : labels.album;

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-lg border transition-colors"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--surface)",
      }}
    >
      {/*
       * Full-card link — z-10 so it sits above the cover image.
       * Platform buttons use z-20 to intercept their own clicks
       * without triggering navigation — avoids nested <a> invalid HTML.
       */}
      <Link
        href={`/releases/${release.slug}`}
        className="absolute inset-0 z-10"
        aria-label={`${release.title} — ${release.artist}`}
      />

      {/* Cover art */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-900">
        {release.coverUrl ? (
          <Image
            src={release.coverUrl}
            alt={`${release.title} — ${release.artist}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ backgroundColor: "var(--surface)" }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              style={{ color: "var(--text-dim)" }}
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
        )}

        {/* Type badge */}
        <span
          className="absolute left-2 top-2 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
          style={{
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "var(--text-muted)",
            backdropFilter: "blur(4px)",
          }}
        >
          {typeLabel}
        </span>
      </div>

      {/* Info — z-20 so platform buttons sit above the card link */}
      <div className="relative z-20 flex flex-1 flex-col gap-3 p-4">
        <div>
          <p
            className="truncate text-sm font-semibold leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {release.title}
          </p>
          <p
            className="mt-0.5 truncate text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            {release.artist} · {release.year}
          </p>
        </div>

        {/* Platform links — z-20 ensures clicks here don't bubble to the card link */}
        {(release.bandcampUrl || release.soundcloudUrl) && (
          <div className="relative z-20 mt-auto flex gap-2">
            {release.bandcampUrl && (
              <a
                href={release.bandcampUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${labels.listenOn} ${labels.bandcamp}`}
                className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--text-muted)";
                }}
              >
                <BandcampIcon />
                {labels.bandcamp}
              </a>
            )}
            {release.soundcloudUrl && (
              <a
                href={release.soundcloudUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${labels.listenOn} ${labels.soundcloud}`}
                className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--text-muted)";
                }}
              >
                <SoundCloudIcon />
                {labels.soundcloud}
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function BandcampIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M0 18.75l7.437-13.5H24l-7.438 13.5z" />
    </svg>
  );
}

function SoundCloudIcon() {
  return (
    <svg
      width="14"
      height="10"
      viewBox="0 0 24 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M1.2 10.4C.5 10.4 0 10.9 0 11.6s.5 1.2 1.2 1.2 1.2-.5 1.2-1.2-.5-1.2-1.2-1.2zm2.4-1.2c-.5 0-.9.2-1.2.5V6c0-.4-.3-.7-.7-.7s-.7.3-.7.7v6.4c0 .4.3.7.7.7h1.9c.9 0 1.6-.7 1.6-1.6V10c0-.4-.7-.8-1.6-.8zm3.2-2.4c-.3 0-.5.1-.7.2-.2-1.6-1.6-2.8-3.3-2.8C1.3 4.2 0 5.5 0 7.1v.1c.3-.2.7-.3 1.2-.3.5 0 1 .2 1.3.5.2-.9 1-1.6 2-1.6 1.1 0 2 .9 2 2v.1c.2-.1.4-.1.6-.1.9 0 1.6.7 1.6 1.6S9.7 11 8.8 11H6.8V9.4c0-.5-.4-.9-.9-.9-.5 0-.9.4-.9.9V11c0 .9.7 1.6 1.6 1.6h2c1.4 0 2.5-1.1 2.5-2.5S8.2 7.6 6.8 6.8zm5.6-2.4c-1.3 0-2.5.5-3.4 1.4-.4-.2-.8-.3-1.2-.3-.9 0-1.7.4-2.3 1 .3-.1.6-.1.9-.1 1.3 0 2.5.6 3.3 1.6.5-.3 1.1-.5 1.7-.5 1.9 0 3.4 1.5 3.4 3.4S13.3 13 11.4 13H9.8v-1.4h1.6c1.1 0 2-.9 2-2s-.9-2-2-2c-.4 0-.8.1-1.1.3C9.8 7 8.7 6.4 7.4 6.4c-.3 0-.7.1-1 .2.3-.2.6-.3.9-.3.5 0 .9.2 1.3.5.5-1.3 1.8-2.2 3.3-2.2 1.9 0 3.4 1.5 3.4 3.4 0 .3 0 .5-.1.8.4.5.6 1.1.6 1.8 0 1.7-1.4 3.1-3.1 3.1h-2.2v-1.4h2.2c.9 0 1.7-.8 1.7-1.7s-.8-1.7-1.7-1.7c-.3 0-.5.1-.8.2-.2-1.8-1.7-3.2-3.6-3.2z" />
    </svg>
  );
}
