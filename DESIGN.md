# DESIGN.md — Metro

Invariants: `../../docs/standards/taste.md`. The app arrived with its own committed
identity — dark panel UI, official line colors (A green / B yellow / C red / D blue),
tabular numerals for dates and stats — and keeps it. Don't restyle toward the console.

- The time slider is the product. Everything else (events list, station detail,
  tooltips) supports scrubbing through history.
- Line colors are the DPP's, not a palette choice — never remap them.
- Former (communist-era) station names render in muted red before 22 Feb 1990;
  that contrast is the point of the rename feature, keep it visible.
- Signature (see `docs/SIGNATURE.md`): the small multiples are lines only, no labels or
  stations; the growth line is one muted fill plus one accent marker. No decoration on either.
- The history text below the map uses the taste kit's type steps: 13 label, 17 body,
  20 title.
