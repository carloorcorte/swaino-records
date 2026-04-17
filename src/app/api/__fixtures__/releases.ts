import type { Release } from "@/data/releases";

export const mockSingle: Release = {
  id: "abc123",
  slug: "exp5-v3-dj-calixxxto",
  title: "EXP5 V3",
  artist: "DJ Calixxxto",
  type: "single",
  year: 2024,
  coverUrl: "https://cdn.sanity.io/images/rrobjg6q/production/test.jpg",
  description: "Produzione originale.",
  soundcloudUrl: "https://soundcloud.com/dj_calixxxto/exp5_v3",
};

export const mockEP: Release = {
  id: "def456",
  slug: "inland-bites-inland-knights",
  title: "Inland Bites",
  artist: "Inland Knights",
  type: "ep",
  year: 2023,
  coverUrl: "https://cdn.sanity.io/images/rrobjg6q/production/test2.jpg",
  bandcampUrl: "https://drop-music.bandcamp.com/album/inland-bites",
  bandcampEmbedId: "171756176",
  tracks: [
    { position: 1, title: "Track One", duration: "6:12" },
    { position: 2, title: "Track Two", duration: "5:44" },
  ],
};

export const mockCatalog: Release[] = [mockSingle, mockEP];
