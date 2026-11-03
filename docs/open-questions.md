# Open questions
Each needs an owner decision. Once decided, move it to docs/decisions.md.
Mockups: docs/design/pantry.html, jars.html, onboarding.html, settings-option-c.html. Items marked "pending owner decision" on a mockup are listed here.

## Needs your judgment
- **Delete all data and the old app's data** (privacy P2-1). A) only tell the user the Vehicle Maintenance App's data stays and how to remove it; B) add an unticked "Also delete Vehicle Maintenance App data in this browser" box. Recommended: B. Once the old site is gone, Pickle It is the only thing that can delete it.
- **Moving old-app users.** A) CSV only; B) CSV plus a one-time read-only copy on a button. Recommended: B, with the privacy fixes (detect the old database without ever creating it). The old app gets a final update with a banner and Export button, and stays up at least 60 days after Pickle It v1 is live.
- **Generator oil interval.** The curator couldn't confirm Honda's EU2200i interval (draft: 100 hr or 6 months; one unclear source said 50 hr or 3 months). Please check your manual, or make it time-only.
- **Keep tests/contrast-check.mjs?** A plain Node script, no runner, no package.json. CLAUDE.md says to ask before adding a test runner; this isn't one, but it's the first file under tests/. Recommended: keep.

## Quick-accept batch (all recommended answers)
Pantry and jars:
- Due text with no estimate: "63 hr", "5.5 hr over", "Due now", "Add a reading" (also for miles).
- Estimate only when the latest reading is under 90 days old and two readings are 30+ days apart.
- Tap a row to get Done / Skip / Add reading in place (not swipe), with an 8-second Undo.
- More than 50 in a box: "Showing 50 of 57" with links to each jar holding the rest.
- Box hints: "Overdue and the next 7 days", "In 1 to 4 weeks", "4 weeks or more"; header says "Nothing needs attention this week" instead of "0 things".
- Inside a jar: due boxes first, then the jar's things; tapping a thing opens its own screen.
- A jar can link into Settings > Assets (a second way in besides the Pantry gear).
- Bottom bar built as navigation, not tabs, for screen readers.
- "hr" for every hour amount (not "hrs").
- Year shown on estimated dates more than ~6 months out (e.g. "Jun 3, 2027").
- Rotating empty-state lines in docs/design/system.md (one pun, "Not a dill thing to do this week"; cut if too much).

Settings and onboarding:
- Assets tab opens first, then remember the last tab.
- Jar show/hide switches in App settings; jars not picked in onboarding start hidden.
- Delete all data: type DELETE (any case) to confirm; also resets theme and palette; deletes the whole Pickle It database in one step.
- Bottom tab bar hidden on Settings.

Data:
- Seasonal tasks on fixed calendar dates.
- Appliances can be their own thing; starter tasks sit on the home by default.
- Finance things are households or accounts the user names, default "Household".
- Warn in v1 when Health/Finance text looks like an account or card number.

Colors (docs/reviews/contrast-2026-11-03.md):
- Add `--err-ink` (fixes white-on-red Delete in dark mode, a blocker in all 7 palettes) and `--line-strong` with a tinted value per palette.
- Backup dot uses `--err` and gets screen-reader text.
- Darken light-mode `--ok` slightly in every palette.

Starter lists (docs/content/):
- Keep unsourced intervals as marked defaults users can change (oil 5,000 mi or 6 mo, dental 6 mo, and the rest marked "(no source found)").
- Engine air filter: 30,000 mi or 1 year. Battery check: yearly in fall. CO alarm: use the date printed on the alarm, 7 years as fallback.
- Keep all 12 vehicle tasks; monthly tire check starts paused.
- Estimated taxes as four yearly tasks, with a note that the IRS may shift dates.

## Later
- Nothing open.
