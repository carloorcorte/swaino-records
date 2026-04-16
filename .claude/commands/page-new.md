---
description: Crea una nuova pagina Next.js con route, metadata e struttura base
---

Crea una nuova pagina Next.js App Router per il sito Swaino Records.

**Input richiesto**: $ARGUMENTS (es. "about" o "artisti/[slug]")

## Cosa generare

1. `src/app/$ARGUMENTS/page.tsx` con:
   - Export `metadata` tipizzato (`Metadata` da `next`)
   - Componente default con layout coerente al resto del sito (sfondo nero, testo bianco, `max-w-6xl mx-auto px-6 py-20`)
   - TypeScript strict (niente `any`)

2. Se la route ha un parametro dinamico (es. `[slug]`):
   - Aggiungi `generateStaticParams` se i dati sono statici
   - Tipia correttamente `params: Promise<{ slug: string }>`

## Stile

Mantieni l'estetica dark del sito: `bg-black text-white`. Usa Tailwind v4, niente CSS modules.
