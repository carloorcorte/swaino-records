/**
 * Type definitions for releases.
 * Data is now managed via Sanity CMS — see src/lib/sanity/queries.ts
 */

export type ReleaseType = "single" | "ep" | "album";

export interface Track {
  position: number;
  title: string;
  duration?: string;
}

export interface Release {
  id: string;
  slug: string;
  title: string;
  artist: string;
  type: ReleaseType;
  year: number;
  coverUrl: string;
  description?: string;
  tracks?: Track[];
  bandcampUrl?: string;
  soundcloudUrl?: string;
  bandcampEmbedId?: string;
}
