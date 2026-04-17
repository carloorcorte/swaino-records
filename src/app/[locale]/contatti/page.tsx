import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = { title: "Contatti" };

export default function ContattiPage() {
  const t = useTranslations("contatti");

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-20">
      <h1
        className="text-4xl font-semibold tracking-tight"
        style={{ color: "var(--text-primary)" }}
      >
        {t("title")}
      </h1>
      <p className="mt-3 text-base" style={{ color: "var(--text-muted)" }}>
        {t("subtitle")}
      </p>

      <p className="mt-4 text-sm" style={{ color: "var(--text-dim)" }}>
        {t("intro")}
      </p>
      <p className="mt-1 text-sm" style={{ color: "var(--text-dim)" }}>
        {t("response_time")}!
      </p>

      <ContactForm />
    </div>
  );
}
