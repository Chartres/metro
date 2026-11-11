# Session summary — Metro

One page, rewritten at every hand-back (AGENTS.md, "Working with the orchestrator").
Last rewritten 2026-11-11.

## What Metro is now (1.8.2)
- A map of the Prague Metro from 9 May 1974 to today. You can scrub it with the slider or press
  Play. It has:
  - six small multiples;
  - a growth line on the slider;
  - date links (`?date=…&station=…`);
  - Line D's two started sections.
- Below the map, readable without JavaScript, in English and in Czech:
  - openings, with sources for each line and three source disagreements named;
  - all 58 stations, A–Z;
  - the 1990 renames;
  - Line D status;
  - a dated correction log.
- Type: station names and dates are set in Metro Sign Sans. It is Encode Sans (OFL) at width
  112.5, the closest free face to Rathouský's Metron, self-hosted, 28 KB. Every HTML size is
  on taste.md's steps (13/17/20).
- Analytics: the hub's client, byte for byte. Automated browsers send nothing, and the signals
  contract test runs in CI. Events: `page_view`, `conversion` (first Play), `key_action` with
  an action: decade_jump, line_d_detail, czech_section_view, link_opened, link_copied.
- §6c remains: none. Taste and craft, confirmed 4 Nov.
- Deploy: push to main, Cloudflare Pages builds it, live at metro.dravec.org. Pet track, kill
  clock 2027-01-31.

## Pavol's rules in force
- Follow the orchestrator's packages unless a step is risky: Metro since 4 Nov, every product
  since 7 Nov. The risky steps are listed in AGENTS.md.
- Long-lived session, with this summary rewritten at every hand-back: 7 Nov.
- Reuse across products is fine, but "Dont just blindly copy the pattern": 30 Oct.
- Hub constraints: no Anthropic API calls, $0 infrastructure, plain voice, nothing outward
  without him.

## Last three packages
1. **11 Nov: sweep/2026-11-11.** 5 cycles, max reached. 5 fixes + 1 chore + 15 refactors.
   Key fixes: VERSION stale (1.5.0→1.8.2), narodni_trida/mustek swapped in 1985 event,
   dead exports in analytics.ts, new backward-scrub e2e test, Object.values hot path.
   PR #28 is DRAFT (needs-human-review; sweep guard flagged pre-existing main history — false positive).
   Open for Pavol: font probe test (high), Czech genitive "od Florence" (medium), FOUNDER-CASES rows.
2. **8 Nov: session rules.** Added the two standing rules to AGENTS.md, and this file. Pavol
   asked for it directly after the session's permission check had held the AGENTS.md write on 7 Nov.
3. **7 Nov: re-vendored the hub client after hub #159.** Metro's local storage hunk is gone, and
   with blocked storage the ids now stay in memory for the visit. 1.8.2, PR #26.

## Open threads
- **PR #28** (sweep/2026-11-11): review and merge when ready. No sweep-guard concerns from new
  commits; the flags are for old main history. Previous sweep PR #19 also still open draft.
- **Font probe test** (e2e/type-2026-11-05.spec.ts:56): `expect(probe).toBe(true)` fails. Canvas
  measureText CJK probe returns false in Chromium; unknown if font issue or browser behavior.
- **Czech genitive** (index.html:712): "od Florence" → may be "od Florencu" (station name genitive).
- **FOUNDER-CASES.md rows 2+6**: stale (described planned legs removed in v1.4.0; "new" stations
  wording for row 6). Pavol-only changes.
- Hub: portfolio record `last_swept` updated to 2026-11-11.

## Next
Nothing queued. Waiting for the orchestrator's next package.
