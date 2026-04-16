---
description: Crea un nuovo componente React riusabile per Swaino Records
---

Crea un nuovo componente React per il sito Swaino Records.

**Input richiesto**: $ARGUMENTS (es. "ArtistCard" o "ui/Badge")

## Dove salvarlo

- Componenti atomici (button, badge, card…) → `src/components/ui/`
- Sezioni di pagina → `src/components/sections/`
- Layout → `src/components/layout/`

## Regole

- Server Component di default. Aggiungi `"use client"` solo se il componente usa hooks o event handlers.
- Props tipizzate con `interface`, mai `type` inline non riusabile
- Niente `any`, niente prop opzionali non usate
- Esporta il componente come `export default` e il tipo come named export se utile altrove
- Tailwind v4, sfondo dark di default

## Esempio struttura

```tsx
interface $ARGUMENTSProps {
  // props qui
}

export default function $ARGUMENTS({ }: $ARGUMENTSProps) {
  return (
    // JSX
  )
}
```
