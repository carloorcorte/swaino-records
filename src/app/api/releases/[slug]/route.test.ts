import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { mockSingle } from "../../__fixtures__/releases";

vi.mock("@/lib/sanity/queries", () => ({
  getReleaseBySlug: vi.fn(),
}));

import { getReleaseBySlug } from "@/lib/sanity/queries";
const mockGetReleaseBySlug = vi.mocked(getReleaseBySlug);

function makeReq(slug: string, ip = "1.2.3.4") {
  return new NextRequest(`http://localhost/api/releases/${slug}`, {
    headers: { "x-forwarded-for": ip },
  });
}

function makeParams(slug: string) {
  return { params: Promise.resolve({ slug }) };
}

describe("GET /api/releases/[slug]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  // ── Happy paths ────────────────────────────────────────────────────────────

  it("returns 200 with { data: Release } for a valid slug", async () => {
    mockGetReleaseBySlug.mockResolvedValue(mockSingle);

    const res = await GET(makeReq("exp5-v3-dj-calixxxto"), makeParams("exp5-v3-dj-calixxxto"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ data: mockSingle });
  });

  it("calls getReleaseBySlug with the exact slug", async () => {
    mockGetReleaseBySlug.mockResolvedValue(mockSingle);

    await GET(makeReq("exp5-v3-dj-calixxxto"), makeParams("exp5-v3-dj-calixxxto"));

    expect(mockGetReleaseBySlug).toHaveBeenCalledWith("exp5-v3-dj-calixxxto");
    expect(mockGetReleaseBySlug).toHaveBeenCalledTimes(1);
  });

  // ── Input validation ───────────────────────────────────────────────────────

  it("returns 400 for slug with uppercase letters", async () => {
    const res = await GET(makeReq("My-Release"), makeParams("My-Release"));
    expect(res.status).toBe(400);
    expect(mockGetReleaseBySlug).not.toHaveBeenCalled();
  });

  it("returns 400 for slug with spaces", async () => {
    const res = await GET(makeReq("my release"), makeParams("my release"));
    expect(res.status).toBe(400);
    expect(mockGetReleaseBySlug).not.toHaveBeenCalled();
  });

  it("returns 400 for XSS attempt in slug", async () => {
    const xss = "<script>alert(1)</script>";
    const res = await GET(makeReq(xss), makeParams(xss));
    expect(res.status).toBe(400);
    expect(mockGetReleaseBySlug).not.toHaveBeenCalled();
  });

  it("returns 400 for SQL injection attempt in slug", async () => {
    const sqli = "'; DROP TABLE releases; --";
    const res = await GET(makeReq(sqli), makeParams(sqli));
    expect(res.status).toBe(400);
    expect(mockGetReleaseBySlug).not.toHaveBeenCalled();
  });

  it("returns 400 for path traversal attempt", async () => {
    const traversal = "../../../etc/passwd";
    const res = await GET(makeReq(traversal), makeParams(traversal));
    expect(res.status).toBe(400);
    expect(mockGetReleaseBySlug).not.toHaveBeenCalled();
  });

  it("returns 400 for empty slug", async () => {
    const res = await GET(makeReq(""), makeParams(""));
    expect(res.status).toBe(400);
    expect(mockGetReleaseBySlug).not.toHaveBeenCalled();
  });

  // ── Not found ──────────────────────────────────────────────────────────────

  it("returns 404 when release does not exist in CMS", async () => {
    mockGetReleaseBySlug.mockResolvedValue(null);

    const res = await GET(makeReq("non-existing"), makeParams("non-existing"));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body).toHaveProperty("error");
  });

  // ── Security headers ───────────────────────────────────────────────────────

  it("includes X-RateLimit-Limit: 120 (higher limit for detail endpoint)", async () => {
    mockGetReleaseBySlug.mockResolvedValue(mockSingle);
    const res = await GET(makeReq("exp5-v3-dj-calixxxto", "5.5.5.5"), makeParams("exp5-v3-dj-calixxxto"));
    expect(res.headers.get("X-RateLimit-Limit")).toBe("120");
  });

  it("includes X-Content-Type-Options: nosniff on all responses", async () => {
    mockGetReleaseBySlug.mockResolvedValue(null);
    const res = await GET(makeReq("missing", "6.6.6.6"), makeParams("missing"));
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("includes X-Content-Type-Options: nosniff on 400 validation error", async () => {
    const res = await GET(makeReq("BAD SLUG", "7.7.7.7"), makeParams("BAD SLUG"));
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  // ── Error handling ─────────────────────────────────────────────────────────

  it("returns 500 when Sanity throws", async () => {
    mockGetReleaseBySlug.mockRejectedValue(new Error("Network error"));

    const res = await GET(makeReq("valid-slug"), makeParams("valid-slug"));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toHaveProperty("error");
  });

  it("does not leak internal error details in 500", async () => {
    mockGetReleaseBySlug.mockRejectedValue(
      new Error("SANITY_TOKEN=secret at client.ts:12")
    );

    const res = await GET(makeReq("valid-slug"), makeParams("valid-slug"));
    const body = await res.json();

    expect(body.error).not.toContain("SANITY_TOKEN");
    expect(body.error).not.toContain("secret");
  });

  // ── Response shape ─────────────────────────────────────────────────────────

  it("response data contains all required release fields", async () => {
    mockGetReleaseBySlug.mockResolvedValue(mockSingle);

    const res = await GET(makeReq("exp5-v3-dj-calixxxto"), makeParams("exp5-v3-dj-calixxxto"));
    const { data } = await res.json();

    expect(data).toMatchObject({
      id: expect.any(String),
      slug: "exp5-v3-dj-calixxxto",
      title: expect.any(String),
      artist: expect.any(String),
      type: expect.stringMatching(/^(single|ep|album)$/),
      year: expect.any(Number),
    });
  });
});
