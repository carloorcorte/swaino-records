import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Artisti",
  description: "Il roster di Swaino Records.",
};

export default function ArtistiPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-20">
      <h1 className="text-4xl font-semibold tracking-tight">Artisti</h1>
      <p className="mt-4 text-zinc-400">Il roster è in arrivo.</p>
    </div>
  );
}
