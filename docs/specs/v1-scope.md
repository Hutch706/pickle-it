# Pickle It v1 launch scope

Status: draft for owner review (2026-11-03). Nothing here is decided until it's logged in docs/decisions.md.

## 1. Problem and who it's for
People own things that need regular care: cars that need oil changes, furnaces that need a fall tune-up, mowers that need winterizing. The reminders live in their heads, on stickers, or nowhere. Pickle It puts every upcoming task in one place, sorted by when it's due, on the phone they already carry.

v1 is for everyday people, not mechanics or contractors:
- Someone with one or more cars (dealer, independent shop, or DIY) who wants to know when service is due and what their MPG is.
- A homeowner (or renter with some upkeep, like a yard or a window AC) who wants seasonal and yearly reminders.
- People already using the Vehicle Maintenance App who want to move their data over.

Assume a mix: some people track two cars and no home, some a home and no car, some a cabin and a truck.

## 2. What already exists (imported Vehicle Maintenance App)
From index.html, app.js, data.js and README.md:
- Three tabs: Log (add fill-up / add maintenance, MPG, maintenance due, recent fill-ups, service history), Vehicles (add-a-vehicle walkthrough, edit/delete vehicles, shops list), Settings.
- Settings holds: Options (Light / Dark / System, 7-color palette picker), Export CSV, Import CSV (preview, then Merge or Replace), Storage on this device, Install as an app.
- Maintenance schedules are mileage-only (`every` / `remind` in miles), seeded from an 8-item `STANDARD_SCHEDULE`. Each vehicle gets its own editable copy.
- Backup reminder nudge, iOS install nudge, MPG outlier warning, missed fill-up detection.
- Local-only storage in IndexedDB; no accounts.

Nothing for home tasks, time-based recurrence, a cross-category home screen, or onboarding beyond the add-a-vehicle walkthrough.

## 3. v1 at a glance

| Area | v1 | Notes |
|---|---|---|
| Vehicles jar | In | Everything the imported app does today, moved into a jar |
| Home jar | In | New: time-based recurring tasks |
| Pantry home | In | Three due boxes, 50-item caps, witty empty state |
| Bottom tab bar | In | Pantry + one jar per shipped category |
| Onboarding | In | Short first-run flow |
| Starter task libraries | In | Vehicles (from STANDARD_SCHEDULE, reviewed) and Home (new) |
| Backup: CSV export / import | In | Covers both jars; still imports old Vehicle Maintenance App files |
| Settings (screen, not a tab) | In | See decision D3 |
| Dark mode | Recommend in | Decision D2 |
| 7-color palette picker | Recommend out | Decision D2 |
| Health, Finance, Pets | Recommend out | Decision D1 |
| Push notifications, accounts, sync | Out | See section 6 |

## 4. User stories and acceptance criteria

Terms used below:
- **Task**: one recurring thing to do (oil change, furnace tune-up).
- **Item**: a vehicle or a home. Each task belongs to one item, each item to one jar.
- **Due date**: the date a task is next due. For mileage tasks it's an estimate (see D6).
- **Overdue**: due date before today, or for mileage tasks, current odometer past the due mileage.
- **Today / this week**: device local date. "This week" means today through today + 6 days.

### 4.1 Tab bar
Stories:
- As a user, I can get to my Pantry or any jar in one tap from anywhere, so I never hunt for a screen.
- As a user, I can see at a glance which jar has something due this week.

Acceptance criteria:
1. A bottom tab bar is visible on the Pantry and every jar screen, and stays visible while the screen scrolls.
2. The far-left tab is Pantry, styled as the brief describes (raised solid green rounded square, white icon, thin divider after it). The icon follows the open "Pantry icon" decision.
3. Each shipped jar has one tab, in a fixed order: Vehicles, then Home.
4. A jar tab shows a red dot when that jar has at least one task in This week (including overdue). The dot disappears when none remain.
5. The active jar shows a filled green jar, white icon and bold green label; while a jar is active the Pantry tab switches to its outlined style.
6. Every tab has an accessible name that includes the jar name and, when the red dot shows, "has items due" (or equivalent).
7. There is no Settings tab (see D3).
8. Tabs remain usable at 320 px wide and with the largest system text size (labels may truncate; touch targets stay at least 44 x 44 px).

### 4.2 Pantry home
Stories:
- As a user, I open the app and immediately see what needs doing this week, across all my things.
- As a user, I can glance at what's coming later without opening each jar.
- As a user, I can mark a task done right from the Pantry.

Acceptance criteria:
1. The header shows "PICKLE IT", "Your pantry", and "N things need attention this week", where N is the number of tasks in the This week box. N = 1 reads "1 thing needs attention this week".
2. Three collapsible boxes appear in this order: This week, This month, Later.
3. This week holds tasks overdue or due today through today + 6 days. Overdue tasks are listed first and labeled "Overdue" with the due badge color.
4. This month holds tasks due from today + 7 through today + 27 days (the brief's "2-4 weeks").
5. Later holds tasks due from today + 28 days onward.
6. Within each box, tasks are sorted by due date, earliest first; ties sort by jar order, then item name, then task name.
7. Each box shows at most 50 tasks. When more exist, the box ends with "N more" and a way to see them in their jars. The header count in AC 1 counts all This week tasks, not only the 50 shown.
8. Each task row shows the task name, the item name (e.g. "2019 Civic", "Main house"), the jar icon, and when it's due ("Overdue", "Today", "in 5 days", "Mar 14", or "~1,200 mi" for mileage tasks).
9. When This week is empty, it shows one witty canning line (e.g. "Everything's sealed tight. Nothing to pickle this week."). Lines can rotate; final copy comes from release-manager / ux-designer.
10. Each box can be collapsed and expanded; the choice is remembered on the device.
11. A user can mark a task done from its row. Done asks for the date (default today) and, for vehicle tasks, the odometer (default the latest known). Saving recalculates the next due date and moves the task to the right box immediately.
12. When the user has no items at all, the Pantry shows a first-step prompt to add a vehicle or a home instead of three empty boxes.
13. The screen scrolls above the tab bar; the last row is never hidden behind it.

### 4.3 Vehicles jar
Stories:
- As a driver, I can do everything the Vehicle Maintenance App does today, inside the Vehicles jar.
- As a driver, I can log a fill-up or a service in a few taps.

Acceptance criteria:
1. The Vehicles jar includes all current features: add / edit / delete vehicles (walkthrough), log fill-ups, log maintenance, MPG per vehicle and lifetime, maintenance due list, recent fill-ups, service history, shops list, MPG outlier warning, missed fill-up handling.
2. Mileage schedule behavior is unchanged: each task has "every N miles" and "remind N miles before", and existing due-mileage math gives the same results as today.
3. If D5 is approved: a vehicle task can also have an optional "or every N months", and it's due at whichever comes first.
4. Every vehicle task appears in the Pantry boxes using its due date (D6).
5. New vehicles start with the reviewed vehicle starter library (4.6), which the user can edit per vehicle as today.
6. App copy says "Pickle It", not "Vehicle Maintenance App" (titles, file names, messages).

### 4.4 Home jar
Stories:
- As a homeowner, I can add my home and pick the recurring tasks that apply to it from a starter list.
- As a homeowner, I get seasonal tasks (spring AC tune-up, fall furnace tune-up) in the right season, every year.
- As someone with a second place (cabin, rental), I can track it separately.

Acceptance criteria:
1. A user can add, rename and delete a home. Deleting asks for confirmation and removes its tasks and history.
2. Multiple homes are allowed (D4). Each has a name; the first defaults to "Home".
3. A home task has: a name, a repeat interval (every N weeks, months or years), an optional preferred month for seasonal tasks (D7), optional notes, and a last-done date (or "not sure").
4. The next due date is last done + interval. With a preferred month, it's the first day of the next occurrence of that month on or after last done + interval.
5. With "not sure", a task with a preferred month is due on the first day of that month's next occurrence, or today if that month is the current month; a task without one is due today + interval. A "not sure" task is never overdue on the day it's added. (Recommended rule; data-architect confirms.)
6. A user can add a custom task, edit any task's fields, and delete a task.
7. Marking a task done records the date (and optional notes) in the home's history and recalculates the next due date.
8. The Home jar lists each home's tasks sorted by due date and shows a history of completed tasks.
9. Home tasks appear in the Pantry boxes and drive the Home jar's red dot.

### 4.5 Onboarding (first run)
Stories:
- As a new user, I understand what the app does and have my first thing set up in under two minutes.
- As a Vehicle Maintenance App user, I can bring my data over instead of starting again.

Acceptance criteria:
1. First run shows a single welcome screen: what Pickle It is, and that data stays on this device (wording depends on the storage decision).
2. The user picks what to set up: a vehicle, a home, both, or "Import a backup". They can also skip.
3. "Vehicle" runs the existing add-a-vehicle walkthrough. "Home" runs a short home setup: name, then pick tasks from the home starter library (all pre-checked or none pre-checked: ux-designer's call), then last-done date per task or "not sure" for all.
4. "Import a backup" opens the import flow and accepts both Pickle It backups and Vehicle Maintenance App CSVs.
5. After setup the user lands on the Pantry, which already shows their tasks.
6. Onboarding never shows again once completed or skipped; the same setup paths stay available from the empty Pantry and from each jar.
7. If D8 is approved, the jar choice also decides which jar tabs show.

### 4.6 Starter task libraries (scope only; content by maintenance-content-curator)
1. Vehicles: start from `STANDARD_SCHEDULE` (8 items). The curator reviews intervals and, if D5 is approved, adds time limits. Target 8-12 tasks.
2. Home: new library covering physical upkeep, medium and large appliances, and yard work, including the brief's examples (spring AC tune-up, fall furnace tune-up, winterizing outdoor small engines). Target 15-25 tasks, each with a name, interval and optional preferred month.
3. Every library task is generic and safe for a non-expert ("Have a pro service the furnace", not repair instructions).
4. Seasonal months assume a Northern Hemisphere temperate climate in v1; users can edit any month (see Risks).
5. Changing a library later doesn't change tasks users already have (same as today's vehicle behavior).

### 4.7 Backup, import and export
Stories:
- As a user, I can save everything to a file and restore it on another device.

Acceptance criteria:
1. Export writes one file containing both jars: vehicles, fill-ups, vehicle tasks and log, shops, homes, home tasks and home history.
2. Import shows a preview and offers Merge or Replace, as today.
3. Import accepts a Vehicle Maintenance App CSV and brings over all its vehicle data.
4. Export from one device then import on an empty device gives identical data (as today).
5. The backup reminder nudge still works and counts changes in both jars.
6. Export, import, storage and install all live on the Settings screen (D3).

### 4.8 Settings screen
1. Reached from a gear button in the Pantry header (D3); has a back button to the Pantry.
2. Contains: Appearance (Light / Dark / System if D2 keeps dark mode), Backup (export, import), Storage on this device, Install as an app, About (version, privacy link once it exists), and jar visibility if D8 is approved.
3. No palette picker unless D2 keeps it.

## 5. Needs a decision

**D1. Do Health, Finance and Pets ship at launch?**
- A. No. Ship Vehicles and Home only; add others later. *(Recommended)*
- B. Show them as locked "coming soon" jars.
- C. Ship one generic "Other" jar for custom time-based tasks.

Recommendation: A. None of the three is defined, each brings its own risks (health and finance data are sensitive and raise the privacy bar), and empty jars in the tab bar look broken. The time-based engine built for Home makes C cheap later; Pets is the easiest follow-up (vet visits, flea meds are just recurring tasks).

**D2. Dark mode and the 7-color palette picker.**
- A. Keep Light / Dark / System; drop the palette picker. *(Recommended)*
- B. Keep both.
- C. Drop both.

Recommendation: A. Dark mode is expected on phones and helps at night; it just needs a pickle-green dark palette from the ux-designer. Seven palettes conflict with the one-green brand and multiply design and test work.

**D3. Where do backup, import, export and options live without a Settings tab?**
- A. Gear button in the Pantry header opens a Settings screen. *(Recommended)*
- B. Keep a Settings tab at the far right of the tab bar.
- C. A "Pantry shelf" card at the bottom of the Pantry with backup and options.

Recommendation: A. Keeps the brief's tab bar intact, is a familiar pattern, and Settings is rarely visited. B takes tab space future jars need; C buries backup and grows the Pantry.

**D4. One home or several?**
- A. Several, like vehicles. *(Recommended)*
- B. Exactly one home in v1.

Recommendation: A. Cabins, rentals and a parent's house are common, and the vehicles pattern already exists to copy.

**D5. Vehicle tasks: add an optional time limit ("5,000 mi or 6 months")?**
- A. Yes, optional, whichever comes first. *(Recommended, cuttable)*
- B. No, mileage-only in v1.

Recommendation: A. Low-mileage drivers otherwise never get an oil-change reminder, and the time engine is being built for Home anyway. Cut it first if the schedule slips.

**D6. How do mileage tasks land in date-based Pantry boxes?**
- A. Estimate a due date from the vehicle's recent miles per day (from fill-ups and odometer readings); without enough history, use a fallback (overdue goes to This week, within the remind window goes to This month, otherwise Later). *(Recommended)*
- B. Use only the remind window: within it = This month, overdue = This week, otherwise Later. No dates.

Recommendation: A. It's what users mean by "due this week". Data-architect sets the exact estimate and the minimum history needed.

**D7. Home recurrence model.**
- A. Every N weeks / months / years from last done, plus optional preferred month for seasonal tasks. *(Recommended)*
- B. Interval only, no preferred month.
- C. Fixed calendar dates only ("every Oct 1").

Recommendation: A. Covers both "every 3 months" (filters) and "every fall" (furnace) without a calendar UI.

**D8. Can users hide a jar they don't use (no car, no home)?**
- A. Yes: chosen in onboarding, changeable in Settings. *(Recommended, cuttable)*
- B. No: both jars always show, with an empty state.

Recommendation: A. A renter without a car shouldn't see an empty Vehicles jar forever, and this sets up adding more jars later.

**D9. Units.** The app is miles and US gallons only.
- A. Keep miles / gallons for v1; list km and litres as a fast follow. *(Recommended)*
- B. Add km / litres / L per 100 km in v1.

Recommendation: A if launch is US-focused; B if the owner wants an international launch. This touches storage, math and CSV, so it's cheaper to decide now.

Also depends on open questions owned by others: storage model (local-only vs. sync), Pantry icon, distribution, and the name check.

## 6. Out of scope for v1
- Health, Finance and Pets jars (pending D1).
- Accounts, login, cloud sync, any backend (pending the storage decision; this spec assumes local-only like today).
- Push or email notifications and calendar export. Users see due tasks when they open the app.
- Snoozing or skipping a task (mark done or edit the interval instead). Cuttable candidate for v1.1.
- Shared households or multiple users on one item.
- Photos, receipt scanning, document attachments, warranties.
- Cost tracking and reports for home tasks (fill-up cost stays as today).
- Climate- or region-aware seasonal schedules; Southern Hemisphere defaults.
- Vehicle lookup by VIN or make/model-specific schedules.
- Additional palettes (pending D2), languages other than English, and metric units (pending D9).
- Automatic reading of the old Vehicle Maintenance App's data at its old web address (not possible across addresses; CSV import covers it).

## 7. What the data-architect needs to provide (not decided here)
Working in parallel on storage; this spec needs, in docs/specs/data-model.md or equivalent:
1. A home and home-task model: homes, tasks (name, interval value + unit, optional preferred month, notes, library id), and completion history.
2. Optional time limit on vehicle tasks (if D5), with "whichever first" due logic.
3. One due-date function across jars returning: due date (actual or estimated), overdue flag, and for mileage tasks the miles left, so the Pantry can bucket and sort everything the same way.
4. The miles-per-day estimate and fallback for D6, and the "not sure when last done" rule in 4.4 AC 5.
5. Rules for month-end and leap-day dates (e.g. every month from Jan 31).
6. Backup file format covering both jars, still reading Vehicle Maintenance App CSVs, with round-trip export/import giving identical data.
7. The database name and migration for Pickle It (today: "vehicle-maintenance-app"), and storage for jar visibility (D8), onboarding-complete flag and box collapse state.

## 8. Edge cases to cover in design and test
- A vehicle with no fill-ups or odometer readings (mileage tasks can't be estimated).
- A home task last done long ago: overdue by many cycles shows once, not once per missed cycle.
- Device date or time zone changes; boxes use the device's local date.
- More than 50 tasks in one box.
- Deleting a vehicle or home with tasks currently in the Pantry.
- Importing a backup that duplicates a home or task.
- Very long item and task names at 320 px.
- Dark mode contrast of the red dot and the due badge (#B4440E).

## 9. Could be cut if v1 runs long
In order: D5 (vehicle time limits), D8 (hiding jars), multiple homes (fall back to one), marking done from the Pantry (do it in the jar instead), rotating empty-state lines (use one).
