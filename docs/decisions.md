# Decision log
Newest first. Each entry: date, decision, why. Only the owner makes decisions.

## 2026-11-03 (Phase 2 open questions)
- **The Vehicle Maintenance App has no users with data to move.** So: no read-only copy from the old app, no migration notice period, no old-app banner. CSV import of old-app files stays (it already works). Why: the owner confirmed nobody but them has data in it.
- **Delete all data deletes only Pickle It's data** (the `pickle-it` database and `pickle-it:` keys). No option to delete the old app's data. Why: no old-app users to clean up after.
- **Keep tests/contrast-check.mjs.** Plain Node, no runner, no package.json.
- **Quick-accept batch accepted as recommended** (the full list as it stood in docs/open-questions.md on this date):
  - Due text with no estimate: "63 hr", "5.5 hr over", "Due now", "Add a reading" (also for miles).
  - Estimate only when the latest reading is under 90 days old and two readings are 30+ days apart.
  - Tap a row for Done / Skip / Add reading in place (not swipe), with an 8-second Undo.
  - More than 50 in a box: "Showing 50 of 57" with links to each jar holding the rest.
  - Box hints "Overdue and the next 7 days", "In 1 to 4 weeks", "4 weeks or more"; empty header "Nothing needs attention this week".
  - Inside a jar: due boxes first, then the jar's things; a thing opens its own screen. A jar can link into Settings > Assets.
  - Bottom bar built as navigation, not tabs, and hidden on Settings.
  - "hr" for every hour amount. Year shown on estimated dates more than ~6 months out.
  - Rotating empty-state lines from docs/design/system.md, pun included.
  - Settings: Assets tab opens first, then remembers the last tab. Jar show/hide switches in App settings; jars not picked in onboarding start hidden.
  - Delete all data: type DELETE (any case) to confirm; also resets theme and palette; deletes the whole Pickle It database in one step.
  - Seasonal tasks on fixed calendar dates. Appliances can be their own thing; starter tasks sit on the home by default. Finance things are households or named accounts, default "Household". Warn in v1 when Health/Finance text looks like an account or card number.
  - Colors: add `--err-ink` and a per-palette `--line-strong`; backup dot uses `--err` with screen-reader text; darken light-mode `--ok` slightly in every palette.
  - Starter lists: unsourced intervals stay as marked, editable defaults. Engine air filter 30,000 mi or 1 year; battery check yearly in fall; CO alarm uses the printed date, 7 years as fallback; keep all 12 vehicle tasks with the monthly tire check paused; estimated taxes as four yearly tasks with a note that the IRS may shift dates.
- **Still open:** generator oil interval (see docs/open-questions.md).

## 2026-11-03 (Phase 2)
- **Settings layout is Option C** (docs/design/settings-option-c.html): two tabs, Assets first, with search (matches task names too) and jar filter chips; App settings is the second tab. Why: fewest taps to a task, fits at 320 px, handles long asset lists.

## 2026-11-03 (Phase 1 decisions)
- **Health tracks reminders only in v1:** recurring appointments and renewals per person, no medical fields.
- **Finance tracks money deadlines only in v1:** no amounts. Optional amounts may follow later after a privacy review.
- **Ship as an installable web app (PWA) only for v1.** Google Play maybe later; no Apple App Store for v1.
- **Launch on the GitHub Pages address for now** (same github.io origin as the Vehicle Maintenance App). Once Pickle It v1 is ready, the owner deletes the Vehicle Maintenance App, since Pickle It replaces it. Overrides the recommendation of a separate origin. Why: Pickle It includes everything the old app does.
- **One lawyer engagement before launch** covering the name ("PICKL-IT" trademark), privacy policy and terms, before spending on a domain or branding.
- **Due boxes:** This week = overdue plus today to day 6 (rolling); This month = days 7-27; Later = day 28 on.
- **Mileage tasks show "<miles remaining> / <estimated date>"**, with the date estimated from recent driving. No "about" label.
- **Hours-of-use tasks show "<hours remaining> / <estimated date>"**, with the date estimated from hours per day between readings.
- **Each small engine is its own thing in Home** (e.g. "Mower") and holds its own hour reading.
- **A task can combine two measures** only as miles + time or hours + time (whichever comes first).
- **Several homes and several people** are allowed.
- **Users can hide jars they don't use.**
- **Units: miles and gallons** for v1.
- **Season dates:** the content curator picks per task, with fixed season starts as the fallback.
- **Health/Finance privacy:** discreet task names plus hiding jars in v1; a per-jar "hide names" setting can come in v1.1. One full backup export with a plain warning that it isn't encrypted; no per-jar export option for now.
- **Settings is reached from the Pantry** and has its own tabs instead of tabs inside each jar:
  - **App settings:** light/dark mode, color palette, import and export, the data storage note, how to install as an app, and a "delete all data" button that asks the user to confirm at least twice.
  - **Assets:** edit houses, appliances, vehicles and family members, plus all tasks for each one.
  - Layout to be chosen from three mockups: all assets in one tab, a tab per category, and a designer's choice.
- **Personal version stays separate.** It won't be migrated wholesale. Long-term, Pickle It gets AI features such as reading fill-up and mechanic receipts. Not in v1.

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
