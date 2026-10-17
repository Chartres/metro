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

## 1.2.0 — 2026-10-17
Sweep consolidation (#3, #4, #5 folded into #6).
- Map data: Line B station order Jinonice → Radlická → Smíchovské nádraží → Anděl;
  Strašnická opened 1987-07-11, Skalka 1990-07-04; the 1985 Line B opening flashes
  all 7 stations; Line B stays drawn through the 1998–2001 infill gap; the station
  total comes from the data.
- Timeline: an event click shows that event's date (map and label); the landing view
  shows today's month; Play from today or later replays from 1974 and flashes opening
  day once; dates no longer show a day early west of UTC.
- Interaction and accessibility: tooltips use the name in use on the shown date;
  hidden stations ignore clicks and leave the tab order; stations and events work
  with Enter/Space; Play and the slider have accessible names; the date label is no
  longer a live region (it flooded screen readers during Play).
- Analytics: `conversion` now fires once per browser session instead of once per page
  load, so metro's conversion count steps down from this deploy by definition, not by
  usage. With site storage blocked it falls back to once per page load.
