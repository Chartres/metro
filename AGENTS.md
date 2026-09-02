# AGENTS.md — Metro

The build/test/release contract for this repo. An agent should be able to read only this
file and ship correctly. Taste rules: the flywheel hub's `docs/standards/taste.md`
(https://github.com/Chartres/flywheel).

> One-liner: Prague Metro — growth through time. Interactive map of every extension,
> rename and closure since 1974, with a play-through timeline.
> Stack/template: web-static (framework-free single-page, Vite wrapper) · Track: pet
> Portfolio record: `flywheel/data/products/metro.json`

**Repo note:** extracted from the flywheel hub's `apps/metro/` on 2026-09-01 (the debt
recorded at creation — the GitHub App couldn't create repositories then).

## Build
```bash
npm ci
npm run build     # vite build → dist/
```

## Test (persona-journey e2e per primary journey)
```bash
npm run typecheck                                   # tsc --noEmit
npm test                                            # vitest: analytics REST shim
PW_CHROMIUM=/opt/pw-browsers/chromium npm run test:e2e   # 5 persona journeys + shots (e2e/shots/)
```
Gate: typecheck · test · build must pass. The app itself is a single `index.html` —
all domain logic (station data, timeline, renames) lives inline there; the e2e suite
is the gate that protects it.

## Run / verify a change in the real app
```bash
npm run dev        # vite dev server
```
Then scrub the timeline: opening day 1974 must show exactly 9 stations / 1 line, and
pre-1990 dates must show communist-era names (Leninova, Gottwaldova, …).

## Release (the finish line)
Push to `main` → **Cloudflare Pages builds and deploys it** (Git integration, wired by
the flywheel hub's `connect-pages` workflow): project `metro`, real subdomain
`metro-3q1.pages.dev`, custom domain `metro.dravec.org`. Every PR gets a preview URL.
This repo holds no deploy job and no Cloudflare secrets — credentials live in Cloudflare.
Build settings + `VITE_SUPABASE_*` env vars are on the Cloudflare project; change them
by re-running `connect-pages` (idempotent), not here.

## Analytics (Common Platform)
Vendored client: `src/platform/flywheel-client.ts` via `src/analytics.ts` (dep-free
REST shim). Fires `page_view` on load and `conversion` on the first Play press
(watching the network grow is the aha). Env-gated: dark without `VITE_SUPABASE_URL`
+ `VITE_SUPABASE_PUBLISHABLE_KEY` at build time.

## Done means
Green CI · live at metro.dravec.org · portfolio record current.
