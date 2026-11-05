# SIGNATURE — Metro

What this product draws on, what it refuses, and the mechanics that follow. Written for the
deep round of 27–29 October 2026 (flywheel `docs/program/2026-10-27-deep-round.md`).

## Lineage

1. **Harry Beck, London Underground diagram, 1933.**
   https://www.ltmuseum.co.uk/collections/stories/design/harry-becks-tube-map
   Beck dropped geography and kept what a rider needs: order, connections, line colour.
   `changes:` the map stays a diagram with no basemap. Line colours are DPP's and never
   remapped. Interchanges are drawn as rings, and only from the day the second line reaches
   them. The small multiples go further: lines only, no stations, no labels.

2. **Charles Joseph Minard, *Carte figurative des pertes successives en hommes de l'Armée
   française dans la campagne de Russie 1812–1813*, 1869.**
   https://en.wikipedia.org/wiki/Charles_Joseph_Minard
   Minard drew the size of the army as the width of its path, so the quantity and the route
   are one line.
   `changes:` the timeline slider's track is now a step chart of stations open on each date
   (the **growth line**). Where the network grew is visible before you touch the slider; a
   marker rides the current date.

3. **Edward Tufte, *Envisioning Information*, 1990 (ch. 4, "Small Multiples"); *The Visual
   Display of Quantitative Information*, 1983 (data-ink).**
   https://www.edwardtufte.com/book/envisioning-information/
   "At the heart of quantitative reasoning is a single question: Compared to what?" Small
   multiples answer it by repeating one design at several moments.
   `changes:` six maps of the same network (1974, 1980, 1990, 2000, 2010, today) side by side
   at the top of the timeline, each with its station count, each a button that moves the main
   map there. Data-ink: no gradients or decoration added to either mechanic.

4. **Kevin Lynch, *The Image of the City*, 1960.**
   https://mitpress.mit.edu/9780262620017/the-image-of-the-city/
   People hold a city as paths, nodes, edges, districts and landmarks.
   `changes:` the timeline's events are written as changes to paths and nodes (a line reaches
   a district, an interchange appears), and station detail answers "when did my station
   open, and what was it called then?" — the node a person actually knows.

5. **Erasmus and the humanists, *ad fontes* (c. 1500).**
   https://en.wikipedia.org/wiki/Ad_fontes
   Back to the sources, and correct the copies.
   `changes:` every date in the app is checked against DPP and Wikipedia, and the static
   history text is held to the map's data by tests (`e2e/history-text.spec.ts`). This round
   corrected three things we had wrong (Line D construction start, Line D stations and their
   order, the 2029 opening estimate) and the changelog says so.

## Refused

- **Quiz-ification.** No "guess the year", no points, no badges. It's a reference you look
  at, not a game you play.
- **Cartoon emoji and decoration.** The 🚇 in the header is gone. No confetti, mascots,
  purple gradients, glass blobs or "✨".
- **Engagement tricks.** No streaks, no "come back tomorrow", no sign-up wall, no cookie
  banner (analytics are cookieless and first-party).
- **Geography for its own sake.** A basemap would make the map look richer and read worse
  (Vignelli's 1972 New York diagram is often cited as the counter-example; Beck is the
  model).
- **Claims we can't back.** Line D gets DPP's current estimate with its source, not a
  hopeful date. The map draws only the Line D sections with a construction start (1.4.0);
  sections that exist only on paper are not drawn.

## Signature mechanics

| Mechanic | What the user sees | From | Status | How we'll know |
|---|---|---|---|---|
| Small multiples | Six small maps at the top of the Timeline panel: opening day (9 May 1974), 31 December of 1980, 1990, 2000 and 2010, and today (the build date), with station counts (9, 22, 38, 47, 54, 58); a tap moves the main map to that date | Tufte 1990 | shipped (1.3.0; dates fixed 1.4.0) | `key_action` with `action: decade_jump`; share of visitors with ≥ 1 jump. Target: ≥ 20 % of visitors over 28 days. At 6 visitors a month the number is anecdotal until traffic grows. |
| Growth line | The slider track is a step chart of stations open; a marker rides the current date | Minard 1869, Tufte's sparklines | shipped (1.3.0) | No event of its own (it's read, not clicked). Indirect: the Play conversion share (`conversion` / visitors) holds or rises after release. |
| Date links | `?date=1988-10-26&station=dejvicka` opens the map on that day with that station selected, so a teacher or a forum post can point at one moment; the station detail copies a link to the current day and station | Beck's map as a shared object; *ad fontes* (cite a precise state) | shipped (1.5.0) | `key_action` `link_opened` {date, station, fallback}; `link_copied` {date, station} per copy (1.6.0); links seen in referrers |
| Signage type | Station names and dates in Metro Sign Sans (Encode Sans 112.5, OFL), the closest free face to Rathouský's Metron; every size on taste.md's four steps | Rathouský, Metron (1970–73) | shipped (1.8.0), approved 2026-11-05 | No event (it is read, not clicked). Indirect: Play conversion share holds; no rise in bounce at 390 px |
| Correction log | A dated "Corrections" list on the page (and "Opravy" in the Czech section): what we had wrong, what it is now, the source | *ad fontes* | shipped (1.5.0; 17 Oct fixes backfilled, newest first, 1.6.0) | Reader-filed issues per quarter; first external citation |

## Visual signature

The Prague metro has its own design tradition: Jiří Rathouský's orientation system and the
metro logo of the early 1970s (https://cs.wikipedia.org/wiki/Ji%C5%99%C3%AD_Rathousk%C3%BD),
with strong line colours on dark ground and plain grotesque lettering. Rathouský's signage face
is **Metron**, commissioned by DPP in 1970, first shown in the Metroprojekt manual of 1973 and
used for lines A and C (https://fontsinuse.com/typefaces/38516/metron). It has been fading from
the stations since the mid-1980s, when Helvetica replaced it. Storm Type digitised it in 2004 as
a commercial family (https://www.stormtype.com/families/metron).

**Approved by Pavol on 2026-11-05 ("Yes do it"), shipped in 1.8.0.**

- **Station names and dates are set in Metro Sign Sans.** This is Encode Sans (SIL OFL 1.1,
  The Encode Project Authors) instanced at width 112.5, subset to Latin and Czech, and renamed,
  because the OFL reserves the name "Encode Sans" for unmodified copies. It is self-hosted as one
  28 KB variable woff2 (weights 400–700) with `font-display: swap`, with no font CDN, and the
  licence ships beside it (`public/fonts/OFL.txt`). `scripts/build-font.py` rebuilds it.
  - It is the closest free match to Metron. Six OFL/UFL candidates were set beside Metron's
    specimen: Titillium Web, Barlow, Saira, Exo 2, Fira Sans and Ubuntu, plus Encode Sans and
    Signika. Encode Sans at 112.5 matches best: squarish rounded bowls, straight-cut terminals,
    open apertures, a splayed M and a similar width. The others were too condensed (Titillium,
    Barlow), too technical (Saira, Exo 2) or too calligraphic (Fira, Ubuntu, Signika).
  - Where it appears: map labels, the tooltip and detail headings, the date label, the
    small-multiple years, event dates, and the dates and station names in the history tables.
    Prose stays in the system face.
- **Four type steps everywhere.** Every text size on the page is one of 13 / 17 / 20 px (Display
  28 isn't used), and nothing is under 13 px. A test checks this at 390 px and on desktop.
- **The dark ground stays.** The colour-scheme preference does not change the page: white on dark
  is the signage. A test holds this.

## Founder lens

Pavol's constitution, cited by article number:

- **II (the order: faith, family, body, craft, money).** Metro is a pet product. It costs
  nothing to run (Cloudflare Pages, free Supabase tier) and needs no attention between
  sweeps. Nothing in it asks for a reply, a moderation queue or a support inbox.
- **VI (the moat is distribution, reputation, frozen judgment and relationships; nothing is
  finished until it reaches the people it's for).** Before this round a crawler saw a title
  and an empty map, and the site appeared for none of seven test queries. The static history
  text, FAQ data and a Czech summary are the first step to reaching the people who ask. The
  reputation bet is accuracy: the one place with a complete, correct rename list in both
  languages.
- **VIII (never lie, cheat or trick anyone).** Facts are tested against the data, errors are
  disclosed when fixed, and there are no dark patterns to remove.

**Differentiation that follows:** a small, exact, honest reference that shows any day of the
network's history in one view, with sources, and doesn't try to keep you.

## Decision log

### 2026-10-30 — Pavol's picks (decision page of 30 Oct)

1. **Small multiples: top of the Timeline panel.** They already were (1.3.0): first child of the
   Timeline panel, above the events, on desktop and at 390 px. Kept there; a test now holds it.
2. **The six dates: opening day, the year-ends of 1980/1990/2000/2010, today.** Opening day checked
   against the data: 9 May 1974. Year-ends are 31 December. "Today" is now the build date (Prague
   calendar date, stamped by `vite.config.ts`), not the viewer's clock. Each multiple keeps its station
   count and stays a button that moves the main map to its date.
3. **Line D: only sections with a construction start.** Pankrác – Ryšánka (21 April 2022) and Ryšánka –
   Nové Dvory (19 June 2026) are drawn as under construction; nothing is drawn for Nové Dvory – Depo
   Písnice or Náměstí Míru – Pankrác. Station detail gives each section's start date and a source.
   Both dates checked on 2026-10-30: 21 April 2022 per ČTK's same-day report of DPP's ceremonial
   start; 19 June 2026 per ČT24 (ceremony that Friday) and DPP's press release of 18 September 2026
   ("almost exactly three months since construction began"). Neither needed changing.
4. **Czech content: a Czech section on the same page.** A full Czech section (`lang="cs"`) inside the
   history article carries the same facts as the English one (openings table, renames, floods,
   Line D), with a "Česky" link in the header. Structured data lists both languages and carries four
   Czech FAQ answers, each held by a test to the visible Czech text. One URL, so the sitemap keeps
   one entry (lastmod bumped).
5. **Not picked, left as they are.** The growth line stays live, waiting for his review. Date links
   and the correction log stay proposed and are not built.

Metrics, all in the existing taxonomy (`key_action` + props, no new event names):
`decade_jump` gains a `date` prop; `line_d_detail` {station, sections} when a Line D station's detail
opens; `czech_section_view` {via: link | scroll} once per page load.

**Reuse across products.** Pavol decided that a move approved for one product may be reused by
another, with this note: "Dont just blindly copy the pattern though."

### 2026-11-01 — Pavol's picks (decision page of 1 Nov)

1. **Date links: build it.** `?date=YYYY-MM-DD&station=<id>` opens the map on that day with that
   station selected; the station detail has "Copy link to this day" (current date and station). A
   date that isn't a real calendar day between opening day (9 May 1974) and the viewer's today, or a
   station the map doesn't draw (unknown id, or a Line D station with no construction start), is
   ignored quietly: today, and no station selected. A valid station with a bad date opens on today
   with the station. A station not yet open on the linked date is still selected (its detail gives the
   opening date). The URL bar is not rewritten as the map moves. Metric: `key_action` `link_opened`
   {date (shown), station (or null), fallback (true if any given value was ignored)}, fired once
   per load, only when the URL has `date` or `station`.
2. **Correction log: build it.** On the same page (the smaller change than a /corrections/ route):
   "Corrections" after the Line D text, "Opravy" in the Czech section, the same entries in both,
   oldest first, each with its date, what we had, what it is, and a source link. The first entry is
   founder case 2's date error (Line D start 1 March 2022 → 21 April 2022). The log starts with the
   27 October round; the 17 October fixes are pointed to in the changelog, not re-listed.
3. **Line D sources: add them.** A source line under the Line D paragraph in English and Czech: ČTK
   (via archiweb.cz) for 21 April 2022, ČT24 for 19 June 2026, the same links as `D_SECTIONS` (a
   test holds them equal).
4. **Growth line: keep as it is.** Unchanged.

### 2026-11-01 — Pavol's picks, second set (proposals of the 1 Nov hand-back)

1. **Backfill the correction log with the 17 Oct fixes.** Three dated entries (17 October 2026), in
   English and Czech, each with its Wikipedia source, re-checked 1 Nov: line B station order
   from Nové Butovice to Anděl (Wikipedia, Line B); Strašnická 11 Nov 1987 → 11 Jul 1987 and
   Skalka 4 Nov 1990 → 4 Jul 1990 (Wikipedia, Line A); the 1985 line B opening marked 4 stations,
   the section had 7 (Wikipedia, Line B). "What we had" comes from the diff of the 17 Oct sweep
   (#6). The log is now newest first, which changes item 2 of the set above: the 28 Oct Line A
   entry leads, then the three 27 Oct entries (Line D start first), then 17 Oct. Within one day
   the entries keep their order. The changelog note for the 17 Oct fixes is replaced by a plain
   link to the changelog. Tests hold each "it is now" to the map's data.
2. **Count copied links.** `key_action` `link_copied` {date, station}, sent once per press of
   "Copy link to this day", including the no-clipboard case where the link is shown to copy by
   hand (the reader asked for the link either way). No new event name.

### 2026-11-04 — Iterate round (Pavol: "go", on the orchestrator's package of 3–4 Nov)

Items that don't need Pavol, most valuable to a reader first:

1. **Sources for every opening date.** A source line under each openings table, one source per
   line (A, B: English Wikipedia; C: Czech Wikipedia), checked 4 Nov. The check found three
   disagreements, and the page names each. The table in English Wikipedia's Line C article gives
   Kačerov – Háje 11 Nov 1980, while the Czech article and English Wikipedia's Háje article give
   7 Nov 1980. The Czech Line C article's own table gives 7 Nov 1984 and 25 June 2004, while its
   text (and the English article) gives 3 Nov 1984 and 26 June 2004. The map keeps the majority
   dates (7 Nov 1980, 3 Nov 1984, 26 June 2004). *ad fontes*.
2. **Every station, without JavaScript.** "All 58 stations, A–Z" (EN) and "Všech 58 stanic od A do Z"
   (CS): line, opening date per line, name until 1990. They sit in a `<details>`, so the page
   stays short for readers, while crawlers and AI search get all of it. This answers Lynch's
   "when did my station open, and what was it called then?" for a reader who never runs the map.
   Held to `S`/`OPEN` by tests.
3. **Correction: I. P. Pavlova.** The data had "I.P.Pavlova". Fixed and logged (4 Nov, both languages).
4. **390 px pass.** Station detail dates written out (not ISO). Before 1990 the detail says
   "Renamed Dejvická on 22 February 1990" instead of repeating the heading. Opening dates no
   longer wrap in the openings table. Station-list dates never split.

**§6c remains, confirmed: none.** Metro has no data nobody else has cleaned (Wikipedia and DPP
hold the same dates), no guarantee, method, rank or name. The date links and the no-JS text are
a surface that an assistant *cites*, not something that remains once the assistant can answer.
What's left is taste and craft: a careful diagram, the small multiples, and the checking (it
reconciles sources and keeps a public correction log). That matches the 8 Sep lens ("taste, not
curve").

### 2026-11-05 — Pavol's pick (decision page, card v7.metro.type): "Yes do it"

The visual-signature proposal of the 4 Nov hand-back is built (1.8.0). See "Visual signature" above
for the font choice, its licence and where it appears. The calls taken with it:
- **The type steps cover the whole page, not only the sidebar.** The header, controls, legend,
  tooltip and phone legend had 10.5–19 px sizes too. The speed select is 17 px so iOS does not
  zoom on focus.
- **Secondary event text is 13/18 in sentence case.** The Label step is 13/18 and uppercase, but
  a sentence in capitals reads worse.
- **The date label has a fixed width (172 px) to fit "September 2026".** The wider face made the
  label change width between months, which moved the slider during Play. A test caught it.
- **No light theme.** "Light and dark" was checked as the colour-scheme preference. The page
  stays dark in both (the signage is white on dark), and a test holds that.
