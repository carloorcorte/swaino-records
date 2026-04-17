/**
 * Security validation utilities for API routes
 */

/**
 * Check if request Content-Type is application/json
 */
export function isJsonContentType(req: Request): boolean {
  const contentType = req.headers.get("content-type");
  return contentType?.includes("application/json") ?? false;
}

/**
 * Detect suspicious patterns in text that might indicate spam/abuse
 */
export function hasSuspiciousPatterns(text: string): boolean {
  const suspiciousPatterns = [
    // Multiple URLs (> 3)
    /(https?:\/\/[^\s]+.*){4,}/i,
    // Excessive capitalization (> 50%)
    /[A-Z]{20,}/,
    // Repeated characters (> 10 times)
    /(.)\1{10,}/,
    // Common spam keywords (combined)
    /\b(viagra|cialis|casino|lottery|winner|congratulations|click here|buy now)\b/i,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(text));
}

/**
 * Validate that required environment variables are set
 */
export function validateEnvVars(vars: Record<string, string | undefined>): {
  valid: boolean;
  missing: string[];
} {
  const missing = Object.entries(vars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  return {
    valid: missing.length === 0,
    missing,
  };
}
