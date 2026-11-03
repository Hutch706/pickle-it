# Open questions
Each needs an owner decision. Once decided, move it to docs/decisions.md.

## Settings page (mockups: docs/design/settings-option-a/b/c.html, comparison: docs/design/settings-options.md)
- **First tab shown.** Recommended: Assets, then remember the last tab used.
- **Where jar show/hide lives.** Recommended: switches under "Jars on the tab bar" in App settings.
- **Delete all data.** Second confirmation: type DELETE (any case) (recommended), a second dialog, or press-and-hold. Also resets theme and palette: recommended yes, said in step 1.
- **Bottom tab bar on Settings.** Recommended: hidden (Settings has its own Back).
- **Two new color tokens** (`--err-ink`, `--line-strong`) in all 7 palettes to fix contrast failures in today's app.css (white on red delete button in dark mode; input borders at 1.4:1). Recommended: yes.

## Data and due dates (docs/specs/data-model.md, docs/specs/v1-scope.md)
- **Due text when no date can be estimated** (v1-scope D11). Recommended: show the remaining amount only ("63 hr"), "5.5 hr over" when overdue, "Due now" when the estimate has passed, "Add a reading" with no reading.
- **When an estimate is too old to trust.** Recommended: estimate only when the latest reading is under 90 days old and two readings are 30+ days apart.
- **Seasonal tasks.** Fixed calendar dates (recommended) or "last done + interval, snapped to a preferred month" (that rule can skip a year).
- **Appliances** (D12). Recommended: an appliance can be its own thing like a mower; starter tasks sit on the home by default. Showing "Furnace · Main house" needs a thing-to-thing link (data-architect to check).
- **Finance things** (D13). Recommended: households or accounts the user names, default "Household".
- **Warning when Health/Finance text looks like an account or card number** (D14). Recommended: in v1, cuttable.

## Moving Vehicle Maintenance App users
- **How.** A) CSV only; B) CSV plus a one-time read-only copy from the old app's data, on a button. Recommended: B. The copy can't reach iPhone home-screen installs or other devices, so CSV stays.
- **Notice before the old app is deleted** (D16). Recommended: a final old-app update with a banner and Export button, then at least 60 days after Pickle It v1 is live.

## Starter libraries (docs/content/)
- **Defaults no source backs:** oil 5,000 mi or 6 mo, cabin filter 1 yr, brake fluid 2 yr, dental 6 mo, eye exam 2 yr, CO alarm 5 yr. Recommended: keep as marked defaults; CO alarm uses the date printed on the unit, 5 yr as fallback.
- **Vehicle list size.** Recommended: keep all 12, with the monthly tire check starting paused.
- **Estimated taxes.** Recommended: four yearly calendar tasks; a setup note that the IRS may shift dates for weekends and holidays.

## Later
- **Tabs inside each jar:** replaced by Settings tabs (decided). Nothing open.
