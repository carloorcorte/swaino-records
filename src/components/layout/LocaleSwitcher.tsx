"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const localeLabels: Record<string, string> = {
  it: "IT",
  en: "EN",
  es: "ES",
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next });
  }

  return (
    <div className="flex items-center gap-1">
      {routing.locales.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && (
            <span className="text-[var(--text-dim)] text-xs select-none">
              /
            </span>
          )}
          <button
            onClick={() => switchLocale(l)}
            className={[
              "font-mono text-xs uppercase tracking-widest px-1 py-0.5 transition-colors",
              l === locale
                ? "text-[var(--text-primary)]"
                : "text-[var(--text-dim)] hover:text-[var(--text-muted)]",
            ].join(" ")}
          >
            {localeLabels[l]}
          </button>
        </span>
      ))}
    </div>
  );
}
