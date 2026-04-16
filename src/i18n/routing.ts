import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["it", "en", "es"],
  defaultLocale: "it",
  localePrefix: "as-needed", // italiano = /, inglese = /en, spagnolo = /es
});
