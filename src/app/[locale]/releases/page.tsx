"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import useSWR from "swr";
import type { Release, ReleaseType } from "@/data/releases";
import { ReleaseCard } from "@/components/releases/ReleaseCard";

type Filter = ReleaseType | "all";

const fetcher = (url: string) =>
  fetch(url).then((r) => r.json()).then((r) => r.data as Release[]);

export default function ReleasesPage() {
  const t = useTranslations("releases");
  const [filter, setFilter] = useState<Filter>("all");

  const { data: releases = [], isLoading } = useSWR<Release[]>(
    "/api/releases",
    fetcher
  );

  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: t("filter_all") },
    { value: "single", label: t("filter_single") },
    { value: "ep", label: t("filter_ep") },
    { value: "album", label: t("filter_album") },
  ];

  const cardLabels = {
    single: t("type_single"),
    ep: t("type_ep"),
    album: t("type_album"),
    listenOn: t("listen_on"),
    bandcamp: t("bandcamp"),
    soundcloud: t("soundcloud"),
  };

  const visible =
    filter === "all" ? releases : releases.filter((r) => r.type === filter);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-20">
      <h1
        className="text-4xl font-semibold tracking-tight"
        style={{ color: "var(--text-primary)" }}
      >
        {t("title")}
      </h1>
      <p className="mt-3 text-base" style={{ color: "var(--text-muted)" }}>
        {t("subtitle")}
      </p>

      {/* Filters */}
      <div className="mt-8 flex flex-wrap gap-2">
        {filters.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
            style={
              filter === value
                ? { backgroundColor: "var(--accent)", color: "var(--bg)" }
                : {
                    backgroundColor: "var(--surface)",
                    color: "var(--text-muted)",
                    border: "1px solid var(--border)",
                  }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-lg"
              style={{ backgroundColor: "var(--surface)" }}
            />
          ))}
        </div>
      ) : visible.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((release) => (
            <ReleaseCard key={release.id} release={release} labels={cardLabels} />
          ))}
        </div>
      ) : (
        <p className="mt-16 text-sm" style={{ color: "var(--text-dim)" }}>
          {t("empty")}
        </p>
      )}
    </div>
  );
}
