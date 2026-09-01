# DESIGN.md — Metro

Invariants: `../../docs/standards/taste.md`. The app arrived with its own committed
identity — dark panel UI, official line colors (A green / B yellow / C red / D grey),
tabular numerals for dates and stats — and keeps it. Don't restyle toward the console.

- The time slider is the product. Everything else (events list, station detail,
  tooltips) supports scrubbing through history.
- Line colors are the DPP's, not a palette choice — never remap them.
- Former (communist-era) station names render in muted red before 22 Feb 1990;
  that contrast is the point of the rename feature, keep it visible.
