import type { Metadata } from "next";
import { useTranslations } from "next-intl";

export const metadata: Metadata = { title: "Marketplace" };

export default function MarketplacePage() {
  const t = useTranslations("marketplace");

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-32 text-center">
      <p
        className="font-mono text-xs uppercase tracking-widest"
        style={{ color: "var(--text-dim)" }}
      >
        {t("subtitle")}
      </p>

      <h1
        className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl"
        style={{ color: "var(--text-primary)" }}
      >
        {t("title")}
      </h1>

      <p
        className="mt-6 max-w-sm text-base"
        style={{ color: "var(--text-muted)" }}
      >
        {t("coming_soon")}
      </p>
    </div>
  );
}
