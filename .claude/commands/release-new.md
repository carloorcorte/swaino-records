---
description: Aggiunge una nuova release (singolo, EP o album) al catalogo di Swaino Records
---

Aggiungi una nuova release al catalogo di Swaino Records.

**Input richiesto**: $ARGUMENTS (es. "Titolo - Artista - tipo:single")

## Passi

1. Chiedi (o ricava dall'input) i dati della release:
   - `title`, `artist` (slug), `releaseDate` (YYYY-MM-DD), `type` (single/ep/album)
   - Lista tracce con titolo e durata
   - Link streaming (Spotify, Apple Music, YouTube) se disponibili

2. Se i dati delle release sono in un file statico (es. `src/data/releases.ts`), aggiorna quel file seguendo lo schema `Release` definito nel content-manager agent.

3. Se la route `/releases/[slug]` non esiste ancora, creala con `/page-new`.

4. Verifica che il metadata SEO sia completo: title, description, openGraph.image.

## Formato slug

Converti il titolo in lowercase con trattini: "Nome Album 2024" → "nome-album-2024"
