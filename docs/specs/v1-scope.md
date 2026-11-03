# Pickle It v1 launch scope

Status: draft for owner review, revised 2026-11-03 to match docs/decisions.md. Items marked **(decided)** are logged there; everything else is a proposal until the owner logs it.

## 1. Problem and who it's for
People own things that need regular care: cars that need oil changes, furnaces that need a fall tune-up, mowers that need winterizing, plus life admin that comes round on a schedule (a dental cleaning, a registration renewal). The reminders live in their heads, on stickers, or nowhere. Pickle It puts every upcoming task in one place, sorted by when it's due, on the phone they already carry.

v1 is for everyday people, not mechanics, contractors or clinicians:
- Someone with one or more cars (dealer, independent shop, or DIY) who wants to know when service is due and what their MPG is.
- A homeowner (or renter with some upkeep, like a yard or a window AC) who wants seasonal, yearly and small-engine reminders.
- Someone who wants simple recurring reminders for health appointments and money deadlines, without the app holding medical or account details.
- People already using the Vehicle Maintenance App who want to move their data over.

Assume a mix: some people track two cars and no home, some a home and no car, some a cabin and a truck, some only health and finance reminders.

## 2. What already exists (imported Vehicle Maintenance App code)
From index.html, app.js, data.js and README.md:
- Three tabs: Log (add fill-up / add maintenance, MPG, maintenance due, recent fill-ups, service history), Vehicles (add-a-vehicle walkthrough, edit/delete vehicles, shops list), Settings.
- Settings holds: Options (Light / Dark / System, 7-palette picker, Green default), Export CSV, Import CSV (preview, then Merge or Replace), Storage on this device, Install as an app.
- Storage already uses the `pickle-it` database and `pickle-it:` settings keys **(decided)**. CSV rows already carry `format_version` **(decided)**.
- Maintenance schedules are mileage-only (`every` / `remind` in miles), seeded from an 8-item `STANDARD_SCHEDULE`. Each vehicle gets its own editable copy.
- Backup reminder nudge, iOS install nudge, MPG outlier warning, missed fill-up detection.
- Local-only storage in IndexedDB; no accounts.

Nothing yet for Home, Health or Finance, for time, hours or date recurrence, a cross-category home screen, or onboarding beyond the add-a-vehicle walkthrough.

## 3. v1 at a glance

| Area | v1 | Notes |
|---|---|---|
| Vehicles jar | In **(decided)** | Everything the imported app does today, moved into a jar |
| Home jar | In **(decided)** | Recurring tasks by months, hours of use or fixed dates |
| Health jar | In **(decided)** | What it tracks is open: D1 |
| Finance jar | In **(decided)** | What it tracks is open: D2 |
| Pets jar | Out | Not a v1 category **(decided)**; mockups only |
| Pantry home | In **(decided)** | Three due boxes, 50-item caps, witty empty state |
| Bottom tab bar | In **(decided)** | Pantry (cabinet icon) + one jar per category |
| Inside each jar (tabs/sections) | Owner decides later **(decided)** | This spec lists what each jar must let you do, not how it's laid out |
| Onboarding | In | Short first-run flow |
| Starter task libraries | In | Vehicles (from STANDARD_SCHEDULE, reviewed), Home (new), Health and Finance (small, pending D1/D2) |
| Backup: CSV export / import | In | All jars; `format_version` on every row **(decided)**; still imports Vehicle Maintenance App files |
| Settings (screen, not a tab) | In | Placement: D3 |
| Look | In **(decided)** | Follows app.css; Green default; all 7 palettes, each light and dark, plus Light / Dark / System |
| Storage | Local-only **(decided)** | Built so cloud storage can be added later; see section 7 |
| Push notifications, accounts, sync | Out | See section 6 |

## 4. User stories and acceptance criteria

Terms used below (matching docs/specs/data-model.md):
- **Jar**: a category tab: Vehicles, Home, Health, Finance.
- **Thing**: what a task belongs to inside a jar: a vehicle, a home, a person (Health), a household (Finance). Each thing is in one jar.
- **Task**: one recurring thing to do (oil change, furnace tune-up, dental cleaning, registration renewal). The data model calls this a "maintenance item". Each task belongs to one thing.
- **Measure**: what a task repeats by: odometer miles, a time interval (days, weeks, months, years), hours of use, or fixed recurring dates **(decided)**.
- **Due date**: the date a task is next due. For miles and hours tasks it's an estimate (see D6, D7).
- **Overdue**: due date before today, or for miles/hours tasks, the latest reading past the due reading.
- **Today / this week**: device local date. "This week" means today through today + 6 days (D10).

### 4.1 Tab bar
Stories:
- As a user, I can get to my Pantry or any jar in one tap from anywhere, so I never hunt for a screen.
- As a user, I can see at a glance which jar has something due this week.

Acceptance criteria:
1. A bottom tab bar is visible on the Pantry and every jar screen, and stays visible while the screen scrolls.
2. The far-left tab is Pantry, styled as the brief describes (raised solid rounded square in the palette's main color, white cabinet icon, thin divider after it).
3. Each jar has one tab, in a fixed order: Vehicles, Home, Health, Finance (unless hidden, D8).
4. A jar tab shows a red dot when that jar has at least one task in This week (including overdue). The dot disappears when none remain.
5. The active jar shows a filled jar, white icon and bold label in the palette's main color; while a jar is active the Pantry tab switches to its outlined style.
6. Every tab has an accessible name that includes the jar name and, when the red dot shows, "has items due" (or equivalent).
7. There is no Settings tab (D3).
8. Five tabs fit and remain usable at 320 px wide and with the largest system text size (labels may truncate; touch targets stay at least 44 x 44 px).

### 4.2 Pantry home
Stories:
- As a user, I open the app and immediately see what needs doing this week, across all my jars.
- As a user, I can glance at what's coming later without opening each jar.
- As a user, I can mark a task done right from the Pantry.

Acceptance criteria:
1. The header shows "PICKLE IT", "Your pantry", and "N things need attention this week", where N is the number of tasks in the This week box. N = 1 reads "1 thing needs attention this week".
2. Three collapsible boxes appear in this order: This week, This month, Later.
3. This week holds tasks overdue or due today through today + 6 days. Overdue tasks are listed first and labeled "Overdue" with the due badge color.
4. This month holds tasks due from today + 7 through today + 27 days (the brief's "2-4 weeks"; D10).
5. Later holds tasks due from today + 28 days onward.
6. Within each box, tasks are sorted by due date, earliest first; ties follow the data model's order (miles left, then thing name, task name).
7. Each box shows at most 50 tasks. When more exist, the box ends with "N more" and a way to see them in their jars. The header count in AC 1 counts all This week tasks, not only the 50 shown.
8. Each task row shows the task name, the thing name ("2019 Civic", "Main house", "Me"), the jar icon, and when it's due ("Overdue", "Today", "in 5 days", "Mar 14", "~1,200 mi", "~6 hrs").
9. When This week is empty, it shows one witty canning line (e.g. "Everything's sealed tight. Nothing to pickle this week."). Lines can rotate; final copy comes from release-manager / ux-designer.
10. Each box can be collapsed and expanded; the choice is remembered on the device.
11. A user can mark a task done from its row. Done asks for the date (default today) and, for miles or hours tasks, the current reading (default the latest known). Saving recalculates the next due date and moves the task to the right box immediately.
12. When the user has no things at all, the Pantry shows a first-step prompt to set something up instead of three empty boxes.
13. The screen scrolls above the tab bar; the last row is never hidden behind it.

### 4.3 Recurrence (all jars)
Tasks can repeat by any measure **(decided)**. Stories:
- As a driver, my oil change comes due by odometer miles.
- As a homeowner, my furnace filter comes due every 3 months after I last changed it.
- As a mower or generator owner, its oil change comes due after N hours of use.
- As a homeowner, winter prep comes due on the same date every fall, and recycling drop-off every other week on a fixed day, no matter when I last did it.

Acceptance criteria:
1. A task can repeat by: every N miles (vehicles only); every N days, weeks, months or years from when it was last done; every N hours of use; or on fixed recurring dates (a start date plus every N days, weeks, months or years, e.g. every Oct 15, or every 2 weeks from a given Friday).
2. Miles tasks keep today's "remind N miles before". Hours tasks have an equivalent "remind N hours before".
3. Fixed-date tasks stay on their dates: doing one early or late doesn't shift the next date, and missed occurrences show once, not once per missed cycle.
4. "From last done" tasks restart from the done date.
5. Hours of use: the user records the machine's hour reading when marking a task done, and can update the reading on its own (like an odometer reading). How hours tasks get a due date for the Pantry is D7.
6. Whether a task can combine two measures ("5,000 mi or 6 months, whichever first") is D5.
7. Adding a task asks for when it was last done (or "not sure") or, for fixed-date tasks, the next date. With "not sure", a time task is due today + interval and is never overdue on the day it's added (data-architect confirms the rule).
8. Month-end and leap-day dates follow the data model's rules (Jan 31 + 1 month = Feb 28/29).

### 4.4 Vehicles jar
Stories:
- As a driver, I can do everything the Vehicle Maintenance App does today, inside the Vehicles jar.
- As a driver, I can log a fill-up or a service in a few taps.

Acceptance criteria:
1. The Vehicles jar includes all current features: add / edit / delete vehicles (walkthrough), log fill-ups, log maintenance, MPG per vehicle and lifetime, maintenance due list, recent fill-ups, service history, shops list, MPG outlier warning, missed fill-up handling. How these are arranged inside the jar is the owner's later decision.
2. Mileage schedule behavior is unchanged: "every N miles" and "remind N miles before", and existing due-mileage math gives the same results as today.
3. A vehicle task can also use any other measure in 4.3 (e.g. "every 12 months" for a cabin air filter); combined measures depend on D5.
4. Every vehicle task appears in the Pantry boxes using its due date (D6).
5. New vehicles start with the reviewed vehicle starter library (4.8), which the user can edit per vehicle as today.

### 4.5 Home jar
Stories:
- As a homeowner, I can add my home and pick the recurring tasks that apply to it from a starter list.
- As a homeowner, I get seasonal tasks (spring AC tune-up, fall furnace tune-up, winter prep) at the right time every year.
- As a homeowner, I can track small engines (mower, snowblower, generator) by hours of use.
- As someone with a second place (cabin, rental), I can track it separately (D4).

Acceptance criteria:
1. A user can add, rename and delete a home. Deleting asks for confirmation and removes its tasks and history.
2. If D4 allows several homes, each has a name; the first defaults to "Home".
3. A home task has a name, a measure (4.3: interval from last done, fixed dates, or hours of use), optional notes, and a last-done date (or "not sure").
4. Small engines: a task can repeat by hours of use (4.3 AC 5). Whether a small engine is its own thing or just tasks on a home is D7.
5. A user can add a custom task, edit any task's fields, and delete a task.
6. Marking a task done records the date (and reading for hours tasks, and optional notes) in history and recalculates the next due date.
7. The user can see each home's tasks by due date and a history of completed tasks. Layout is the owner's later decision.
8. Home tasks appear in the Pantry boxes and drive the Home jar's red dot.

### 4.6 Health and Finance jars
Both are v1 jars **(decided)**, but what they track isn't defined yet. This section proposes the smallest useful version of each; the owner decides (D1, D2). The proposal reuses the Home engine: things with time or fixed-date tasks, done logs and notes. No new measures, no new screens beyond what Home needs.

**Health: what a v1 Health jar tracks**

| Option | Tracks | Cost | Privacy |
|---|---|---|---|
| A. Recurring appointments and renewals *(recommended)* | Things are people ("Me", "Sam"). Tasks are time or fixed-date reminders: annual physical, dental cleaning every 6 months, eye exam, flu shot each fall, prescription refill every 30 days, contact lens replacement. | Same as Home. Small starter library. | Task names and dates reveal some health facts (e.g. "Insulin refill"). No dedicated medical fields. |
| B. A plus medication schedules | Daily or per-dose medication reminders and adherence. | Needs notifications to be useful; out of v1 (section 6). High test burden. | Higher: dosing data is clearly medical. |
| C. A plus records | Results, diagnoses, providers, documents. | New fields and screens. | Highest; regulated-feeling data on a public app. |

Recommendation: A. It's useful for anyone (people forget dental and eye exams), needs no new engine, and stays reminder-only. No fields for diagnoses, medications, doses or provider details; notes stay free text.

**Finance: what a v1 Finance jar tracks**

| Option | Tracks | Cost | Privacy |
|---|---|---|---|
| A. Recurring money deadlines, no amounts *(recommended)* | Things are households or accounts the user names ("Household", "Rental"). Tasks are time or fixed-date reminders: quarterly estimated taxes, annual insurance renewal, vehicle registration, property tax, check credit report, review subscriptions, annual budget check-in. | Same as Home. Small starter library. | Names and dates only. No amounts, no account numbers. |
| B. A plus amounts | An optional amount per task or done log (e.g. bill paid $120). | Currency formatting, totals people will then ask for, CSV columns. | Higher: spending patterns. |
| C. Bills and budgeting | Payees, balances, budgets. | A different product. | Highest; invites people to type account details. |

Recommendation: A. It turns Finance into "don't miss a money deadline", which fits a maintenance tracker. Amounts (B) are the natural v1.1 if users ask.

Acceptance criteria (if A and A are approved):
1. Health and Finance each let the user add, rename and delete things (people / households), with a first default ("Me" / "Household").
2. Their tasks use interval-from-last-done or fixed-date measures only (no miles or hours).
3. Tasks support name, measure, notes, last done, mark done, history, edit and delete, as in Home.
4. Their tasks appear in the Pantry boxes and drive their jar's red dot.
5. No field anywhere asks for a diagnosis, medication, dose, amount, account number or password. The notes field shows a hint such as "Don't store account numbers or passwords here."
6. The Pantry row shows only the task name, thing name and due text, so a glance at someone's phone shows no more than they typed as a task name.

**For privacy-security-reviewer:** Health and Finance raise the privacy stakes even under option A. Task names and notes can reveal conditions, medications, debts or income, and they land in the plain-text CSV backup. The earlier review (docs/reviews/privacy-security-2026-11-03.md) assumed these jars were out of v1; it needs a second pass. Questions to review: export warning copy, whether the notes hint is enough, what the Pantry shows on a lock-screen-adjacent glance, and whether a future cloud option (section 7) changes the legal picture (health data rules) for these jars.

### 4.7 Onboarding (first run)
Stories:
- As a new user, I understand what the app does and have my first thing set up in under two minutes.
- As a Vehicle Maintenance App user, I can bring my data over instead of starting again.

Acceptance criteria:
1. First run shows a single welcome screen: what Pickle It is, and that data stays on this device (local-only **(decided)**).
2. The user picks what to set up: any of the four jars, or "Import a backup". They can also skip.
3. "Vehicle" runs the existing add-a-vehicle walkthrough. Other jars run a short setup: name the thing, pick tasks from that jar's starter library, then a last-done date per task or "not sure" for all.
4. "Import a backup" opens the import flow and accepts both Pickle It backups and Vehicle Maintenance App CSVs.
5. After setup the user lands on the Pantry, which already shows their tasks.
6. Onboarding never shows again once completed or skipped; the same setup paths stay available from the empty Pantry and from each jar.
7. If D8 is approved, the jar choice also decides which jar tabs show.

### 4.8 Starter task libraries (scope only; content by maintenance-content-curator)
1. Vehicles: start from `STANDARD_SCHEDULE` (8 items). The curator reviews intervals and, if D5 is approved, adds time limits. Target 8-12 tasks.
2. Home: physical upkeep, medium and large appliances, yard work and small engines, including the brief's examples (spring AC tune-up, fall furnace tune-up, winterizing outdoor small engines) and at least one hours-of-use task (e.g. mower oil change) and one fixed-date task (e.g. winter prep). Target 15-25 tasks.
3. Health and Finance: 5-10 tasks each, only if D1 / D2 are approved as proposed.
4. Every library task is generic and safe for a non-expert ("Have a pro service the furnace", not repair instructions; "Schedule a dental cleaning", not medical advice; no tax or investment advice).
5. Seasonal dates assume a Northern Hemisphere temperate climate in v1; users can edit any date (see Risks).
6. Changing a library later doesn't change tasks users already have (same as today's vehicle behavior).

### 4.9 Backup, import and export
Stories:
- As a user, I can save everything to a file and restore it on another device.

Acceptance criteria:
1. Export writes one CSV containing every jar: things, fill-ups, tasks (all measures), shops, hour readings and done history.
2. Every row has a `format_version` column **(decided)**. Files without it (Vehicle Maintenance App) import as version 1.
3. Import shows a preview and offers Merge or Replace, as today.
4. Import accepts a Vehicle Maintenance App CSV and brings over all its vehicle data.
5. Export from one device then import on an empty device gives identical data (as today).
6. The backup reminder nudge still works and counts changes in all jars.
7. Export, import, storage and install all live on the Settings screen (D3).

### 4.10 Settings screen
1. Reached from wherever D3 places it; has a way back to the Pantry.
2. Contains: Appearance (Light / Dark / System, and the 7-palette picker with Green as the default **(decided)**), Backup (export, import), Storage on this device, Install as an app, About (version, privacy link once it exists), and jar visibility if D8 is approved.

## 5. Needs a decision

**D1. What does the Health jar track in v1?** See 4.6.
- A. Recurring appointments and renewals per person, no medical fields. *(Recommended)*
- B. A plus medication schedules.
- C. A plus records (results, providers, documents).

Recommendation: A. Useful, no new engine, lowest privacy risk. B needs notifications to work; C is a different product.

**D2. What does the Finance jar track in v1?** See 4.6.
- A. Recurring money deadlines, no amounts. *(Recommended)*
- B. A plus optional amounts.
- C. Bills and budgeting.

Recommendation: A, with B as the first follow-up. Related boundary: vehicle registration and insurance fit both Vehicles and Finance. Recommend letting them live wherever the user adds them, with the Vehicles library holding registration and the Finance library holding insurance renewals, so they don't show twice by default.

**D3. Where do backup, import, export and options live without a Settings tab?**
- A. Gear button in the Pantry header opens a Settings screen. *(Recommended)*
- B. A Settings tab at the far right of the tab bar.
- C. A "Pantry shelf" card at the bottom of the Pantry with backup and options.

Recommendation: A. The tab bar already holds five tabs (Pantry + four jars); a sixth would crowd 320 px phones. C buries backup and grows the Pantry.

**D4. One home or several? (and several people / households in Health and Finance)**
- A. Several, like vehicles. *(Recommended)*
- B. Exactly one per jar in v1.

Recommendation: A. Cabins, rentals, a parent's house, and a family's several people are common, the vehicles pattern exists to copy, and the data model already allows it.

**D5. Can one task combine two measures ("5,000 mi or 6 months, whichever first")?**
- A. Yes, any two measures, due at whichever comes first. *(Cuttable)*
- B. Only miles + time and hours + time (the real-world cases: oil change, small-engine oil "every 50 hours or each season"). *(Recommended, cuttable)*
- C. No, one measure per task in v1.

Recommendation: B. Low-mileage drivers and light mower users otherwise never get a reminder. Miles + hours or two time measures have no real use. Cut to C first if the schedule slips.

**D6. How do mileage tasks land in date-based Pantry boxes?**
- A. Estimate a due date from the vehicle's recent miles per day (fill-ups and odometer readings); without enough history, fall back to the remind window (overdue: This week, within remind: This month, otherwise Later). *(Recommended)*
- B. Use only the remind window. No dates.

Recommendation: A. It's what users mean by "due this week". The data model already proposes this (labeled "about").

**D7. Hours of use: how it works.** New **(decided)** measure; the data model doesn't cover it yet.
- a. Due placement in the Pantry: (A) estimate a date from hours per day between readings, like D6 *(recommended)*, or (B) remind window only. Small engines are seasonal and readings are rare, so with fewer than two readings, recommend the remind-window fallback, and a mower in winter will simply sit in Later.
- b. What holds the hour reading: (A) a small engine is its own thing in the Home jar (e.g. "Mower"), with its own reading *(recommended)*; (B) the reading is stored per task on the home. A keeps one reading shared by every task on that machine (oil, spark plug, air filter), like an odometer.
- c. Machines without an hour meter: recommend the library offers a time alternative for each hours task ("every 50 hours or each spring", via D5 B).

**D8. Can users hide a jar they don't use?**
- A. Yes: chosen in onboarding, changeable in Settings. *(Recommended, cuttable)*
- B. No: all four jars always show, with an empty state.

Recommendation: A. With four jars, a renter with no car and no interest in Finance shouldn't see two empty jars forever. Hidden jars keep their data.

**D9. Units.** The app is miles and US gallons only.
- A. Keep miles / gallons for v1; list km and litres as a fast follow. *(Recommended)*
- B. Add km / litres / L per 100 km in v1.

Recommendation: A if launch is US-focused; B if the owner wants an international launch. This touches storage, math and CSV, so it's cheaper to decide now.

**D10. Pantry box boundaries.** (Also in data-model.md.)
- This week: rolling today + 6 days *(recommended)*, or the calendar week.
- This month: days 7-27 *(recommended, matches "2-4 weeks")*, or days 7-30.

**Flagged, not a decision for this spec:** what tabs or sections each jar has inside is the owner's later call **(decided)**. This spec only says what each jar must let you do. The ux-designer should not lay out jar interiors until the owner decides.

Also depends on open questions owned by others: distribution/hosting and the name check.

## 6. Out of scope for v1
- Pets jar **(decided: not a v1 category)**.
- Accounts, login, cloud sync, any backend. Storage is local-only now **(decided)**; see section 7 for keeping the cloud path open.
- Push or email notifications and calendar export. Users see due tasks when they open the app.
- Snoozing a task (the data model's "skip this time" is cuttable to v1.1).
- Shared households or multiple users on one thing.
- Photos, receipt scanning, document attachments, warranties.
- Cost tracking and reports for non-vehicle tasks (fill-up cost stays as today; Finance amounts pending D2).
- Medication dose tracking and health records (pending D1).
- Climate- or region-aware seasonal schedules; Southern Hemisphere defaults.
- Vehicle lookup by VIN or make/model-specific schedules.
- Languages other than English, and metric units (pending D9).
- User-created jars.
- Automatic reading of the old Vehicle Maintenance App's data at its old web address (CSV import covers it, per the 2026-11-03 storage-names decision).

## 7. What the data-architect needs to provide (not decided here)
In docs/specs/data-model.md (being revised in parallel):
1. Things and tasks for all four jars (Health and Finance per D1 / D2).
2. Hours of use as a measure (the current draft lists engine hours as "not included"; it's now decided in), with readings and remind window, and D7's choices.
3. Fixed recurring dates, including every-N-weeks from a start date (biweekly recycling), alongside "from last done".
4. Combined measures per D5, with "whichever first" due logic.
5. One due-date function across all measures returning due date (actual or estimated), overdue flag, and miles or hours left, so the Pantry buckets and sorts everything the same way.
6. The miles-per-day (D6) and hours-per-day (D7) estimates and fallbacks, and the "not sure" rule in 4.3 AC 7.
7. CSV covering all jars with `format_version` on every row, still reading Vehicle Maintenance App files, round-trip identical.
8. Local-only storage shaped so a later cloud option is a migration, not a rewrite (stable ids, `updatedAt`, no device-specific keys in records). Storage for jar visibility (D8), onboarding-complete flag and box collapse state.

## 8. Edge cases to cover in design and test
- A vehicle with no fill-ups or odometer readings, or a machine with one hour reading (no estimate possible).
- An hour reading entered lower than the last one (meter replaced or typo).
- A "from last done" task last done long ago: overdue by many cycles shows once.
- A fixed-date task done early, late, or skipped for several cycles.
- A biweekly fixed-date task across a month end and a daylight-saving change.
- Device date or time zone changes; boxes use the device's local date.
- More than 50 tasks in one box.
- Deleting a thing with tasks currently in the Pantry.
- Hiding a jar (D8) that has overdue tasks: they leave the Pantry; the user should be told.
- Importing a backup that duplicates a thing or task.
- Very long thing and task names at 320 px, with five tabs.
- Red dot and due badge contrast in every palette, light and dark (7 x 2 combinations).
- Sensitive words in task names (Health, Finance) shown on the Pantry.

## 9. Could be cut if v1 runs long
In order: D5 combined measures (one measure per task), D8 (hiding jars), several homes / people (one per jar), hours estimate (remind window only), marking done from the Pantry (do it in the jar), Health / Finance starter libraries (custom tasks only), rotating empty-state lines (use one). Health and Finance jars themselves are decided in and not on this list.

## 10. Risks
- Four jars plus Pantry on a 320 px tab bar is tight; the ux-designer should check early.
- Health and Finance task names in a plain-text CSV backup are more sensitive than car data.
- Seasonal and fixed dates assume the Northern Hemisphere.
- Hours of use depends on users entering readings; without them, hours tasks may never come due. The time alternative in D7c softens this.
