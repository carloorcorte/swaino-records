# Contact API Security Documentation

## Overview

The `/api/contact` endpoint is a public contact form with comprehensive security protections. This document outlines the 9-layer security architecture implemented.

## Security Layers

### 1. Environment Validation
**Purpose**: Ensure required configuration is present before processing requests.

- Validates `RESEND_API_KEY` is set
- Returns `503 Service Unavailable` if missing
- Prevents silent failures

### 2. Content-Type Validation
**Purpose**: Prevent content-type confusion attacks.

- Only accepts `application/json`
- Returns `415 Unsupported Media Type` for other types
- Protects against MIME-sniffing attacks

### 3. Payload Size Limit
**Purpose**: Prevent resource exhaustion from large payloads.

- Maximum 100KB per request
- Returns `413 Payload Too Large` if exceeded
- Validates before parsing JSON

### 4. Rate Limiting
**Purpose**: Prevent abuse and brute-force attacks.

- **Limit**: 5 requests per 15 minutes per IP
- **Window**: Sliding 15-minute window
- **Headers**: `X-RateLimit-*` and `Retry-After`
- Returns `429 Too Many Requests` when exceeded

**Implementation**: In-memory store (sufficient for single-instance). For serverless/multi-instance, use Upstash Redis.

### 5. CSRF Protection
**Purpose**: Prevent cross-site request forgery.

- Validates `Origin` header matches `Host`
- Only enforced when `Origin` header is present
- Returns `403 Forbidden` for mismatched origins
- Logs suspicious attempts

### 6. Bot Detection
**Purpose**: Detect and block automated spam submissions.

**Time-based check**:
- Tracks form fill time via `_formTime` field
- Submissions < 3 seconds are considered bots
- Silent rejection (returns success without sending email)

**Honeypot field**:
- `website` field must be empty
- Bots auto-fill this field
- Validated by Zod schema (max length 0)
- Returns `422 Unprocessable Entity` if filled

### 7. Input Validation
**Purpose**: Ensure data integrity and prevent injection attacks.

**Zod Schema Validation**:
- `name`: 2-80 chars, trimmed
- `email`: Valid email format, max 200 chars
- `type`: Enum (`demo`, `press`, `booking`, `other`)
- `message`: 10-1000 chars, trimmed
- `streamingUrl`: Valid URL or empty (optional)
- `genre`: Max 50 chars (optional)
- `publication`: Max 100 chars (optional)
- `pressType`: Enum or empty (optional)
- `eventDate`: Max 20 chars (optional)

Returns `422 Unprocessable Entity` with field-level errors.

### 8. Spam Pattern Detection
**Purpose**: Identify and block spam content.

**Detects**:
- Multiple URLs (> 3)
- Excessive capitalization (> 20 consecutive caps)
- Repeated characters (> 10 times)
- Common spam keywords (viagra, casino, lottery, etc.)

**Action**: Silent rejection (returns success without sending email)

### 9. Security Headers
**Purpose**: Protect against common web vulnerabilities.

**Headers on all responses**:
- `X-Content-Type-Options: nosniff`
- `Cache-Control: no-store`
- `Content-Type: application/json`

## Error Handling

### Error Response Format
```json
{
  "error": "error_code",
  "errors": { "field": ["error_message"] }
}
```

### Status Codes
- `200`: Success
- `400`: Invalid JSON
- `403`: CSRF violation
- `413`: Payload too large
- `415`: Invalid content type
- `422`: Validation failed
- `429`: Rate limit exceeded
- `500`: Email send failed
- `503`: Service unavailable (missing env vars)

### Logging Strategy
**Always log**:
- CSRF attempts (with origin/host)
- Bot detection triggers
- Spam pattern matches
- Email send failures
- Missing environment variables

**Never log**:
- Full request bodies (may contain PII)
- Email addresses in success cases (GDPR)
- Stack traces in production

## Testing

Comprehensive test suite with 31 tests covering:
- ✅ Success cases (4 tests)
- ✅ Validation errors (7 tests)
- ✅ Bot protection (3 tests)
- ✅ CSRF protection (3 tests)
- ✅ Rate limiting (2 tests)
- ✅ Error handling (2 tests)
- ✅ Additional security (4 tests)
- ✅ Edge cases (4 tests)
- ✅ Response headers (2 tests)

Run tests:
```bash
npm test -- src/app/api/contact/route.test.ts
```

## Production Checklist

Before deploying to production:

- [ ] Set `RESEND_API_KEY` environment variable
- [ ] Set `CONTACT_EMAIL` environment variable (optional, defaults to info@swainorecords.com)
- [ ] Verify DNS records for `noreply@swainorecords.com` sender domain
- [ ] Test rate limiting with real requests
- [ ] Monitor logs for suspicious activity
- [ ] Consider upgrading to Redis-based rate limiting for serverless (Upstash)
- [ ] Set up monitoring/alerting for 5xx errors

## Future Enhancements

### Short-term
- [ ] Add IP reputation checking (e.g., Stop Forum Spam API)
- [ ] Implement CAPTCHA for suspicious requests (hCaptcha/Cloudflare Turnstile)
- [ ] Add webhook for notifications (Slack/Discord)

### Long-term
- [ ] Migrate to Redis-based rate limiting (Upstash)
- [ ] Add request ID tracking for debugging
- [ ] Implement structured logging (Pino/Winston)
- [ ] Add metrics (response times, success rate)
- [ ] Consider DDoS protection (Cloudflare)

## References

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Resend API Docs](https://resend.com/docs)
- [Zod Documentation](https://zod.dev/)
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
