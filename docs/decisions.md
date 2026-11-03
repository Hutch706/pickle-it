# Decision log
Newest first. Each entry: date, decision, why. Only the owner makes decisions.

## 2026-11-03 (later)
- **Pickle It saves data under its own names.** Database `pickle-it` and `pickle-it:` settings keys, instead of the Vehicle Maintenance App's. Why: both apps may be hosted on one web address (one github.io account), where they would otherwise share and overwrite each other's data. The code that moved data from older app names (Fill-Up Receipts) is removed, since on a shared address it would take another app's data. Users bring Vehicle Maintenance App data over with a CSV export and import.

## 2026-11-03
- **Decisions win over the brief.** Where docs/brief.md and this log disagree, this log is right; the brief has been updated to match.
- **Look follows app.css.** Fonts and colors come from the Vehicle Maintenance App's app.css, not DM Sans. Replaces the earlier "DM Sans and the colors in docs/brief.md" entry.
- **Green is the default palette.** All other palettes (Blue, Red, Orange, Purple, Teal, Monochrome) stay, each with light and dark mode, plus the Light / Dark / System choice.
- **Pantry tab bar replaces the vehicle-only tabs.** The app gets the Pantry home tab and jar tabs from docs/brief.md. What tabs or sections each jar has inside is decided later.
- **Tasks can repeat by any measure.** Odometer miles for vehicles, months (furnace filters), hours of use (small engines), or fixed recurring dates (winter prep, biweekly recycling drop-off).
- **The code moves from vehicle-only to categories.** Data and screens get reworked so Vehicles is one category among Home, Health and Finance.
- **CSV exports carry a version number.** A `format_version` column on every row, starting at 1. Vehicle Maintenance App files without it still import as version 1.
- **The app is named "Pickle It".** Title, install name, header, export file name and docs.
- **Images are tracked in git.** `*.png` removed from .gitignore; the owner removes any images that shouldn't be in the repo.
- **setup.md is removed from the repo history.**
- **The service worker keeps its offline copies current on its own.** A missing file no longer breaks installing, and edits don't need a cache version bump.

## 2026-11-02
- **The public app builds from the Vehicle Maintenance App code.** The owner's personal version depends on Claude hosting and private cloud sync, which won't work for public users.
- **New repo, with the old code imported as the first commit.** Keeps the existing GitHub Pages app stable for its current users.
- **Claude Code agent team, with this repo as the source of truth.** Planning and mockups can happen in the owner's planning chat, but decisions get logged here.

## Carried over from earlier planning
- **Navigation:** bottom tab bar with a Pantry home tab and jar tabs (details in docs/brief.md).
- **Pantry home:** three collapsible due boxes, 50-item caps, witty empty state (details in docs/brief.md).
- **Look:** DM Sans and the colors in docs/brief.md, phone-first. *Replaced 2026-11-03: the look follows app.css.*
- **Pantry icon:** cabinet.
- **v1 categories:** Vehicles, Home, Health, Finance.
- **Data storage:** begin with local-only, but make sure there is a pathway to migrate to cloud storage when the app is planned to release to public.
