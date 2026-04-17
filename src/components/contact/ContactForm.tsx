"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { contactSchema, type ContactFormData } from "@/lib/schemas/contact";
import { ContactFormField } from "./ContactFormField";

type FormStatus = "idle" | "loading" | "success" | "error" | "rate_limited";
type FieldErrors = Partial<Record<keyof ContactFormData, string[]>>;

const CONTACT_TYPES = ["demo", "press", "booking", "other"] as const;

export function ContactForm() {
  const t = useTranslations("contatti");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formLoadTime] = useState(() => Date.now());
  const successRef = useRef<HTMLDivElement>(null);

  // Campi form
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [streamingUrl, setStreamingUrl] = useState("");
  const [genre, setGenre] = useState("");
  const [publication, setPublication] = useState("");
  const [pressType, setPressType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "success" && successRef.current) {
      successRef.current.focus();
    }
  }, [status]);

  function getNamePlaceholder() {
    if (type === "demo") return t("name_placeholder_demo");
    if (type === "press") return t("name_placeholder_press");
    if (type === "booking") return t("name_placeholder_booking");
    return t("name_placeholder_other");
  }

  function getMessagePlaceholder() {
    if (type === "demo") return t("message_placeholder_demo");
    if (type === "press") return t("message_placeholder_press");
    if (type === "booking") return t("message_placeholder_booking");
    return t("message_placeholder_other");
  }

  function mapError(key: string | undefined): string | undefined {
    if (!key) return undefined;
    const map: Record<string, string> = {
      name_min: t("error_name_min"),
      name_max: t("error_name_max"),
      email_invalid: t("error_email_invalid"),
      type_required: t("error_type_required"),
      url_invalid: t("error_url_invalid"),
      message_min: t("error_message_min"),
      message_max: t("error_message_max"),
    };
    return map[key] ?? key;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const payload = {
      type,
      name,
      email,
      streamingUrl,
      genre,
      publication,
      pressType,
      eventDate,
      message,
      website: "",
      _formTime: Date.now() - formLoadTime,
    };

    // Validazione client-side
    const result = contactSchema.safeParse(payload);
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors as FieldErrors);
      return;
    }
    setErrors({});
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 429) {
        setStatus("rate_limited");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.errors) setErrors(data.errors as FieldErrors);
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          border: "1px solid var(--border)",
          borderRadius: "0.75rem",
          backgroundColor: "var(--surface)",
          outline: "none",
        }}
      >
        <p
          style={{
            fontWeight: 600,
            fontSize: "1.125rem",
            color: "var(--text-primary)",
          }}
        >
          {t("success_title")}
        </p>
        <p
          style={{ marginTop: "0.5rem", color: "var(--text-muted)" }}
        >
          {t("success_body")}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{ marginTop: "2.5rem", display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "36rem" }}
    >
      {/* Tipo richiesta */}
      <ContactFormField
        as="select"
        name="type"
        label={t("type_label")}
        required
        error={mapError(errors.type?.[0])}
        value={type}
        onChange={(e) => { setType(e.target.value); setErrors({}); }}
      >
        <option value="" disabled>{t("type_placeholder")}</option>
        {CONTACT_TYPES.map((ct) => (
          <option key={ct} value={ct}>{t(`type_${ct}`)}</option>
        ))}
      </ContactFormField>

      {/* Campi comuni (visibili solo dopo la selezione del tipo) */}
      {type && (
        <>
          <ContactFormField
            name="name"
            label={t("name_label")}
            required
            placeholder={getNamePlaceholder()}
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={mapError(errors.name?.[0])}
            autoComplete="name"
          />

          <ContactFormField
            name="email"
            type="email"
            label={t("email_label_field")}
            required
            placeholder={t("email_placeholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={mapError(errors.email?.[0])}
            autoComplete="email"
          />

          {/* Campi specifici Demo */}
          {type === "demo" && (
            <>
              <ContactFormField
                name="streamingUrl"
                type="url"
                label={t("streaming_url_label")}
                required
                placeholder={t("streaming_url_placeholder")}
                value={streamingUrl}
                onChange={(e) => setStreamingUrl(e.target.value)}
                error={mapError(errors.streamingUrl?.[0])}
              />
              <ContactFormField
                name="genre"
                label={t("genre_label")}
                placeholder={t("genre_placeholder")}
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              />
            </>
          )}

          {/* Campi specifici Press */}
          {type === "press" && (
            <>
              <ContactFormField
                name="publication"
                label={t("publication_label")}
                placeholder={t("publication_placeholder")}
                value={publication}
                onChange={(e) => setPublication(e.target.value)}
              />
              <ContactFormField
                as="select"
                name="pressType"
                label={t("press_type_label")}
                value={pressType}
                onChange={(e) => setPressType(e.target.value)}
              >
                <option value="">{t("press_type_placeholder")}</option>
                <option value="interview">{t("press_type_interview")}</option>
                <option value="review">{t("press_type_review")}</option>
                <option value="accreditation">{t("press_type_accreditation")}</option>
              </ContactFormField>
            </>
          )}

          {/* Campi specifici Booking */}
          {type === "booking" && (
            <ContactFormField
              name="eventDate"
              type="date"
              label={t("event_date_label")}
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          )}

          {/* Messaggio */}
          <ContactFormField
            as="textarea"
            name="message"
            label={t("message_label")}
            required
            placeholder={getMessagePlaceholder()}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            maxLength={1000}
            error={mapError(errors.message?.[0])}
          />

          {/* Honeypot — nascosto visivamente e ai bot */}
          <div className="honeypot-field" aria-hidden="true">
            <label htmlFor="website-hp">Non compilare</label>
            <input
              type="text"
              id="website-hp"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              defaultValue=""
            />
          </div>

          {/* Errore globale */}
          {(status === "error" || status === "rate_limited") && (
            <div role="alert" aria-live="assertive">
              <p style={{ fontSize: "0.875rem", color: "#ef4444" }}>
                {status === "rate_limited" ? t("error_rate_limit") : t("error_generic")}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === "loading"}
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--bg)",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.75rem 1.5rem",
              fontWeight: 600,
              fontSize: "0.9375rem",
              cursor: status === "loading" ? "not-allowed" : "pointer",
              opacity: status === "loading" ? 0.7 : 1,
              transition: "opacity 0.15s",
              alignSelf: "flex-start",
            }}
          >
            {status === "loading" ? t("submitting") : t("submit")}
          </button>
        </>
      )}
    </form>
  );
}
