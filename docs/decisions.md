# Decision log
Newest first. Each entry: date, decision, why. Only the owner makes decisions.

## 2026-11-02
- **The public app builds from the Vehicle Maintenance App code.** The owner's personal version depends on Claude hosting and private cloud sync, which won't work for public users.
- **New repo, with the old code imported as the first commit.** Keeps the existing GitHub Pages app stable for its current users.
- **Claude Code agent team, with this repo as the source of truth.** Planning and mockups can happen in the owner's planning chat, but decisions get logged here.

## Carried over from earlier planning
- **Navigation:** bottom tab bar with a Pantry home tab and jar tabs (details in docs/brief.md).
- **Pantry home:** three collapsible due boxes, 50-item caps, witty empty state (details in docs/brief.md).
- **Look:** DM Sans and the colors in docs/brief.md, phone-first.

## Answered questions; move these to docs/decisions.md
- **Pantry Icon:** cabinet
- **v1 categories:** Vehicles, Home, Health, Finance
- **Data storage:** begin with local-only, but make sure there is a pathway to migrate to cloud storage when the app is planned to release to public
