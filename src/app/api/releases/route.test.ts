import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { mockCatalog } from "../__fixtures__/releases";

vi.mock("@/lib/sanity/queries", () => ({
  getAllReleases: vi.fn(),
}));

import { getAllReleases } from "@/lib/sanity/queries";
const mockGetAllReleases = vi.mocked(getAllReleases);

function makeReq(ip = "1.2.3.4") {
  return new NextRequest("http://localhost/api/releases", {
    headers: { "x-forwarded-for": ip },
  });
}

describe("GET /api/releases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules(); // reset rate-limit store between test groups
  });

  // ── Happy paths ────────────────────────────────────────────────────────────

  it("returns 200 with { data: Release[] } on success", async () => {
    mockGetAllReleases.mockResolvedValue(mockCatalog);

    const res = await GET(makeReq());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ data: mockCatalog });
  });

  it("returns 200 with empty array when catalog is empty", async () => {
    mockGetAllReleases.mockResolvedValue([]);

    const res = await GET(makeReq());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  // ── Response shape ─────────────────────────────────────────────────────────

  it("each release has required fields", async () => {
    mockGetAllReleases.mockResolvedValue(mockCatalog);

    const res = await GET(makeReq());
    const { data } = await res.json();

    for (const release of data) {
      expect(release).toMatchObject({
        id: expect.any(String),
        slug: expect.any(String),
        title: expect.any(String),
        artist: expect.any(String),
        type: expect.stringMatching(/^(single|ep|album)$/),
        year: expect.any(Number),
      });
    }
  });

  // ── Security headers ───────────────────────────────────────────────────────

  it("includes X-RateLimit-Limit header", async () => {
    mockGetAllReleases.mockResolvedValue([]);
    const res = await GET(makeReq("2.2.2.2"));
    expect(res.headers.get("X-RateLimit-Limit")).toBe("60");
  });

  it("includes X-RateLimit-Remaining header", async () => {
    mockGetAllReleases.mockResolvedValue([]);
    const res = await GET(makeReq("3.3.3.3"));
    expect(res.headers.get("X-RateLimit-Remaining")).not.toBeNull();
  });

  it("includes X-Content-Type-Options: nosniff", async () => {
    mockGetAllReleases.mockResolvedValue([]);
    const res = await GET(makeReq("4.4.4.4"));
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  // ── Error handling ─────────────────────────────────────────────────────────

  it("returns 500 with generic message when Sanity throws", async () => {
    mockGetAllReleases.mockRejectedValue(new Error("Sanity unavailable"));

    const res = await GET(makeReq());
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toHaveProperty("error");
  });

  it("does not leak internal error details in the 500 response", async () => {
    mockGetAllReleases.mockRejectedValue(
      new Error("SECRET_TOKEN invalid at line 42")
    );

    const res = await GET(makeReq());
    const body = await res.json();

    expect(body.error).not.toContain("SECRET_TOKEN");
    expect(body.error).not.toContain("line 42");
  });
});
