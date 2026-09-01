# Metro — Prague Metro, growth through time

Interactive map of the Prague Metro's history: every extension, rename and
closure from opening day (9 May 1974) to today, plus Line D under construction
(blue, dashed) and its planned phase-II leg (dotted). Scrub the timeline or
press Play and watch the network grow.

**Live:** https://metro.dravec.org

A [flywheel](https://github.com/Chartres/flywheel) product (pet track).
Build/test/release contract: [AGENTS.md](AGENTS.md). Changelog:
[CHANGELOG.md](CHANGELOG.md).

```bash
npm ci
npm run dev                       # local
npm run typecheck && npm test     # gate
PW_CHROMIUM=/opt/pw-browsers/chromium npm run test:e2e   # persona journeys + shots
```
