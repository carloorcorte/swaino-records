import type { Metadata } from "next";
import { useTranslations } from "next-intl";

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

      <div className="mt-10">
        <p className="text-sm" style={{ color: "var(--text-dim)" }}>
          {t("email_label")}
        </p>
        <a
          href="mailto:info@swainorecords.com"
          className="mt-2 inline-block text-lg font-medium transition-colors"
          style={{ color: "var(--text-primary)" }}
        >
          info@swainorecords.com
        </a>
      </div>
    </div>
  );
}
