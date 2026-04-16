import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contatti",
  description: "Contatta Swaino Records.",
};

export default function ContattiPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-20">
      <h1 className="text-4xl font-semibold tracking-tight">Contatti</h1>
      <p className="mt-4 text-zinc-400">
        Per collaborazioni e informazioni scrivi a{" "}
        <a
          href="mailto:info@swainorecords.com"
          className="text-white underline underline-offset-4 hover:no-underline"
        >
          info@swainorecords.com
        </a>
      </p>
    </div>
  );
}
