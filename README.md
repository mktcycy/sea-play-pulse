# SEA Play Pulse

A mobile-first **game discovery & market-trend** demo for Vietnam and the Philippines.
Not a casino review site — the core idea is *"see what your market is playing today."*

**▶ Live demo:** https://mktcycy.github.io/sea-play-pulse/

> Demo only · **all data is mock** · no real money · no sign-up · no real API.

## Stack

React · TypeScript · Vite · Tailwind CSS · Recharts · lucide-react
(uses `react-router-dom` for pages; a tiny built-in i18n — no i18n library)

## Run (bun)

```bash
bun install
bun run dev        # http://localhost:5173
bun run typecheck  # tsc --noEmit
bun run build      # type-check + production build
bun run preview    # preview the build
```

npm/pnpm/yarn work the same (`npm install`, `npm run dev`, …).

## What's inside

| Area | Where |
|---|---|
| Pages | `src/pages/` — Home, Pulse (rankings), Match (quiz), GameDetail, Compare, Duel, Saved, Checker, Discover, Categories, More |
| Mock data | `src/data/` — `games.ts` (22 games), `boards.ts`, `quiz.ts`, `duel.ts`, `checker.ts`, `categories.ts`, `tags.ts` |
| State | `src/context/` — market/language, saved (localStorage), toasts, demo modal |
| i18n | `src/i18n/index.ts` — `zh` (internal review), `vi` (VN default), `en` (PH default) |
| UI kit | `src/components/` — GameCard, GameThumb (procedural, never broken), Bits (rank/trend/heat/stars/bars), Skeleton, EmptyState, PulseLine (signature), charts |

## Markets & language

- Header market switch (🇻🇳 / 🇵🇭) re-tints the local accent and swaps ranked data.
- Switching to Vietnam auto-selects Vietnamese; Philippines auto-selects English.
- Language can still be overridden manually (中 / VI / EN).

## Notes for the next engineer

- Game data is generated from curated seeds in `src/data/games.ts` (`SEEDS` + `build()`);
  ranks/counts/trends are derived deterministically so they're stable across reloads.
- Thumbnails are procedural SVGs (`GameThumb`) keyed on category — swap in real art by
  giving each `Game.image` a URL and rendering an `<img>` fallback.
- The platform checker is a **mock** (`src/data/checker.ts`) — it never calls a real
  registry and never claims a platform is safe. Copy avoids guaranteed-profit language.
- Persisted keys: `spp.market`, `spp.lang`, `spp.saved.v1` (saved / recent / compare /
  votes / ratings / quiz result).
