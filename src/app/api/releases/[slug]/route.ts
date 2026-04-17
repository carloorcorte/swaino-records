import { NextResponse, type NextRequest } from "next/server";
import { getReleaseBySlug } from "@/lib/sanity/queries";
import { checkRateLimit, rateLimitedResponse } from "@/lib/security/rate-limit";
import { mergeHeaders } from "@/lib/security/headers";

/**
 * GET /api/releases/[slug]
 * Public read-only endpoint — returns a single release by URL slug.
 *
 * Security:
 *  - Rate limited: 120 req/min per IP (detail pages hit more frequently)
 *  - Slug validated against [a-z0-9-] — rejects XSS, traversal, injection
 *  - Security headers on every response
 *  - Errors never expose internal details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const { limited, headers: rlHeaders } = checkRateLimit(req, {
    limit: 120,
    windowMs: 60_000,
  });
  if (limited) return rateLimitedResponse(rlHeaders);

  try {
    const { slug } = await params;

    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: "Invalid slug." },
        { status: 400, headers: mergeHeaders(rlHeaders) }
      );
    }

    const release = await getReleaseBySlug(slug);

    if (!release) {
      return NextResponse.json(
        { error: "Release not found." },
        { status: 404, headers: mergeHeaders(rlHeaders) }
      );
    }

    return NextResponse.json(
      { data: release },
      { status: 200, headers: mergeHeaders(rlHeaders) }
    );
  } catch (err) {
    console.error("[GET /api/releases/[slug]] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to load release. Please try again later." },
      { status: 500, headers: mergeHeaders() }
    );
  }
}
