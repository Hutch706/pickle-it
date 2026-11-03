# Open questions
Each needs an owner decision. Once decided, move it to docs/decisions.md.

## Needs your judgment
- **Generator oil interval.** The curator couldn't confirm Honda's EU2200i interval (draft: 100 hr or 6 months; one unclear source said 50 hr or 3 months). Owner is unsure. Until decided, the starter task ships marked "(no source found)" as an editable default.

- **Which branch GitHub Pages serves from** (needed before launch, not now). A) `main`, folder `/`, like the old app; B) a separate deploy branch. Recommended: A, since there's no build step. Turning Pages on still waits for your go-ahead.

- **Where the "backup due" dot goes.** Settings is now reached from the Pantry gear, so the old tab-bar spot is gone. A) dot on the gear, read aloud as "Settings, backup due"; B) a "Backup due" line in the Pantry header; C) only inside App settings. Recommended: A, closest to today.
- **When an odometer or hour meter goes backward** (replaced or reset; data-model 3.3b). A) the app asks "Was the meter replaced or reset?" and records a meter change, so due math keeps working (adds fields to readings and 2 CSV columns; changes stored data); B) nothing in v1: the lower reading is ignored and the item sits in the wrong box until the new meter passes the old value. Recommended: A.
- **Battery check date.** The curator picked Oct 1 (Fall Car Care Month); the alternative is Sep 15 alongside the furnace tune-up. Recommended: Oct 1.

## Later
- Nothing open.
