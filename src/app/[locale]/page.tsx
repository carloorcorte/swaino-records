import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Swaino Records",
};

export default function LandingPage() {
  const t = useTranslations("landing");

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-32 text-center">
      <p
        className="font-mono text-xs uppercase tracking-widest"
        style={{ color: "var(--text-dim)" }}
      >
        {t("eyebrow")}
      </p>

      <h1
        className="mt-4 text-5xl font-semibold tracking-tight sm:text-7xl"
        style={{ color: "var(--text-primary)" }}
      >
        {t("title")}
      </h1>

      <p
        className="mt-6 max-w-md text-lg"
        style={{ color: "var(--text-muted)" }}
      >
        {t("subtitle")}
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/releases"
          className="rounded-full px-6 py-3 text-sm font-medium transition-colors"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--bg)",
          }}
        >
          {t("cta_secondary")}
        </Link>
        <Link
          href="/contatti"
          className="rounded-full border px-6 py-3 text-sm font-medium transition-colors"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-muted)",
          }}
        >
          {t("cta_primary")}
        </Link>
      </div>
    </div>
  );
}
