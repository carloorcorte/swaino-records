import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer
      className="border-t"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="mx-auto max-w-6xl px-6 py-6 text-center text-xs"
        style={{ color: "var(--text-dim)" }}>
        © {new Date().getFullYear()} Swaino Records. {t("rights")}
      </div>
    </footer>
  );
}
