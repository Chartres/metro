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
  with Enter/Space; Play and the slider have accessible names.
- Analytics: `conversion` now fires once per browser session instead of once per page
  load, so metro's conversion count steps down from this deploy by definition, not by
  usage. With site storage blocked it falls back to once per page load.

## 1.2.1 — 2026-10-17
- Screen readers announce a station by the name the map shows on that date
  (Leninova before February 1990, Dejvická after).
- The landing view uses the viewer's local date, so just after midnight on the 1st
  it no longer shows the previous month (or, west of UTC, the next one).
- Dropped a 1.2.0 line that claimed a live-region fix main never needed.
- e2e: never reuses a server already on the port (`PW_PORT` picks another), and
  writes screenshots to `e2e/shots/` only with `UPDATE_SHOTS=1`.

## 1.3.0 — 2026-10-27
Deep round (signature, corrections, findability).
- Small multiples: six small maps of the network (1974, 1980, 1990, 2000, 2010, today)
  with station counts, at the top of the timeline; a tap moves the main map there and is
  logged as `key_action` `decade_jump`.
- Growth line: the slider's track is a step chart of stations open on each date, with a
  marker at the current date.
- Corrections. Line D construction began on 21 April 2022, not 1 March. Line D has 8
  stations south of Pankrác in the order Pankrác, Ryšánka (working name Olbrachtova),
  Nádraží Krč, Nemocnice Krč, Nové Dvory, Libuš, Písnice, Depo Písnice; the map had 5, in
  the wrong order. Only Pankrác – Nové Dvory is under construction (from 2022 and June
  2026); the rest is drawn as planned. DPP now expects Pankrác – Nové Dvory in the second
  half of 2032; the app said "late this decade".
- Static history text below the map (openings table, the 1990 renames, floods, Line D, a
  Czech summary) and FAQ structured data, so the page has content without JavaScript.
  Tests hold the text to the map's data.
- Play button is a 44 px touch target; the header emoji is gone.

## 1.4.0 — 2026-10-30
Pavol's picks of 30 October (decision log in `docs/SIGNATURE.md`).
- Small multiples stay at the top of the Timeline panel. Their sixth date, "today", is now the build
  date (Prague calendar date) instead of the viewer's clock; the other five are opening day
  (9 May 1974) and 31 December of 1980, 1990, 2000 and 2010.
- Line D: only the two sections with a construction start are drawn (Pankrác – Ryšánka from
  21 April 2022, Ryšánka – Nové Dvory from 19 June 2026). The dotted "planned" legs (Nové Dvory –
  Depo Písnice, Náměstí Míru – Pankrác), their stations and the legend row are gone. A Line D
  station's detail lists each section through it with its start date and a source link. Both dates
  were re-checked and stand.
- Czech: the short Czech summary became a full Czech section on the same page (openings, renames,
  floods, Line D), marked `lang="cs"`, with a "Česky" link in the header. Structured data lists both
  languages and has Czech FAQ answers; tests hold the Czech text to the data.
- Analytics (`key_action` props): `decade_jump` adds `date`; new actions `line_d_detail` and
  `czech_section_view`.
