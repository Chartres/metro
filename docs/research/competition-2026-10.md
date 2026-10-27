# Competition — Prague Metro history (October 2026)

Product: metro.dravec.org, "Prague Metro — Growth Through Time". An interactive SVG map with
a play-through timeline from 9 May 1974 to today, plus the 1990 renames, the 2002 floods and
Line D under construction. English UI, single page, free, no ads, no account.

Access date for everything below: **2026-10-27**. "Not found" means I looked and found no
figure. It does not mean the figure is zero.

Method: WebSearch (US index), WebFetch, and curl for YouTube search results (view counts
read from the results page on the access date). I couldn't read metroweb.cz, because it
sits behind an Anubis anti-scraper challenge. I didn't try to get past it, and the Wayback
Machine was not reachable from this environment either, so that entry relies on secondary
sources.

## Competitors

### 1. English Wikipedia — "Prague Metro" (+ "List of Prague Metro stations")

- URL: https://en.wikipedia.org/wiki/Prague_Metro ,
  https://en.wikipedia.org/wiki/List_of_Prague_Metro_stations
- Price/model: free, no ads (donation-funded).
- Audience: English-speaking visitors, students, transit enthusiasts. It is usually the
  first or second result for every English query below.
- Does well: a full prose history with an "Extensions" section that lists each opening by
  date (1974 C, 1978 A, 1985 B, through the 2015 Motol extension). It has a 2002 flood
  subsection (19 stations flooded, about 7 bn CZK damage, last reopening March 2003), a
  Line D status section, and an animated GIF of network growth (`Prague_metro_extension.gif`,
  caption "Prague Metro extensions"). The station list puts former pre-1990 names in
  parentheses.
- Does badly: the GIF is the only "animation". It can't be paused, scrubbed or clicked, and
  you can't ask what the network looked like on a given date. The rename section has
  errors: the text says "13 station names" were changed on 22 Feb 1990, but the bulleted
  list has 11 entries and leaves out Leninova–Dejvická, which appears elsewhere in the
  article. The Line D dates are inconsistent within the article (it says 2022–2029 in the
  text, 2031 in the lines table, and carries an update notice). There is no table of
  openings in date order.

### 2. Czech Wikipedia — "Metro v Praze"

- URL: https://cs.wikipedia.org/wiki/Metro_v_Praze
- Price/model: free, no ads.
- Audience: Czech readers. It is the most detailed free text source in Czech.
- Does well: deep prose history, a passenger-numbers table for 1974–2025, a 2002 flood
  section (renovation costs over 6.96 bn CZK, outages until March 2003), and Line D status
  (construction from 2022, 10 stations over 10.5 km, Písnice depot around 2032). It
  includes an animation captioned "Rozšiřování metra v Praze (animace)".
- Does badly: there is no table of section openings in date order, because the dates are
  spread through the prose. The 1990 renames get examples (Gottwaldova → Vyšehrad) but no
  complete list. The animation is a static media file, like on English Wikipedia. The
  article is Czech only, and the English article is a separate, shorter text.

### 3. DPP (Dopravní podnik hl. m. Prahy), the operator's history pages

- URLs: https://www.dpp.cz/metro50/historie-prazskeho-metra-v-datech (Czech, built for the
  metro's 50th anniversary);
  https://www.dpp.cz/en/entertainment-and-experience/dpp-history/history-of-the-public-transport-in-prague
  (English, all public transport)
- Price/model: free, no ads (operator site).
- Audience: Czech enthusiasts and press. The English page serves tourists and expats.
- Does well: this is the authoritative source. The Czech "v datech" page is a dated
  chronology grouped by decade, with archive photos and galleries for 1974, 1978 and 1985.
  Its 22 Feb 1990 entry lists the renamed stations as pairs (e.g. "Budovatelů → Chodov",
  "Sokolovská → Florenc (B i C)"). It covers the 2002 flood (limited service from
  15 Aug 2002, last stations Křižíkova and Invalidovna reopened 22 Mar 2003) and Line D.
- Does badly: it has no maps of the network at any date, so you read it rather than see
  it. The Line D entry is out of date: the page still says opening is expected in 2029,
  while a DPP traffic director was later reported moving it to 2032 (e15.cz). The rename
  entry says 13 stations but lists 12 pairs. The English page is general transit history:
  it mentions only two former names (Leninova, Sokolovská), gives one line on the flood,
  and has a single 2019 entry for Line D (the geological survey).

### 4. YouTube "evolution of the Prague metro" animations

- Main video: "Evolution of the Prague Metro 1974-2030 (geographic map)", channel
  **Metro Liner**, https://www.youtube.com/watch?v=ShaPOQBOkrY — **226,217 views**,
  uploaded about 3 years ago, 3:24. Expats.cz wrote it up in March 2023 as a sped-up look
  at the network growing from 1974 to planned extensions, with Line D's start date then
  given as 2029.
- Other uploads on the same topic (views on the access date):
  - "Evolution of the Prague Metro | 1974 - 2027", DirectionNorth — 13,244 views, 4 years ago, 7:19
  - "Prague Metro Evolution (1974 - 2026)", NodeRail — 9,171 views, 3 months ago, 7:25
  - "Historie pražského metra / History of Prague subway", Michal Horáček — 30,725 views, 9 years ago, 1:25
  - "Пражское метро. История развития …", Статистика Инфографика Рейтинги — 12,507 views, 6 years ago, 1:55
  - "Развитие Пражского метро 1974-2060", Леопольдия — 5,479 views, 3 years ago, 2:55
  - "PRAGUE METRO: 1974 → 2026 – 3D Timelapse (No AI)", Layer Zero — 116 views, 2 weeks ago, 3:20
- Price/model: free, with YouTube ads (the creator's monetization status is not known).
- Audience: transit-map enthusiasts and casual viewers. This is the largest audience in
  this list that has a public number (226k views for the Metro Liner video). The other
  competitors publish no traffic figures.
- Does well: the animation is the whole format, it works on any device, and it shares well.
  Several videos include speculative future lines, which viewers seem to like.
- Does badly: it is linear video, so you can't stop on a date and click a station. You can
  pause, but nothing on screen is interactive. The older videos have outdated Line D
  dates baked in (2027, 2029, 2030). From the titles and descriptions I couldn't tell
  whether any of them show the 1990 renames. I couldn't retrieve comments with the tools
  available, so there is no user feedback quoted here.

### 5. Citylines.co — Prague

- URL: https://www.citylines.co/prague
- Price/model: free, open data (the project is listed on ecosyste.ms sponsors, so
  donation-supported). No pricing found.
- Audience: transit-data hobbyists. It is a global collaborative platform ("Explore the
  transport systems of Prague, and their history").
- Does well: it is the closest feature match to Metro. Its UI strings, read from
  `/api/i18n?locale=en`, confirm a year timeline with a "Timeline speed" control (i.e.
  play), "Operative: N km" and "Under construction: N km" counters, per-feature opening and
  closure years, and station popups. The data is open and downloadable, and the map is
  geographic (Mapbox), centred on Prague.
- Does badly: the timeline moves a year at a time, not by exact date. I found no renamed
  station names in the UI strings, and only one station name per feature. Its UI is not
  built around Prague, so there are no event notes such as the 1990 renames or the 2002
  floods. The data is crowd-edited, and I couldn't check how complete the Prague data is,
  because the lines endpoint wasn't reachable without the app's JS. It never appeared in
  the search results below.

### 6. metroweb.cz — Czech metro enthusiast site

- URL: https://www.metroweb.cz/ (redirects to https://metroweb.cz/)
- Price/model: free. I couldn't confirm ads because the page wasn't readable (see Method).
- Audience: Czech enthusiasts. English Wikipedia station articles cite it as a source, for
  example "I. P. Pavlova (Prague Metro)" cites its per-station pages organised by line.
- Does well, from secondary evidence: per-station pages detailed enough to be cited as a
  reference.
- Does badly: on the access date every visit started with an Anubis proof-of-work page that
  needs JavaScript, so search snippets and link previews fail. It was the only site in this
  list I couldn't read. It didn't appear in any of the seven searches below, including the
  Czech ones. I couldn't verify an interactive map or timeline.

### 7. mapa-metro.com — Prague Metro map page

- URL: https://mapa-metro.com/en/czech-republic/prague/prague-metro-map.htm (in many
  languages, including the Norwegian page that ranked for the Czech query)
- Price/model: free, with a downloadable PDF of the current map. Ads were not stated in the
  fetched text, but the page has app-install prompts and share buttons. It reads as an SEO
  page that earns from traffic.
- Audience: tourists who want the current map and fares (it lists 2026 PID ticket prices,
  e.g. 90 min 46 CZK in the app or 50 CZK on paper).
- Does well: it ranks for "prague metro map 1974", "historie pražského metra mapa" and
  "interactive prague metro map history". It has a short history section (1974/1978/1985
  openings, the 2002 floods, the 22 Feb 1990 rename with Moskevská → Anděl as the example)
  and recent Line D news (contract for the next section signed April 2026).
- Does badly: the only map is the current one, so the history is text only. Its figures
  contradict each other: the "Quick facts" box says 57 stations and 1,472,000 daily riders,
  while the body says 61 stations and about 1.55 million.

### 8. DPP Fanshop — printed history (books, schemes)

- URL: https://fanshop.dpp.cz/ (categories: /knihy/, /mapy-a-schemata/, /plakaty/)
- Price/model: one-off purchase. Prices on the access date:
  - Book "Z Kosmonautů na Háje": **379 Kč**. A photo book of over a hundred period and
    current photos comparing old and new metro. The title is itself a rename
    (Kosmonautů → Háje).
  - Book "50 příběhů pražského metra": **479 Kč** (marked "last pieces"). Fifty accounts
    from people who built the metro.
  - Brochure "Historická souprava Ečs pražského metra": **30 Kč** (2012, 16 pp., A5).
  - Current metro schemes: "Schéma linek metra „Jezevčík"" **179 Kč**, "Schéma sítě z vozu
    metra" **139 Kč**.
  - Historical network plans are sold for trams and buses only (1924 tram plan 199 Kč,
    1938 tram plan 230 Kč, 1938 bus plan 115 Kč). **No historical metro map or poster was
    listed**, and the "Kolekce Historie metra" collection page shows no products.
- Audience: Czech enthusiasts and gift buyers.
- Does well: official, physical, collectible.
- Does badly: Czech only, paid, and no product shows the network changing over time.

### 9. OpenHistoricalMap (generic time-slider map)

- URL: https://www.openhistoricalmap.org/
- Price/model: free, volunteer-built, public domain.
- Audience: historians and mappers.
- Does well: a date slider on the homepage map (OSM wiki: the default is 100 years ago, and
  it can animate across a date range) and a "Railway" thematic layer.
- Does badly: I couldn't confirm that Prague Metro lines are mapped with dates. The fetched
  homepage text didn't describe the slider, and searches found nothing Prague-specific.
  Even if the data exists, a general-purpose map gives no Prague context, no rename notes
  and no event list.

### 10. Transitmap.net — historical Prague map posts

- URL: https://transitmap.net/tag/prague/ (e.g. "Prague Metro Booklet, c. May 1974",
  2021-07-02; "Prague Metro Book, 1978", 2016-06-28)
- Price/model: free blog. It has a Patreon and a "Prints" store, but no Prague print
  prices were shown.
- Audience: transit-map design enthusiasts (international).
- Does well: scans of real period documents, including the 1974 opening booklet with its
  planned-system diagram. It ranks for "prague metro map 1974".
- Does badly: single static images with commentary, and no coverage after the 2013 posts.

### Checked, not counted as competitors

- **Jug Cerovic / INAT maps**: no Prague map found. Results list Paris, London, Berlin,
  Moscow, Madrid, Helsinki, Lisbon and others. inat.fr returned HTTP 503.
- **mapy.cz historical layers**: mapy.cz offers historical base maps, but I found no metro
  history overlay.
- **Metro Map Maker** (https://metromapmaker.com/): a free-form map drawing tool with no
  time dimension. The fetched page shows no Prague map and no pricing.
- **"Prague Subway Map" iOS app** (https://apps.apple.com/app/id6476585107, developer
  Yaroslav Mykolaienko): free, no IAP listed, too few ratings to show. It is for navigation
  only and has no history content.
- **Retail poster of Prague metro history**: none found. The closest physical items are the
  DPP books above and a 1974 commemorative token (numisview.com).

## Feature-gap table

Values are yes / no / partial. "Metro" values come from this repo (README, CHANGELOG 1.0–1.2.1,
index.html). Competitor values come only from what I could verify on 2026-10-27. Where I
couldn't verify something, the cell says partial or no, with a footnote.

| Feature | Metro | EN Wikipedia | CS Wikipedia | DPP history pages | YouTube (Metro Liner) | Citylines | metroweb.cz | mapa-metro.com | DPP Fanshop books | OpenHistoricalMap |
|---|---|---|---|---|---|---|---|---|---|---|
| Interactive timeline scrubbing | yes | no | no | no | no | partial (year steps) | no¹ | no | no | partial² |
| Play animation | yes | partial (GIF) | partial (animation file) | no | yes (video) | yes | no¹ | no | no | partial² |
| Renamed station names by date | yes | partial (list, incomplete) | partial (examples) | partial (one dated list) | no³ | no | no¹ | partial (one example) | partial (book photos) | no² |
| Per-station history | yes | partial (station list + articles) | partial | no | no | partial (opening/closure years) | yes¹ | no | no | no² |
| Line D construction | yes | yes | yes | partial (dates out of date) | partial (dates out of date) | partial ("under construction" km) | no¹ | yes | no | no |
| Small multiples by decade | partial (six dates, not strictly decades) | no | no | no | no | no | no | no | no | no |
| Growth chart | yes (station count on slider) | no | partial (ridership table) | no | no | partial (km counters) | no | no | no | no |
| Works offline / content without JS | partial (static history text, from 1.3.0) | yes | yes | yes | no | no | no (JS challenge) | yes | yes (print) | no |
| Czech language | partial (Czech summary, from 1.3.0) | no | yes | yes | no | partial (UI i18n) | yes | yes | yes | partial |
| English language | yes | yes | no | partial (general page only) | yes | yes | no | yes | no | yes |
| Mobile | yes | yes | yes | yes | yes | partial (map app) | not verified | yes | n/a (print) | partial |

¹ Not readable on the access date (Anubis challenge). Per-station pages are inferred from
Wikipedia citations, and the other features couldn't be verified.
² Prague Metro coverage on OpenHistoricalMap not confirmed. The values describe the
platform.
³ Couldn't confirm from the title or description, and the video itself wasn't watched.

## Search visibility

WebSearch, standard mode, US index, 2026-10-27. Positions are 1-based among the returned
links. A control query for `metro.dravec.org` itself returned no result from the domain
(only unrelated "Metro" agencies), which suggests the site isn't indexed yet by this
search backend.

| Query | metro.dravec.org found? | Position | Top results (positions 1–3) |
|---|---|---|---|
| prague metro history timeline | no | — | en.wikipedia Line C; english.radio.cz (55 years since construction); expats.cz metro history |
| prague metro map 1974 | no | — | en.wikipedia Prague Metro; mapa-metro.com (EN); mapa-metro.com (IT) |
| prague metro stations old names communist | no | — | en.wikipedia List of Prague Metro stations; subbrit.org.uk; english.radio.cz (Vyšehrad) |
| historie pražského metra mapa | no | — | mapa-metro.com (NO); geocaching.com GC1HVZW; denik.cz (metro 35 let) |
| přejmenované stanice metra 1990 | no | — | ct24.ceskatelevize.cz "Revoluce v metru: Z Gottwaldovy Vyšehrad…"; en.wikipedia Paris Metro stations; praha.camp |
| prague metro line D opening date | no | — | en.wikipedia Line D; expats.cz (2027 target, old); archiweb.cz |
| interactive prague metro map history | no | — | expats.cz (CAMP exhibit); themayor.eu; euro2020.hisense.co.uk (spam mirror) |

None of the direct competitors above (Citylines, metroweb.cz, OpenHistoricalMap, the YouTube
videos) ranked for these queries in this index. Wikipedia, mapa-metro.com and news sites
(expats.cz, radio.cz, ČT24) hold the results. The query "interactive prague metro map
history" returned nothing interactive about metro history, so that query is open.

## Where we win

Nobody else lets you stop on a date and see that day's network with that day's names. The
video animations have the audience (226k views on one) but you can't click anything in them.
Citylines has a timeline but steps by year and has no renames. The text sources (Wikipedia,
DPP) have the facts but no maps, and each has errors: Wikipedia's rename list is incomplete,
and DPP's own chronology still says Line D opens in 2029.

The gap we can hold is **accuracy you can check, by date.** Concretely:

1. **A date-exact, cited dataset.** Every opening, rename and Line D section with its day,
   held to the map by tests (the static history text fails CI if it drifts from the data).
   This round already fixed two errors we shipped (Line D construction start, station list
   and order) and the 2029 → 2032 Line D estimate.
2. **The rename layer.** The 12 renames of 22 Feb 1990, shown on the map by date and in a
   complete table in English and Czech. No source we found has a complete, correct list in
   both languages.
3. **Small multiples and the growth line** (see `docs/SIGNATURE.md`): the whole history in
   one glance, which a video can't give and a text can't draw.
4. **Being findable.** The page now has crawlable text and FAQ data; before this round a
   crawler saw a title and an empty map. The query "interactive prague metro map history"
   has no interactive result today.

**Entrant difficulty** (`flywheel/docs/standards/moat.md`; this is a pet-track product, which
the standard exempts, scored anyway):

- Before this round: **1** (a competent dev ships the same map in two weeks; it has no users).
- After this round: **1**. Honest: the dataset and tests take a few days to copy. The path to
  **2** is the correction history: dated, sourced fixes that accumulate (issues from readers,
  checks against DPP releases) and make this the source others cite. That only counts once
  someone outside the repo cites or corrects it.

What we don't rely on: being first. Wikipedia or DPP could add an interactive map any time.

## Sources

All accessed 2026-10-27.

- https://en.wikipedia.org/wiki/Prague_Metro
- https://en.wikipedia.org/wiki/List_of_Prague_Metro_stations
- https://en.wikipedia.org/wiki/I._P._Pavlova_(Prague_Metro) (cites metroweb.cz)
- https://en.wikipedia.org/wiki/Line_D_(Prague_Metro)
- https://cs.wikipedia.org/wiki/Metro_v_Praze
- https://www.dpp.cz/metro50/historie-prazskeho-metra-v-datech
- https://www.dpp.cz/en/entertainment-and-experience/dpp-history/history-of-the-public-transport-in-prague
- https://www.e15.cz/videoporady/flow/metro-d-az-na-namesti-republiky-otevreni-linky-se-posouva-na-rok-2032-rika-dopravni-reditel-dpp-1427075
- https://www.youtube.com/watch?v=ShaPOQBOkrY (Metro Liner)
- https://www.youtube.com/results?search_query=evolution+of+the+prague+metro (view counts)
- https://www.youtube.com/results?search_query=prague+metro+evolution+1974 (view counts)
- https://www.youtube.com/results?search_query=vyvoj+prazskeho+metra (view counts)
- https://expats.cz/czech-news/article/animated-video-showcases-the-evolution-of-prague-s-metro-system
- https://www.citylines.co/prague
- https://www.citylines.co/api/i18n?locale=en (UI strings: timeline speed, km counters)
- https://www.citylines.co/api/prague/config
- https://sponsors.ecosyste.ms/accounts/citylines
- https://metroweb.cz/ (Anubis challenge page only)
- https://mapa-metro.com/en/czech-republic/prague/prague-metro-map.htm
- https://fanshop.dpp.cz/knihy/
- https://fanshop.dpp.cz/kniha-z-kosmonautu-na-haje/
- https://fanshop.dpp.cz/kniha-50-pribehu-prazskeho-metra/
- https://fanshop.dpp.cz/brozura-historicka-souprava-ecs-prazskeho-metra-317/
- https://fanshop.dpp.cz/mapy-a-schemata/
- https://fanshop.dpp.cz/plakaty/
- https://fanshop.dpp.cz/kolekce-historie-metra_fond-ohrozenych-deti-6/
- https://www.openhistoricalmap.org/
- https://wiki.openstreetmap.org/wiki/OpenHistoricalMap/Browsing
- https://transitmap.net/tag/prague/
- https://transitmap.net/1978-prague-metro-book
- https://www.slate.com/blogs/the_eye/2014/04/09/designer_jug_cerovic_s_ambitious_quest_to_standardize_the_world_s_subway.html
- https://humantransit.org/2021/12/two-great-books-for-transit-map-lovers.html
- https://metromapmaker.com/
- https://apps.apple.com/app/id6476585107
- https://numisview.com/reference/exonumia/prague-metro-commemorative-token
- https://ct24.ceskatelevize.cz/regiony/1005506-revoluce-v-metru-z-gottwaldovy-vysehrad-a-z-moskevske-andel
- https://www.archiweb.cz/en/n/home/trasa-metra-d-se-chysta-radu-let-praha-ji-nekolikrat-odlozila
