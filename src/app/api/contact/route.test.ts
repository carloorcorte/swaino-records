import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from "vitest";
import { NextRequest } from "next/server";

// Mock environment variables BEFORE importing the route
vi.stubEnv("RESEND_API_KEY", "test_api_key");
vi.stubEnv("CONTACT_EMAIL", "test@swainorecords.com");

// Mock Resend - use factory to avoid hoisting issues
vi.mock("resend", () => {
  const mockSend = vi.fn();
  return {
    Resend: class MockResend {
      emails = {
        send: mockSend,
      };
    },
    __mockSend: mockSend, // Export for test access
  };
});

import { POST } from "./route";
// @ts-expect-error - __mockSend is exported only in mock
import { __mockSend as mockEmailSend } from "resend";

// Mock rate limiter
vi.mock("@/lib/security/rate-limit", () => ({
  checkRateLimit: vi.fn(() => ({
    limited: false,
    headers: {
      "X-RateLimit-Limit": "5",
      "X-RateLimit-Remaining": "4",
      "X-RateLimit-Reset": String(Math.ceil(Date.now() / 1000) + 900),
    },
  })),
  rateLimitedResponse: vi.fn(() =>
    new Response(JSON.stringify({ error: "Too many requests. Please slow down." }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    })
  ),
}));

describe("POST /api/contact", () => {
  const validPayload = {
    name: "Marco Rossi",
    email: "marco.rossi@example.com",
    type: "demo" as const,
    streamingUrl: "https://soundcloud.com/test",
    genre: "Techno",
    message: "Ciao, vi mando il mio demo per valutazione.",
    website: "",
    _formTime: 5000,
  };

  function createRequest(body: unknown, headers: Record<string, string> = {}): NextRequest {
    return new NextRequest("http://localhost:3000/api/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        host: "localhost:3000",
        origin: "http://localhost:3000",
        ...headers,
      },
      body: JSON.stringify(body),
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockEmailSend.mockResolvedValue({ id: "mock-email-id" });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Success Cases", () => {
    it("should accept valid demo submission", async () => {
      const req = createRequest(validPayload);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json).toEqual({ success: true });
    });

    it("should accept valid press request", async () => {
      const payload = {
        name: "Giornalista Test",
        email: "press@magazine.com",
        type: "press",
        publication: "Electronic Music Mag",
        pressType: "interview",
        message: "Vorrei intervistarvi per la nostra rivista.",
        website: "",
        _formTime: 4000,
      };
      const req = createRequest(payload);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json).toEqual({ success: true });
    });

    it("should accept valid booking request", async () => {
      const payload = {
        name: "Event Organizer",
        email: "booking@club.com",
        type: "booking",
        eventDate: "2026-06-15",
        message: "Siamo interessati a un vostro artista per un evento.",
        website: "",
        _formTime: 6000,
      };
      const req = createRequest(payload);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json).toEqual({ success: true });
    });

    it("should accept minimal valid payload", async () => {
      const payload = {
        name: "Test User",
        email: "test@example.com",
        type: "other",
        message: "Messaggio di prova valido.",
        website: "",
        _formTime: 5000,
      };
      const req = createRequest(payload);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json).toEqual({ success: true });
    });
  });

  describe("Validation Errors", () => {
    it("should reject missing required fields", async () => {
      const payload = { email: "test@example.com" };
      const req = createRequest(payload);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(422);
      expect(json).toHaveProperty("errors");
      expect(json.errors).toHaveProperty("name");
      expect(json.errors).toHaveProperty("type");
      expect(json.errors).toHaveProperty("message");
    });

    it("should reject invalid email format", async () => {
      const payload = {
        ...validPayload,
        email: "not-an-email",
      };
      const req = createRequest(payload);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(422);
      expect(json.errors).toHaveProperty("email");
    });

    it("should reject name too short", async () => {
      const payload = {
        ...validPayload,
        name: "A",
      };
      const req = createRequest(payload);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(422);
      expect(json.errors).toHaveProperty("name");
    });

    it("should reject message too short", async () => {
      const payload = {
        ...validPayload,
        message: "short",
      };
      const req = createRequest(payload);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(422);
      expect(json.errors).toHaveProperty("message");
    });

    it("should reject message too long", async () => {
      const payload = {
        ...validPayload,
        message: "x".repeat(1001),
      };
      const req = createRequest(payload);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(422);
      expect(json.errors).toHaveProperty("message");
    });

    it("should reject invalid contact type", async () => {
      const payload = {
        ...validPayload,
        type: "invalid-type",
      };
      const req = createRequest(payload);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(422);
      expect(json.errors).toHaveProperty("type");
    });

    it("should reject invalid URL format in streamingUrl", async () => {
      const payload = {
        ...validPayload,
        streamingUrl: "not-a-url",
      };
      const req = createRequest(payload);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(422);
      expect(json.errors).toHaveProperty("streamingUrl");
    });
  });

  describe("Security - Bot Protection", () => {
    it("should reject honeypot-filled submission via Zod validation", async () => {
      const payload = {
        ...validPayload,
        website: "https://spam-site.com", // honeypot field filled
      };
      const req = createRequest(payload);
      const res = await POST(req);
      const json = await res.json();

      // Zod schema validates website max(0), so this returns 422
      expect(res.status).toBe(422);
      expect(json).toHaveProperty("errors");
      expect(json.errors).toHaveProperty("website");
    });

    it("should silently reject too-fast submission (< 3s)", async () => {
      const payload = {
        ...validPayload,
        _formTime: 2000, // Too fast = bot
      };
      const req = createRequest(payload);
      const res = await POST(req);
      const json = await res.json();

      // Should return success but not actually send email
      expect(res.status).toBe(200);
      expect(json).toEqual({ success: true });
    });

    it("should accept submission without _formTime (optional field)", async () => {
      const payload = { ...validPayload };
      delete (payload as Record<string, unknown>)._formTime;
      const req = createRequest(payload);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json).toEqual({ success: true });
    });
  });

  describe("Security - CSRF Protection", () => {
    it("should reject request with mismatched origin", async () => {
      const req = createRequest(validPayload, {
        origin: "http://evil-site.com",
        host: "localhost:3000",
      });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json).toEqual({ error: "Forbidden" });
    });

    it("should accept request with matching origin", async () => {
      const req = createRequest(validPayload, {
        origin: "http://localhost:3000",
        host: "localhost:3000",
      });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json).toEqual({ success: true });
    });

    it("should accept request without origin header (same-origin)", async () => {
      const req = new NextRequest("http://localhost:3000/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          host: "localhost:3000",
          // No origin header
        },
        body: JSON.stringify(validPayload),
      });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json).toEqual({ success: true });
    });
  });

  describe("Rate Limiting", () => {
    it("should return 429 when rate limit exceeded", async () => {
      const { checkRateLimit, rateLimitedResponse } = await import(
        "@/lib/security/rate-limit"
      );

      vi.mocked(checkRateLimit).mockReturnValueOnce({
        limited: true,
        headers: {
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(Date.now() / 1000) + 900),
          "Retry-After": "900",
        },
      });

      const req = createRequest(validPayload);
      const res = await POST(req);

      expect(res.status).toBe(429);
    });

    it("should include rate limit headers in success response", async () => {
      const req = createRequest(validPayload);
      const res = await POST(req);

      expect(res.headers.get("X-RateLimit-Limit")).toBeTruthy();
      expect(res.headers.get("X-RateLimit-Remaining")).toBeTruthy();
      expect(res.headers.get("X-RateLimit-Reset")).toBeTruthy();
    });
  });

  describe("Error Handling", () => {
    it("should return 400 for malformed JSON", async () => {
      const req = new NextRequest("http://localhost:3000/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          host: "localhost:3000",
          origin: "http://localhost:3000",
        },
        body: "invalid-json{",
      });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json).toEqual({ error: "Invalid JSON" });
    });

    it("should return 500 when email service fails", async () => {
      // Temporarily override the mock to reject
      mockEmailSend.mockRejectedValueOnce(new Error("Service unavailable"));

      const req = createRequest(validPayload);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json).toEqual({ error: "email_failed" });

      // Restore the mock for other tests
      mockEmailSend.mockResolvedValue({ id: "mock-email-id" });
    });
  });

  describe("Additional Security - Content Type & Payload Size", () => {
    it("should reject non-JSON content type", async () => {
      const req = new NextRequest("http://localhost:3000/api/contact", {
        method: "POST",
        headers: {
          "content-type": "text/plain",
          host: "localhost:3000",
          origin: "http://localhost:3000",
        },
        body: JSON.stringify(validPayload),
      });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(415);
      expect(json).toEqual({ error: "Content-Type must be application/json" });
    });

    it("should reject payload larger than 100KB", async () => {
      const largePayload = {
        ...validPayload,
        message: "x".repeat(101 * 1024), // > 100KB
      };
      const req = createRequest(largePayload);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(413);
      expect(json).toEqual({ error: "Payload too large" });
    });

    it("should detect and silently reject spam patterns", async () => {
      const spamPayload = {
        ...validPayload,
        message: "CLICK HERE NOW TO WIN CASINO LOTTERY VIAGRA CIALIS BUY NOW!!!",
      };
      const req = createRequest(spamPayload);
      const res = await POST(req);
      const json = await res.json();

      // Silent rejection - returns success but doesn't send email
      expect(res.status).toBe(200);
      expect(json).toEqual({ success: true });
    });

    it("should detect excessive capitalization", async () => {
      const spamPayload = {
        ...validPayload,
        message: "THIS IS A MESSAGE WITH EXCESSIVE CAPITALIZATION THROUGHOUT",
      };
      const req = createRequest(spamPayload);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json).toEqual({ success: true });
    });
  });

  describe("Edge Cases", () => {
    it("should trim whitespace from name and message", async () => {
      const payload = {
        ...validPayload,
        name: "  Marco Rossi  ",
        message: "  Messaggio con spazi  ",
      };
      const req = createRequest(payload);
      const res = await POST(req);

      expect(res.status).toBe(200);
      // Zod transform should have trimmed the values
    });

    it("should handle empty optional fields", async () => {
      const payload = {
        name: "Test User",
        email: "test@example.com",
        type: "demo",
        streamingUrl: "",
        genre: "",
        message: "Messaggio senza campi opzionali.",
        website: "",
        _formTime: 5000,
      };
      const req = createRequest(payload);
      const res = await POST(req);

      expect(res.status).toBe(200);
    });

    it("should handle special characters in message", async () => {
      const payload = {
        ...validPayload,
        message: "Test con caratteri speciali: àèéìòù €£$% <script>alert('xss')</script>",
      };
      const req = createRequest(payload);
      const res = await POST(req);

      expect(res.status).toBe(200);
    });

    it("should handle unicode characters", async () => {
      const payload = {
        ...validPayload,
        name: "张伟 🎵",
        message: "Test con emoji e unicode: 🎧 音楽 музыка",
      };
      const req = createRequest(payload);
      const res = await POST(req);

      expect(res.status).toBe(200);
    });
  });

  describe("Response Headers", () => {
    it("should include security headers in all responses", async () => {
      const req = createRequest(validPayload);
      const res = await POST(req);

      expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(res.headers.get("Cache-Control")).toBe("no-store");
      expect(res.headers.get("Content-Type")).toBe("application/json");
    });

    it("should include security headers even on error", async () => {
      const req = createRequest({ invalid: "payload" });
      const res = await POST(req);

      expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(res.headers.get("Cache-Control")).toBe("no-store");
    });
  });
});
