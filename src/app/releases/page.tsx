import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Releases",
  description: "Il catalogo di Swaino Records.",
};

export default function ReleasesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-20">
      <h1 className="text-4xl font-semibold tracking-tight">Releases</h1>
      <p className="mt-4 text-zinc-400">Il catalogo è in arrivo.</p>
    </div>
  );
}
