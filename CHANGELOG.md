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
- Small phones: the history tables fit a 320 px screen without sideways scroll (main already
  overflowed by 21 px there).

## 1.5.0 — 2026-11-01
Pavol's picks of 1 November (decision log in `docs/SIGNATURE.md`).
- Date links: `?date=YYYY-MM-DD&station=<id>` opens the map on that day with that station
  selected. A date that isn't a real day between 9 May 1974 and today, or a station the map
  doesn't draw, is ignored and the map opens on today. The station detail has a "Copy link to
  this day" button (it shows the link to copy by hand where the browser has no clipboard).
  Logged as `key_action` `link_opened` {date, station, fallback}.
- Correction log: a dated "Corrections" list below the Line D text, and "Opravy" in the Czech
  section: what the map had wrong, what it says now, and the source. Oldest first; the first
  entry is the Line D start date (1 March 2022 → 21 April 2022).
- The Line D paragraph now cites its two start dates in the text (ČTK for 21 April 2022, ČT24 for
  19 June 2026), in English and Czech, from the same links as the station detail.

## 1.6.0 — 2026-11-01
Pavol's second set of picks of 1 November (decision log in `docs/SIGNATURE.md`).
- Correction log: the fixes of 17 October are now dated entries, in English and Czech, each with
  its Wikipedia source (re-checked 1 November): line B station order from Nové Butovice to
  Anděl, the Strašnická and Skalka opening dates (11 July 1987, 4 July 1990), and the 1985 line B
  opening (all 7 stations of the section highlighted, not 4). The log now runs newest first, so the 27–28 October entries stay
  on top; the note pointing to this changelog for the 17 October fixes is gone.
- Copied links are counted: each press of "Copy link to this day" sends `key_action`
  `link_copied` {date, station}, also when the browser has no clipboard and the link is shown
  to copy by hand.

## 1.7.0 — 2026-11-04
Iterate round of 4 November (decision log in `docs/SIGNATURE.md`).
- The openings tables (English and Czech) name their sources line by line, checked 4 November,
  and say where the sources disagree: for Kačerov – Háje, the table in English Wikipedia's Line C
  article gives 11 November 1980, while the Czech article and English Wikipedia's Háje article
  give 7 November 1980, which the map uses. The Czech Line C article's own table also differs from
  its text for 1984 and 2004 (7 Nov vs 3 Nov 1984, 25 vs 26 June 2004); the page names both, and
  the map uses the text's dates, which the English article shares.
- Station names in the list are row headers (`<th scope="row">`) for screen readers.
- A list of all 58 stations, A–Z, with line, opening date (each line's date for an interchange)
  and name until 1990, in English and Czech, readable without JavaScript. It opens from a
  44 px summary; tests hold it to the map's data.
- Correction: the station is I. P. Pavlova (with spaces), not "I.P.Pavlova". Logged in
  Corrections and Opravy.
- Station detail: opening dates read "12 August 1978", not "1978-08-12". Before February 1990 it
  says what the station was renamed to ("Renamed Dejvická on 22 February 1990") instead of
  repeating the name shown in the heading. After the rename, "Former name: Leninova (until
  22 February 1990)" gives the day, where it gave only the month.
- At 390 px an opening date no longer splits across two lines in the openings table.
- llms.txt describes the station list and the sources; sitemap lastmod 2026-11-04.

## 1.8.0 — 2026-11-05
Visual signature, approved by Pavol on 5 November (decision log in `docs/SIGNATURE.md`).
- Station names and dates are set in Metro Sign Sans, the closest free face to Jiří Rathouský's
  Metron (the 1970s metro signage). It is Encode Sans (SIL OFL 1.1) at width 112.5, subset to
  Latin + Czech, renamed as the OFL requires, and self-hosted as one 28 KB woff2 with
  `font-display: swap`. The licence is in `public/fonts/OFL.txt`; `scripts/build-font.py`
  rebuilds the file.
- Every text size is one of taste.md's steps (13 / 17 / 20), and nothing is under 13 px. The
  sidebar's 10.5–12.8 px sizes, the header, controls, legend and tooltip all moved.
- The date label keeps one width for every month, so Play no longer shifts the slider.
- Tests: font budget (≤ 60 KB, same origin, no font CDN), Czech glyph coverage, which elements
  use the face, the four steps at 390 px and on desktop, and that the page looks the same under
  a light or dark colour-scheme preference. Before/after shots are in `e2e/shots/type-*`.
