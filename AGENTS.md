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
Two deployers, one target (Cloudflare Pages project `metro`, real subdomain
`metro-3q1.pages.dev` — pages.dev names are global — behind `metro.dravec.org`):
- **This repo's `deploy` job** — ships dark until `CLOUDFLARE_API_TOKEN` +
  `CLOUDFLARE_ACCOUNT_ID` (and optionally the `VITE_SUPABASE_*` pair) are copied onto
  this repo. Once they are, a push to `main` here deploys directly.
- **The flywheel hub's `deploy-metro` job** — checks out THIS repo and deploys with the
  hub's secrets; it also owns the custom-domain attach + DNS repoint self-heal. Until
  the secrets are copied, trigger a hub main run (or its workflow_dispatch) to deploy.

## Analytics (Common Platform)
Vendored client: `src/platform/flywheel-client.ts` via `src/analytics.ts` (dep-free
REST shim). Fires `page_view` on load and `conversion` on the first Play press
(watching the network grow is the aha). Env-gated: dark without `VITE_SUPABASE_URL`
+ `VITE_SUPABASE_PUBLISHABLE_KEY` at build time.

## Done means
Green CI · live at metro.dravec.org · portfolio record current.
