"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const t = useTranslations("nav");
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/releases", label: t("releases") },
    { href: "/marketplace", label: t("marketplace") },
    { href: "/contatti", label: t("contatti") },
  ] as const;

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
    >
      {/* ── Desktop bar ────────────────────────────────────── */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="font-mono text-sm font-semibold uppercase tracking-widest transition-colors"
          style={{ color: "var(--text-primary)" }}
          onClick={() => setMobileOpen(false)}
        >
          Swaino Records
        </Link>

        {/* Nav links — hidden su mobile */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-sm transition-colors hover:text-[var(--text-primary)]"
                style={{ color: "var(--text-muted)" }}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Destra: locale switcher + theme toggle + hamburger */}
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <ThemeToggle />

          {/* Hamburger — solo mobile */}
          <button
            className="flex h-8 w-8 flex-col items-center justify-center gap-1.5 md:hidden"
            aria-label={mobileOpen ? "Chiudi menu" : "Apri menu"}
            onClick={() => setMobileOpen((o) => !o)}
          >
            <span
              className="block h-px w-5 transition-all duration-200"
              style={{
                backgroundColor: "var(--text-primary)",
                transform: mobileOpen
                  ? "translateY(4px) rotate(45deg)"
                  : "none",
              }}
            />
            <span
              className="block h-px w-5 transition-all duration-200"
              style={{
                backgroundColor: "var(--text-primary)",
                opacity: mobileOpen ? 0 : 1,
              }}
            />
            <span
              className="block h-px w-5 transition-all duration-200"
              style={{
                backgroundColor: "var(--text-primary)",
                transform: mobileOpen
                  ? "translateY(-4px) rotate(-45deg)"
                  : "none",
              }}
            />
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ──────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="border-t px-6 py-4 md:hidden"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
        >
          <ul className="flex flex-col gap-4">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="block text-base transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
