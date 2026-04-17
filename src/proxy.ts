import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Exclude: API routes, Next.js internals, static files, and Sanity Studio
  matcher: "/((?!api|trpc|studio|_next|_vercel|.*\\..*).*)",
};
