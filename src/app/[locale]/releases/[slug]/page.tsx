import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAllSlugs, getReleaseBySlug } from "@/lib/sanity/queries";
import { BandcampPlayer } from "@/components/releases/BandcampPlayer";
import { SoundCloudPlayer } from "@/components/releases/SoundCloudPlayer";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const release = await getReleaseBySlug(slug);
  if (!release) return { title: "Not Found" };

  return {
    title: `${release.title} — ${release.artist} | Swaino Records`,
    description: release.description,
    openGraph: release.coverUrl
      ? { images: [{ url: release.coverUrl }] }
      : undefined,
  };
}

export default async function ReleaseDetailPage({ params }: Props) {
  const { slug } = await params;
  const release = await getReleaseBySlug(slug);

  if (!release) notFound();

  const t = await getTranslations("release_detail");

  const typeLabel =
    release.type === "single" ? "Single" : release.type === "ep" ? "EP" : "Album";

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-20">
      {/* Back */}
      <Link
        href="/releases"
        className="inline-block text-sm transition-colors"
        style={{ color: "var(--text-muted)" }}
      >
        {t("back")}
      </Link>

      {/* Hero */}
      <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-12">
        {/* Cover */}
        <div
          className="relative w-full shrink-0 overflow-hidden rounded-xl sm:w-56 lg:w-72"
          style={{
            aspectRatio: "1/1",
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          {release.coverUrl ? (
            <Image
              src={release.coverUrl}
              alt={`${release.title} — ${release.artist}`}
              fill
              sizes="(max-width: 640px) 100vw, 288px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg
                width="64"
                height="64"
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
        </div>

        {/* Meta */}
        <div className="flex flex-col justify-center gap-4">
          <span
            className="w-fit rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-widest"
            style={{
              backgroundColor: "var(--surface)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            {typeLabel}
          </span>

          <h1
            className="text-3xl font-semibold leading-tight tracking-tight lg:text-4xl"
            style={{ color: "var(--text-primary)" }}
          >
            {release.title}
          </h1>

          <p className="text-lg" style={{ color: "var(--text-muted)" }}>
            {release.artist} · {release.year}
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            {release.bandcampUrl && (
              <a
                href={release.bandcampUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: "var(--surface)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                }}
              >
                <BandcampIcon />
                {t("on_bandcamp")}
              </a>
            )}
            {release.soundcloudUrl && (
              <a
                href={release.soundcloudUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: "var(--surface)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                }}
              >
                <SoundCloudIcon />
                {t("on_soundcloud")}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Player — Bandcamp priorità, SoundCloud fallback */}
      {(release.bandcampEmbedId || release.soundcloudUrl) && (
        <div className="mt-12">
          {release.bandcampEmbedId ? (
            <BandcampPlayer
              embedId={release.bandcampEmbedId}
              type={release.type}
              title={release.title}
              artist={release.artist}
            />
          ) : (
            <SoundCloudPlayer
              trackUrl={release.soundcloudUrl!}
              title={release.title}
              artist={release.artist}
            />
          )}
        </div>
      )}

      {/* Descrizione */}
      {release.description && (
        <div className="mt-10 max-w-2xl">
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {release.description}
          </p>
        </div>
      )}

      {/* Tracklist */}
      {release.tracks && release.tracks.length > 0 && (
        <div className="mt-10 max-w-2xl">
          <h2
            className="mb-4 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-dim)" }}
          >
            {t("tracklist")}
          </h2>
          <ol className="divide-y" style={{ borderColor: "var(--border)" }}>
            {release.tracks.map((track) => (
              <li
                key={track.position}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div className="flex items-center gap-4">
                  <span
                    className="w-5 text-right tabular-nums"
                    style={{ color: "var(--text-dim)" }}
                  >
                    {track.position}
                  </span>
                  <span style={{ color: "var(--text-primary)" }}>{track.title}</span>
                </div>
                {track.duration && (
                  <span className="tabular-nums" style={{ color: "var(--text-dim)" }}>
                    {track.duration}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function BandcampIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M0 18.75l7.437-13.5H24l-7.438 13.5z" />
    </svg>
  );
}

function SoundCloudIcon() {
  return (
    <svg width="14" height="10" viewBox="0 0 24 16" fill="currentColor" aria-hidden="true">
      <path d="M1.2 10.4C.5 10.4 0 10.9 0 11.6s.5 1.2 1.2 1.2 1.2-.5 1.2-1.2-.5-1.2-1.2-1.2zm2.4-1.2c-.5 0-.9.2-1.2.5V6c0-.4-.3-.7-.7-.7s-.7.3-.7.7v6.4c0 .4.3.7.7.7h1.9c.9 0 1.6-.7 1.6-1.6V10c0-.4-.7-.8-1.6-.8zm3.2-2.4c-.3 0-.5.1-.7.2-.2-1.6-1.6-2.8-3.3-2.8C1.3 4.2 0 5.5 0 7.1v.1c.3-.2.7-.3 1.2-.3.5 0 1 .2 1.3.5.2-.9 1-1.6 2-1.6 1.1 0 2 .9 2 2v.1c.2-.1.4-.1.6-.1.9 0 1.6.7 1.6 1.6S9.7 11 8.8 11H6.8V9.4c0-.5-.4-.9-.9-.9-.5 0-.9.4-.9.9V11c0 .9.7 1.6 1.6 1.6h2c1.4 0 2.5-1.1 2.5-2.5S8.2 7.6 6.8 6.8zm5.6-2.4c-1.3 0-2.5.5-3.4 1.4-.4-.2-.8-.3-1.2-.3-.9 0-1.7.4-2.3 1 .3-.1.6-.1.9-.1 1.3 0 2.5.6 3.3 1.6.5-.3 1.1-.5 1.7-.5 1.9 0 3.4 1.5 3.4 3.4S13.3 13 11.4 13H9.8v-1.4h1.6c1.1 0 2-.9 2-2s-.9-2-2-2c-.4 0-.8.1-1.1.3C9.8 7 8.7 6.4 7.4 6.4c-.3 0-.7.1-1 .2.3-.2.6-.3.9-.3.5 0 .9.2 1.3.5.5-1.3 1.8-2.2 3.3-2.2 1.9 0 3.4 1.5 3.4 3.4 0 .3 0 .5-.1.8.4.5.6 1.1.6 1.8 0 1.7-1.4 3.1-3.1 3.1h-2.2v-1.4h2.2c.9 0 1.7-.8 1.7-1.7s-.8-1.7-1.7-1.7c-.3 0-.5.1-.8.2-.2-1.8-1.7-3.2-3.6-3.2z" />
    </svg>
  );
}
