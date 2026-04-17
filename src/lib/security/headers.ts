/**
 * Standard security headers for public API responses.
 * Applied to all /api/* route handlers.
 */
export const API_SECURITY_HEADERS: Record<string, string> = {
  // Prevent browsers from MIME-sniffing the response
  "X-Content-Type-Options": "nosniff",
  // Don't cache API responses in shared caches (CDN caches are ok via s-maxage)
  "Cache-Control": "no-store",
  // Explicitly declare this is a JSON API — not renderable as HTML
  "Content-Type": "application/json",
};

/** Merges rate-limit headers and security headers into a single object. */
export function mergeHeaders(
  ...sources: (Record<string, string> | undefined)[]
): Record<string, string> {
  return Object.assign({}, API_SECURITY_HEADERS, ...sources);
}
