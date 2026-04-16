import type { Metadata } from "next";
import { useTranslations } from "next-intl";

export const metadata: Metadata = { title: "Releases" };

export default function ReleasesPage() {
  const t = useTranslations("releases");

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

      {/* Griglia releases — placeholder */}
      <div
        className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      >
        {/* Quando ci saranno i dati, mappa qui i ReleaseCard */}
        <p className="col-span-full mt-8 text-sm" style={{ color: "var(--text-dim)" }}>
          {t("empty")}
        </p>
      </div>
    </div>
  );
}
