import { defineQuery } from "next-sanity";
import type { Release } from "@/data/releases";
import { sanityClient } from "./client";

/** In dev: no cache so every Sanity change is visible immediately.
 *  In production: revalidate every hour. */
const REVALIDATE = process.env.NODE_ENV === "development" ? 0 : 3600;

/**
 * Projection shared by list and detail queries.
 * Maps Sanity fields → Release interface so the rest of the app
 * stays unchanged when we swap from static data to CMS.
 */
const RELEASE_PROJECTION = `{
  "id": _id,
  "slug": slug.current,
  title,
  artist,
  type,
  year,
  "coverUrl": coverImage.asset->url + "?w=800&auto=format",
  description,
  bandcampUrl,
  bandcampEmbedId,
  soundcloudUrl,
  tracks[] {
    position,
    "title": title,
    duration
  }
}`;

const allReleasesQuery = defineQuery(
  `*[_type == "release"] | order(year desc) ${RELEASE_PROJECTION}`
);

const releaseBySlugQuery = defineQuery(
  `*[_type == "release" && slug.current == $slug][0] ${RELEASE_PROJECTION}`
);

const allSlugsQuery = defineQuery(
  `*[_type == "release"]{ "slug": slug.current }`
);

export async function getAllReleases(): Promise<Release[]> {
  return sanityClient.fetch(allReleasesQuery, {}, { next: { revalidate: REVALIDATE } });
}

export async function getReleaseBySlug(slug: string): Promise<Release | null> {
  return sanityClient.fetch(
    releaseBySlugQuery,
    { slug },
    { next: { revalidate: REVALIDATE } }
  );
}

export async function getAllSlugs(): Promise<string[]> {
  const results = await sanityClient.fetch<{ slug: string }[]>(
    allSlugsQuery,
    {},
    { next: { revalidate: REVALIDATE } }
  );
  return results.map((r) => r.slug).filter(Boolean);
}
