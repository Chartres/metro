# Changelog — Metro

## 1.0.0 — 2026-08-28
- First release: interactive Prague Metro history map (1974 → today + Line D
  under construction), play-through timeline, 22 dated events, station detail
  with opening dates and communist-era former names.
- Fixed on import: "Lines running" now counts lines with an open segment —
  interchange stations no longer claim 3 lines on 1974 opening day.
- Live at https://metro.dravec.org (Cloudflare Pages, project `metro`).

## 1.1.0 — 2026-09-01
- Line D recolored to its official blue ("the blue metro") across segments,
  station outlines, timeline tags and legend; added the paper-only phase-II
  leg Náměstí Míru–Pankrác as a lighter dotted line with its own legend row.
- Phone layout: full-bleed map at content aspect, legend strip below the map,
  stacked panels (shipped in the hub as flywheel#32).
- Extracted from the flywheel hub's apps/metro into this repo.
