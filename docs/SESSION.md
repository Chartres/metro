# Session summary — Metro

One page, rewritten at every hand-back (AGENTS.md, "Working with the orchestrator").
Last rewritten 2026-11-08.

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
  contract test runs in CI. Events:
  - `page_view`;
  - `conversion` (first Play);
  - `key_action` with an action: decade_jump, line_d_detail, czech_section_view, link_opened,
    link_copied.
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
1. **8 Nov: session rules.** Added the two standing rules to AGENTS.md, and this file. Pavol
   asked for it directly after the session's permission check had held the AGENTS.md write
   on 7 Nov.
2. **7 Nov: re-vendored the hub client after hub #159.** Metro's local storage hunk is gone, and
   with blocked storage the ids now stay in memory for the visit. 1.8.2, PR #26.
3. **7 Nov: bots out.** The hub client with isAutomatedBrowser, plus the contract test. 1.8.1, PR #24.
   Live check: a headless visit sent 0 requests, a normal visit sent page_view (201).
   Hand-back PR #25.

## Open threads
- Hub: portfolio record to 1.8.x, the signage-type move marked live, `remains` confirmed none.
- Hub: confirm that the live probe covers Metro. Metro's CI has no deploy step, so the bundle
  guard never runs.
- Watch link_opened and link_copied over 28 days. At current traffic the numbers are anecdotal.

## Next
Nothing queued. Waiting for the orchestrator's next package.
