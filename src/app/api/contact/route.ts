import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/schemas/contact";
import { checkRateLimit, rateLimitedResponse } from "@/lib/security/rate-limit";
import { mergeHeaders } from "@/lib/security/headers";
import {
  isJsonContentType,
  hasSuspiciousPatterns,
  validateEnvVars,
} from "@/lib/security/validation";
import {
  buildContactSubject,
  buildContactEmailText,
} from "@/lib/email/templates/contact";

const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? "hello@swainorecords.com";
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "noreply@swainorecords.com";

// Maximum JSON payload size (100KB)
const MAX_PAYLOAD_SIZE = 100 * 1024;

/**
 * POST /api/contact
 * Public endpoint for contact form submissions.
 *
 * Security Layers:
 *  1. Environment validation (RESEND_API_KEY required)
 *  2. Content-Type validation (must be application/json)
 *  3. Payload size limit (100KB max)
 *  4. Rate limiting (5 req/15min per IP)
 *  5. CSRF protection (origin check)
 *  6. Bot detection (honeypot + time-based)
 *  7. Input validation (Zod schema)
 *  8. Spam pattern detection
 *  9. Security headers on all responses
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Environment check
  const envCheck = validateEnvVars({
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  });
  if (!envCheck.valid) {
    console.error(
      `[POST /api/contact] Missing environment variables: ${envCheck.missing.join(", ")}`
    );
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503, headers: mergeHeaders() }
    );
  }

  // Lazy Resend instantiation — only after key is confirmed present
  const resend = new Resend(process.env.RESEND_API_KEY);

  // 2. Content-Type validation
  if (!isJsonContentType(req)) {
    return NextResponse.json(
      { error: "Content-Type must be application/json" },
      { status: 415, headers: mergeHeaders() }
    );
  }

  // 3. Rate limit: 5 richieste per 15 minuti per IP
  const { limited, headers: rlHeaders } = checkRateLimit(req, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (limited) return rateLimitedResponse(rlHeaders);

  // 4. Origin check anti-CSRF
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && !origin.includes(host)) {
    console.warn(
      `[POST /api/contact] CSRF attempt: origin=${origin}, host=${host}`
    );
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403, headers: mergeHeaders(rlHeaders) }
    );
  }

  // 5. Parse JSON with size validation
  let body: unknown;
  let bodyText: string;
  try {
    bodyText = await req.text();
    if (bodyText.length > MAX_PAYLOAD_SIZE) {
      console.warn(
        `[POST /api/contact] Payload too large: ${bodyText.length} bytes`
      );
      return NextResponse.json(
        { error: "Payload too large" },
        { status: 413, headers: mergeHeaders(rlHeaders) }
      );
    }
    body = JSON.parse(bodyText);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400, headers: mergeHeaders(rlHeaders) }
    );
  }

  // 6. Time-based bot check (< 3 secondi = bot)
  const formTime =
    typeof body === "object" && body !== null && "_formTime" in body
      ? (body as Record<string, unknown>)._formTime
      : undefined;
  if (typeof formTime === "number" && formTime < 3000) {
    console.info("[POST /api/contact] Bot detected: form filled too quickly");
    // Falsa risposta positiva per non dare feedback ai bot
    return NextResponse.json(
      { success: true },
      { status: 200, headers: mergeHeaders(rlHeaders) }
    );
  }

  // 7. Validazione Zod (include honeypot check via schema)
  const result = contactSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { errors: result.error.flatten().fieldErrors },
      { status: 422, headers: mergeHeaders(rlHeaders) }
    );
  }

  // 8. Spam pattern detection
  const combinedText = `${result.data.name} ${result.data.message}`;
  if (hasSuspiciousPatterns(combinedText)) {
    console.warn(
      `[POST /api/contact] Suspicious patterns detected from ${result.data.email}`
    );
    // Return success but don't send email (silent rejection)
    return NextResponse.json(
      { success: true },
      { status: 200, headers: mergeHeaders(rlHeaders) }
    );
  }

  // 9. Invio email via Resend
  try {
    const emailResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: CONTACT_EMAIL,
      subject: buildContactSubject(result.data.type, result.data.name),
      text: buildContactEmailText(result.data),
      // Add reply-to for easier response
      replyTo: result.data.email,
    });

    if (emailResult.data) {
      console.info(
        `[POST /api/contact] Email sent successfully: ${emailResult.data.id}`
      );
    }
  } catch (err) {
    console.error("[POST /api/contact] Resend error:", err);
    return NextResponse.json(
      { error: "email_failed" },
      { status: 500, headers: mergeHeaders(rlHeaders) }
    );
  }

  return NextResponse.json(
    { success: true },
    { status: 200, headers: mergeHeaders(rlHeaders) }
  );
}
