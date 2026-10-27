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
  hopeful date.

## Signature mechanics

| Mechanic | What the user sees | From | Status | How we'll know |
|---|---|---|---|---|
| Small multiples | Six small maps of the network at 1974, 1980, 1990, 2000, 2010 and today, with station counts (9, 22, 38, 47, 54, 58); a tap moves the main map to that date | Tufte 1990 | shipped (1.3.0) | `key_action` with `action: decade_jump`; share of visitors with ≥ 1 jump. Target: ≥ 20 % of visitors over 28 days. At 6 visitors a month the number is anecdotal until traffic grows. |
| Growth line | The slider track is a step chart of stations open; a marker rides the current date | Minard 1869, Tufte's sparklines | shipped (1.3.0) | No event of its own (it's read, not clicked). Indirect: the Play conversion share (`conversion` / visitors) holds or rises after release. |
| Date links | `?date=1988-10-26&station=dejvicka` opens the map on that day with that station selected, so a teacher or a forum post can point at one moment | Beck's map as a shared object; *ad fontes* (cite a precise state) | proposed | `key_action` `link_opened`; links seen in referrers |
| Correction log | A dated "corrections" list on the page: what we had wrong, what it is now, the source | *ad fontes* | proposed | Reader-filed issues per quarter; first external citation |

## Visual signature

The Prague metro has its own design tradition: Jiří Rathouský's orientation system and the
metro logo of the early 1970s (https://cs.wikipedia.org/wiki/Ji%C5%99%C3%AD_Rathousk%C3%BD),
with strong line colours on dark ground and plain grotesque lettering. The app already sits
close to it (dark panels, DPP colours, tabular numerals). Direction for a later round, not
done here: keep the dark ground, set station names and the date in a grotesque closer to the
station signage, and bring the type down to the four steps in `taste.md` (the sidebar still
uses 10.5–12.8 px sizes inherited from the original file). The new history section and the
small multiples already use the four steps (13 / 17 / 20).

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
