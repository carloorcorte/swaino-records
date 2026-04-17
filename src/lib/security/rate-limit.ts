import { NextRequest, NextResponse } from "next/server";

/**
 * Sliding-window rate limiter — in-memory implementation.
 *
 * Suitable for single-instance deployments (local dev, small VPS).
 * On Vercel/serverless each function instance has its own memory, so limits
 * are per-instance rather than global. For true global rate limiting,
 * replace `store` with an Upstash Redis client:
 *   https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 */

interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();

/** Remove expired windows to avoid memory growth in long-running processes. */
function cleanup() {
  const now = Date.now();
  for (const [key, win] of store) {
    if (now > win.resetAt) store.delete(key);
  }
}

export interface RateLimitOptions {
  /** Max requests allowed in the window. Default: 60 */
  limit?: number;
  /** Window duration in milliseconds. Default: 60_000 (1 minute) */
  windowMs?: number;
}

/**
 * Returns a rate-limit checker for use inside route handlers.
 *
 * Usage:
 *   const { limited, headers } = checkRateLimit(req)
 *   if (limited) return NextResponse.json({ error: "..." }, { status: 429, headers })
 */
export function checkRateLimit(
  req: NextRequest,
  options: RateLimitOptions = {}
): { limited: boolean; headers: Record<string, string> } {
  const { limit = 60, windowMs = 60_000 } = options;

  // Identify the client — prefer forwarded IP (Vercel sets this)
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const key = `${req.nextUrl.pathname}::${ip}`;
  const now = Date.now();

  if (store.size > 10_000) cleanup(); // guard against unbounded growth

  const win = store.get(key);

  if (!win || now > win.resetAt) {
    // New or expired window
    store.set(key, { count: 1, resetAt: now + windowMs });
    return {
      limited: false,
      headers: {
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": String(limit - 1),
        "X-RateLimit-Reset": String(Math.ceil((now + windowMs) / 1000)),
      },
    };
  }

  win.count += 1;
  const remaining = Math.max(0, limit - win.count);
  const retryAfter = Math.ceil((win.resetAt - now) / 1000);

  if (win.count > limit) {
    return {
      limited: true,
      headers: {
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.ceil(win.resetAt / 1000)),
        "Retry-After": String(retryAfter),
      },
    };
  }

  return {
    limited: false,
    headers: {
      "X-RateLimit-Limit": String(limit),
      "X-RateLimit-Remaining": String(remaining),
      "X-RateLimit-Reset": String(Math.ceil(win.resetAt / 1000)),
    },
  };
}

/** Convenience: build a 429 response with proper headers. */
export function rateLimitedResponse(headers: Record<string, string>): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please slow down." },
    { status: 429, headers }
  );
}
