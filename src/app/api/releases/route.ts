import { NextRequest, NextResponse } from "next/server";
import { getAllReleases } from "@/lib/sanity/queries";
import { checkRateLimit, rateLimitedResponse } from "@/lib/security/rate-limit";
import { mergeHeaders } from "@/lib/security/headers";

/**
 * GET /api/releases
 * Public read-only endpoint — returns the full release catalog from Sanity.
 *
 * Security:
 *  - Rate limited: 60 req/min per IP
 *  - Security headers on every response
 *  - Errors never expose internal details
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { limited, headers: rlHeaders } = checkRateLimit(req);
  if (limited) return rateLimitedResponse(rlHeaders);

  try {
    const releases = await getAllReleases();
    return NextResponse.json(
      { data: releases },
      { status: 200, headers: mergeHeaders(rlHeaders) }
    );
  } catch (err) {
    console.error("[GET /api/releases] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to load releases. Please try again later." },
      { status: 500, headers: mergeHeaders() }
    );
  }
}
