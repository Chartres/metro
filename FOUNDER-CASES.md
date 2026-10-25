# Founder cases — real situations with known answers

Every sweep and release candidate checks these. Drafted 2026-10-21 from the repo's history; none is confirmed yet. A row becomes binding (and gets a CI check) when Pavol marks it confirmed. A case changes only with a written reason.

| # | Situation | Known right answer | Source | Confirmed |
|---|---|---|---|---|
| 1 | Timeline scrubbed to opening day, 9 May 1974 | 9 stations, 1 line (C) running; interchange stations do not count as 3 lines | CHANGELOG 1.0.0 import fix; AGENTS.md "Run / verify"; e2e "time travel: 1974 opening day" | no |
| 2 | Today's view (Oct 2026) | 58 stations of 58, 3 lines running; Line D drawn blue and dashed as under construction (since 2022-03-01), not as open | e2e "today view"; README; `D_CONSTRUCTION_START` in index.html. PR #8 (merged) dropped its unverified "D opened" claims | no |
| 3 | Station Dejvická on a date before 22 Feb 1990 (e.g. 1988) | Map label, tooltip and screen-reader `aria-label` all say "Leninova"; on or after 22 Feb 1990 all say "Dejvická" | PR #6 (`8104f86`), PR #7; e2e "renamed stations show communist-era names" | no |
| 4 | Line B station order in the west | Nové Butovice → Jinonice → Radlická → Smíchovské nádraží → Anděl → Karlovo náměstí | PR #6 (`a0825ae`, checked against Wikipedia); e2e "history data matches the Wikipedia-checked answers" | no |
| 5 | Opening dates of Strašnická and Skalka (Line A) | Strašnická 1987-07-11, Skalka 1990-07-04 (not Nov 1987 / Nov 1990) | PR #6 (`49fa736`, checked against Wikipedia); e2e "history data matches the Wikipedia-checked answers" | no |
| 6 | Line B opening event, 2 Nov 1985 | Flashes all 7 new stations, Florenc to Smíchovské nádraží (not only Anděl) | PR #6 (`ff45aa3`); e2e "history data matches the Wikipedia-checked answers" | no |
| 7 | Click the "Line A opens" event (12 Aug 1978); then open Muzeum | 2 lines, 15 stations; Muzeum detail reads "Opened on Line A: 1978-08-12" and "Opened on Line C: 1974-05-09" | PR #6 (`27c4870`); e2e "timeline event click jumps the map", "station detail: Muzeum" | no |
| 8 | Click the 22 Nov 1990 event | Date label reads "November 1990" (before the fix it read "December 1990"); every event shows its own month | PR #6 "After review" (`cd50921`); e2e "every timeline event click shows that event's date" | no |
| 9 | Landing view opened at 00:30 on 1 Nov in Prague; at 22:00 on 31 Oct in Los Angeles | Prague shows "November 2026"; Los Angeles shows "October 2026" (viewer's local date) | PR #7; e2e "east of UTC" / "west of UTC" landing-view tests | no |
| 10 | Timeline at 1 Jan 2000, during the Line B infill gap (Kolbenova opened 2001) | All 23 Line B segments are drawn; the track does not break at unopened infill stations | PR #6 (`c7d3494`); e2e "Line B stays drawn through the 1998–2001 infill-station gap" | no |
