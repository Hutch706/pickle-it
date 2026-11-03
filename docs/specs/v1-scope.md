# Pickle It v1 launch scope

Status: draft for owner review, revised 2026-11-03 to the owner's Phase 1 decisions in docs/decisions.md. Items marked **(decided)** are logged there; everything else is a proposal until the owner logs it. Open items are in section 5.

## 1. Problem and who it's for
People own things that need regular care: cars that need oil changes, furnaces that need a fall tune-up, mowers that need winterizing, plus life admin that comes round on a schedule (a dental cleaning, a registration renewal). The reminders live in their heads, on stickers, or nowhere. Pickle It puts every upcoming task in one place, sorted by when it's due, on the phone they already carry.

v1 is for everyday people, not mechanics, contractors or clinicians:
- Someone with one or more cars (dealer, independent shop, or DIY) who wants to know when service is due and what their MPG is.
- A homeowner (or renter with some upkeep, like a yard or a window AC) who wants seasonal, yearly and small-engine reminders.
- Someone who wants simple recurring reminders for health appointments and money deadlines, without the app holding medical or account details.
- People already using the Vehicle Maintenance App, which Pickle It replaces, who need to move their data over before that app is deleted.

Assume a mix: some people track two cars and no home, some a home and no car, some a cabin and a truck, some only health and finance reminders.

## 2. What already exists (imported Vehicle Maintenance App code)
From index.html, app.js, data.js and README.md:
- Three tabs: Log (add fill-up / add maintenance, MPG, maintenance due, recent fill-ups, service history), Vehicles (add-a-vehicle walkthrough, edit/delete vehicles, shops list), Settings.
- Settings holds: Options (Light / Dark / System, 7-palette picker, Green default), Export CSV, Import CSV (preview, then Merge or Replace), Storage on this device, Install as an app.
- Storage already uses the `pickle-it` database and `pickle-it:` settings keys **(decided)**. CSV rows already carry `format_version` **(decided)**.
- Maintenance schedules are mileage-only (`every` / `remind` in miles), seeded from an 8-item `STANDARD_SCHEDULE`. Each vehicle gets its own editable copy.
- Backup reminder nudge, iOS install nudge, MPG outlier warning, missed fill-up detection.
- Local-only storage in IndexedDB; no accounts.

Nothing yet for Home, Health or Finance, for time, hours or date recurrence, a cross-category home screen, a delete-all-data control, or onboarding beyond the add-a-vehicle walkthrough.

## 3. v1 at a glance

| Area | v1 | Notes |
|---|---|---|
| Vehicles jar | In **(decided)** | Everything the imported app does today, moved into a jar |
| Home jar | In **(decided)** | Several homes; each small engine is its own thing **(decided)** |
| Health jar | In **(decided)** | Recurring appointments and renewals per person, no medical fields **(decided)** |
| Finance jar | In **(decided)** | Money deadlines only, no amounts **(decided)** |
| Pets jar | Out | Not a v1 category **(decided)**; mockups only |
| Pantry home | In **(decided)** | Three due boxes (boundaries **decided**), 50-item caps, witty empty state |
| Bottom tab bar | In **(decided)** | Pantry (cabinet icon) + one tab per visible jar; no Settings tab |
| Hiding jars | In **(decided)** | Users can hide jars they don't use |
| Inside each jar | No tabs inside jars **(decided)** | This spec lists what each jar must let you do, not how it's laid out |
| Settings | In **(decided)** | Reached from the Pantry, with two tabs: App settings and Assets **(decided)**. Layout chosen from three mockups (open) |
| Onboarding | In | Short first-run flow |
| Starter task libraries | In | Vehicles (from STANDARD_SCHEDULE, reviewed), Home (new), Health and Finance (small) |
| Backup: CSV export / import | In | All jars; `format_version` on every row **(decided)**; one full export with a plain "not encrypted" warning **(decided)** |
| Moving from the Vehicle Maintenance App | In | Must work before the old app is deleted **(decided)**; how is data-architect's call |
| Units | Miles and gallons **(decided)** | |
| Look | In **(decided)** | Follows app.css; Green default; all 7 palettes, each light and dark, plus Light / Dark / System |
| Storage | Local-only **(decided)** | Built so cloud storage can be added later; see section 7 |
| Distribution | Installable web app (PWA) only **(decided)** | On the shared GitHub Pages address for now **(decided)**. Google Play maybe later; no App Store for v1 |
| Push notifications, accounts, sync, AI receipt reading | Out | See section 6 |

## 4. User stories and acceptance criteria

Terms used below (matching docs/specs/data-model.md, which says "item" where this spec says "task"):
- **Jar**: a category tab: Vehicles, Home, Health, Finance.
- **Thing**: what a task belongs to inside a jar: a vehicle, a home, a small engine or appliance (Home), a person (Health), a household or account (Finance). Each thing is in one jar. The Settings Assets tab is where the user edits things.
- **Task**: one recurring thing to do (oil change, furnace tune-up, dental cleaning, registration renewal). Each task belongs to one thing.
- **Measure**: what a task repeats by: odometer miles, a time interval (days, weeks, months, years), hours of use, or fixed recurring dates **(decided)**.
- **Reading**: an odometer reading (vehicles) or hour-meter reading (small engines).
- **Due date**: the date a task is next due. For miles and hours tasks it's an **estimated date** from recent readings **(decided)**, when one can be estimated.
- **Overdue**: due date before today, or for miles/hours tasks, the latest real reading past the due reading. An estimated date that has passed is due, not overdue (data-model 3.6).
- **Today / this week**: device local date. This week = overdue plus today to day 6 (rolling); This month = days 7-27; Later = day 28 on **(decided)**.

### 4.1 Tab bar
Stories:
- As a user, I can get to my Pantry or any jar in one tap from anywhere, so I never hunt for a screen.
- As a user, I can see at a glance which jar has something due this week.

Acceptance criteria:
1. A bottom tab bar is visible on the Pantry and every jar screen, and stays visible while the screen scrolls.
2. The far-left tab is Pantry, styled as the brief describes (raised solid rounded square in the palette's main color, white cabinet icon, thin divider after it).
3. Each visible jar has one tab, in a fixed order: Vehicles, Home, Health, Finance. Hidden jars have no tab (4.10 AC 7).
4. A jar tab shows a red dot when that jar has at least one task in This week (including overdue). The dot disappears when none remain.
5. The active jar shows a filled jar, white icon and bold label in the palette's main color; while a jar is active the Pantry tab switches to its outlined style.
6. Every tab has an accessible name that includes the jar name and, when the red dot shows, "has items due" (or equivalent).
7. There is no Settings tab **(decided)**; Settings opens from the Pantry (4.10).
8. Five tabs fit and remain usable at 320 px wide and with the largest system text size (labels may truncate; touch targets stay at least 44 x 44 px).

### 4.2 Pantry home
Stories:
- As a user, I open the app and immediately see what needs doing this week, across all my jars.
- As a user, I can glance at what's coming later without opening each jar.
- As a user, I can mark a task done right from the Pantry.
- As a driver or mower owner, I see both how many miles or hours are left and roughly when that will be, so I can plan.

Acceptance criteria:
1. The header shows "PICKLE IT", "Your pantry", and "N things need attention this week", where N is the number of tasks in the This week box. N = 1 reads "1 thing needs attention this week".
2. Three collapsible boxes appear in this order: This week, This month, Later.
3. This week holds tasks overdue or due today through today + 6 days **(decided)**. Overdue tasks are listed first and labeled "Overdue" with the due badge color.
4. This month holds tasks due from today + 7 through today + 27 days **(decided)**.
5. Later holds tasks due from today + 28 days onward **(decided)**, plus tasks with no due date yet (data-model 3.7).
6. Within each box, tasks are sorted as data-model 3.7 defines (overdue first, then by due date, then by units left, then jar, thing and task name).
7. Each box shows at most 50 tasks. When more exist, the box ends with "N more" and a way to see them in their jars. The header count in AC 1 counts all This week tasks, not only the 50 shown.
8. Each task row shows the task name, the thing name ("2019 Civic", "Main house", "Mower", "Me"), the jar icon, and the due text in 4.2a. Nothing else: no notes, provider or history (4.6).
9. When This week is empty, it shows one witty canning line (e.g. "Everything's sealed tight. Nothing to pickle this week."). Lines can rotate; final copy comes from release-manager / ux-designer.
10. Each box can be collapsed and expanded; the choice is remembered on the device.
11. A user can mark a task done from its row. Done asks for the date (default today) and, for miles or hours tasks, the current reading (default the latest known). Saving recalculates the next due date and moves the task to the right box immediately.
12. When the user has no things at all, the Pantry shows a first-step prompt to set something up instead of three empty boxes.
13. The screen scrolls above the tab bar; the last row is never hidden behind it.
14. The Pantry has a control that opens Settings (4.10). Its accessible name is "Settings".

#### 4.2a Due text
The same due text is used on the Pantry and wherever a task's next due shows in a jar.

Decided:
1. A mileage task with an estimated date shows "<miles remaining> / <estimated date>", e.g. "1,200 mi / Dec 12" **(decided)**. No "about", "~" or "est." label **(decided)**.
2. An hours-of-use task with an estimated date shows "<hours remaining> / <estimated date>", e.g. "6.5 hrs / Jun 3" **(decided)**. The date is estimated from hours per day between readings **(decided)**.

Proposed (formatting):
3. Miles are whole numbers with a thousands separator and "mi". Hours show at most one decimal, dropping ".0", with "hr" for exactly 1 and "hrs" otherwise.
4. Dates show as "Mon D" (e.g. "Dec 12"); a date not in the current year adds the year ("Jan 4, 2027").
5. Time and fixed-date tasks show "Overdue", "Today", "Tomorrow", "in N days" (2-6 days), or the date (7 days or more).
6. Screen readers hear the words in full, e.g. "1,200 miles left, estimated December 12" and "6.5 hours left, estimated June 3", so the estimate is clear even though the visual text has no label.
7. A combined task (miles + time, or hours + time **(decided)**) shows the miles or hours remaining and the earlier of the estimated date and the time rule's due date, e.g. "1,200 mi / Nov 30". The date shown is always the date that placed the task in its box.

Proposed, **needs a decision (D11)** — when a meter task can't show the decided format:
8. **No estimate yet** (fewer than two readings, readings too close together, or no change between them; data-model 3.3 sets the exact rule): show the remaining amount only, e.g. "1,200 mi" or "6.5 hrs". The task's detail view says "Add another reading to see a date". The task is placed by the remind window (data-model 3.4).
9. **Overdue by reading**: "<amount> over / Overdue", e.g. "300 mi over / Overdue".
10. **Estimated date has passed but no reading shows it's due yet**: "<amount> / Today", e.g. "150 mi / Today" (due, not overdue, data-model 3.6), until a new reading moves it.
11. **No reading at all**: "Add a reading" (data-model 3.3).

### 4.3 Recurrence (all jars)
Tasks can repeat by any measure **(decided)**. Stories:
- As a driver, my oil change comes due by odometer miles.
- As a homeowner, my furnace filter comes due every 3 months after I last changed it.
- As a mower or generator owner, its oil change comes due after N hours of use.
- As a homeowner, winter prep comes due on the same date every fall, and recycling drop-off every other week on a fixed day, no matter when I last did it.
- As a low-mileage driver or light mower user, my oil change still comes due by time even if I barely use the machine.

Acceptance criteria:
1. A task can repeat by: every N miles (vehicles only); every N days, weeks, months or years from when it was last done; every N hours of use; or on fixed recurring dates (a start date plus every N days, weeks, months or years, e.g. every Oct 15, or every 2 weeks from a given Friday).
2. Miles tasks keep today's "remind N miles before". Hours tasks have an equivalent "remind N hours before".
3. Fixed-date tasks stay on their dates: doing one early or late doesn't shift the next date, and missed occurrences show once, not once per missed cycle.
4. "From last done" tasks restart from the done date.
5. Hours of use: the user records the machine's hour reading when marking a task done, and can update the reading on its own (like an odometer reading). Hours tasks get an estimated date from hours per day between readings **(decided)**; the exact rule is data-model's.
6. A task can combine two measures only as miles + time or hours + time, due at whichever comes first **(decided)**. No other combinations.
7. Adding a task asks for when it was last done (or "not sure") or, for fixed-date tasks, the next date. With "not sure", a time task is due today + interval and is never overdue on the day it's added (data-model 3.2).
8. Month-end and leap-day dates follow the data model's rules (Jan 31 + 1 month = Feb 28/29).

### 4.4 Vehicles jar
Stories:
- As a driver, I can do everything the Vehicle Maintenance App does today, inside Pickle It.
- As a driver, I can log a fill-up or a service in a few taps.

Acceptance criteria:
1. All current features remain: add / edit / delete vehicles (walkthrough), log fill-ups, log maintenance, MPG per vehicle and lifetime, maintenance due list, recent fill-ups, service history, shops list, MPG outlier warning, missed fill-up handling. Logging and viewing live in the Vehicles jar; editing vehicles and their tasks lives in Settings > Assets (4.10). The jar has no tabs inside it **(decided)**; its layout is the ux-designer's to mock.
2. Mileage schedule behavior is unchanged: "every N miles" and "remind N miles before", and existing due-mileage math gives the same results as today.
3. A vehicle task can also use any time measure in 4.3 (e.g. "every 12 months" for a cabin air filter), or miles + time (4.3 AC 6).
4. Every vehicle task appears in the Pantry boxes using its due date and the due text in 4.2a.
5. New vehicles start with the reviewed vehicle starter library (4.8), which the user can edit per vehicle as today.
6. Units are miles and US gallons **(decided)**.

### 4.5 Home jar
Stories:
- As a homeowner, I can add my home and pick the recurring tasks that apply to it from a starter list.
- As a homeowner, I get seasonal tasks (spring AC tune-up, fall furnace tune-up, winter prep) at the right time every year.
- As a homeowner, I can track small engines (mower, snowblower, generator) by hours of use.
- As someone with a second place (cabin, rental), I can track it separately.

Acceptance criteria:
1. A user can have several homes **(decided)**, each with a name; the first defaults to "Home". Adding, renaming and deleting homes is in Settings > Assets (4.10).
2. Each small engine is its own thing in the Home jar (e.g. "Mower") and holds its own hour reading **(decided)**. Every task on that engine shares that reading, like an odometer.
3. A home task has a name, a measure (4.3: interval from last done, fixed dates, hours of use, or hours + time), optional notes, and a last-done date (or "not sure").
4. A user can add a custom task, edit any task's fields, and delete a task.
5. Marking a task done records the date (and reading for hours tasks, and optional notes) in history and recalculates the next due date.
6. A user can update a small engine's hour reading without marking a task done.
7. The user can see each home's and engine's tasks by due date and a history of completed tasks. Layout is the ux-designer's to mock, with no tabs inside the jar.
8. Home tasks appear in the Pantry boxes and drive the Home jar's red dot.
9. Appliances: see D12 (own thing, like small engines, or tasks on a home).

### 4.6 Health and Finance jars
**Health tracks recurring appointments and renewals per person, with no medical fields (decided). Finance tracks money deadlines only, with no amounts (decided).** Both reuse the Home engine: things with time or fixed-date tasks, done logs and notes. No new measures, no new screens beyond what Home needs. Privacy guidance below comes from docs/reviews/privacy-security-2026-11-03.md section 2.

Stories:
- As someone who forgets dental and eye exams, I get a reminder for each person in my family when one comes round.
- As someone with quarterly estimated taxes and yearly renewals, I don't miss a money deadline.
- As a private person, I can keep Health or Finance off my screen entirely, and I'm told plainly what my backup file contains.

What they hold (examples for the starter libraries, 4.8):
- Health things are people: "Me" plus family members by first name. Tasks: annual physical, dental cleaning every 6 months, eye exam, flu shot each fall, prescription refill every 30 days, contact lens replacement.
- Finance things are households or accounts the user names ("Household", "Rental"; see D13). Tasks: quarterly estimated taxes, annual insurance renewal, property tax, check credit report, review subscriptions, annual budget check-in.

Acceptance criteria:
1. Health and Finance each let the user have several things **(decided)** (people / households), with a first default ("Me" / "Household"). Adding, renaming and deleting them is in Settings > Assets.
2. Their tasks use interval-from-last-done or fixed-date measures only (no miles or hours).
3. Tasks support name, measure, notes, last done, mark done, history, edit and delete, as in Home.
4. Their tasks appear in the Pantry boxes and drive their jar's red dot.
5. **No medical fields (decided) and no amounts (decided).** No field anywhere in the app, nor any stored field (not just no input), holds: diagnosis, condition, medication, dose, test results, insurance member or policy ID, provider phone or address, date of birth, age, sex, account number, routing number, card number, SSN or tax ID, password, PIN, security answers, balances, or any money amount. A person has no "relationship" field; a first name or "Me" is enough. A library task that depends on age ("colonoscopy at 45") is suggested without asking for a birth date.
6. The notes field shows a per-jar placeholder before the user types:
   - Health: "e.g. Ask about switching to 90-day refills. Skip results and ID numbers."
   - Finance: "e.g. Renewal notice comes by mail. Don't store account numbers or passwords."
   - Vehicles and Home: a maintenance example ("e.g. Replaced front brake pads").
7. The Pantry row for a Health or Finance task shows only the task name, thing name and due text, so a glance at the phone shows no more than the user typed as a task name. Notes, provider and history never show on the Pantry.
8. A user can hide the Health and Finance jars (as any jar, 4.10 AC 7) **(decided)**. A hidden jar's tasks leave the Pantry and the tab bar; its data is kept and comes back when the jar is shown again.
9. Help copy (release-manager) suggests discreet task names for sensitive things ("Dr. visit" instead of the condition) **(decided: discreet task names)**.
10. The export warning in 4.9 AC 7 covers Health and Finance.
11. Proposed, **needs a decision (D14)**: a soft warning, not a block, when a Health or Finance name or note contains a run of 9 or more digits or a likely card number (13-19 digits passing a Luhn check): "This looks like an account or ID number. Pickle It backups aren't encrypted. Save anyway?" Checked on the device only; nothing about the check is stored.

Later, not v1: a per-jar "hide names" setting that shows "Health task" instead of names on the Pantry (v1.1 **(decided)**); optional Finance amounts after a privacy review **(decided)**. See section 6.

### 4.7 Onboarding (first run)
Stories:
- As a new user, I understand what the app does and have my first thing set up in under two minutes.
- As a Vehicle Maintenance App user, I can bring my data over instead of starting again.

Acceptance criteria:
1. First run shows a single welcome screen: what Pickle It is, and that data stays on this device (local-only **(decided)**).
2. The user picks what to set up: any of the four jars, or "Import a backup". They can also skip.
3. "Vehicle" runs the existing add-a-vehicle walkthrough. Other jars run a short setup: name the thing, pick tasks from that jar's starter library, then a last-done date per task or "not sure" for all.
4. "Import a backup" opens the import flow and accepts both Pickle It backups and Vehicle Maintenance App files (4.11).
5. After setup the user lands on the Pantry, which already shows their tasks.
6. Onboarding never shows again once completed or skipped, except after "Delete all data" (4.10 AC 12). The same setup paths stay available from the empty Pantry and from each jar.
7. Proposed: jars the user didn't pick start hidden, and the last step says they can be shown in Settings. If the user skips, all jars show.

### 4.8 Starter task libraries (scope only; content by maintenance-content-curator)
1. Vehicles: start from `STANDARD_SCHEDULE` (8 items). The curator reviews intervals and adds time limits where they apply (miles + time **(decided)**). Target 8-12 tasks. Vehicle registration lives here.
2. Home: physical upkeep, medium and large appliances, yard work and small engines, including the brief's examples (spring AC tune-up, fall furnace tune-up, winterizing outdoor small engines) and at least one hours-of-use task (e.g. mower oil change) and one fixed-date task (e.g. winter prep). Target 15-25 tasks.
3. Small-engine hours tasks pair with a time limit ("every 50 hours or each spring", hours + time **(decided)**), so machines without an hour meter or with rare readings still come due.
4. Health and Finance: 5-10 tasks each, within 4.6 (no medical or money fields). Insurance renewals live in Finance, so they don't show twice with Vehicles by default.
5. Every library task is generic and safe for a non-expert ("Have a pro service the furnace", not repair instructions; "Schedule a dental cleaning", not medical advice; no tax or investment advice).
6. Season dates: the curator picks a date per task, with fixed season starts as the fallback **(decided)**. Users can edit any date.
7. Changing a library later doesn't change tasks users already have (same as today's vehicle behavior).

### 4.9 Backup, import and export
Stories:
- As a user, I can save everything to a file and restore it on another device.
- As a user, I'm told plainly that the file isn't protected before I share or store it.

Acceptance criteria:
1. Export writes one CSV containing every jar: things, fill-ups, tasks (all measures), shops, hour readings and done history. There is no per-jar export option **(decided)**.
2. Every row has a `format_version` column **(decided)**. Files without it (Vehicle Maintenance App) import as version 1.
3. Import shows a preview and offers Merge or Replace, as today.
4. Import accepts a Vehicle Maintenance App CSV and brings over all its vehicle data (4.11).
5. Export from one device then import on an empty device gives identical data (as today).
6. The backup reminder nudge still works and counts changes in all jars.
7. Next to the Export control, every time (not once), this plain line shows **(decided: plain warning that the backup isn't encrypted)**: "This file isn't encrypted. It includes everything you've saved, including Health and Finance tasks and notes. Keep it somewhere private."
8. The file name stays `pickle-it-YYYY-MM-DD.csv` and never includes jar names.
9. No password-protected backup in v1.
10. Export, import, the storage note and install help live in Settings > App settings (4.10).

### 4.10 Settings
Settings is reached from the Pantry and has its own tabs, App settings and Assets, instead of tabs inside each jar **(decided)**. The layout is chosen from three mockups by the ux-designer (all assets in one tab, a tab per category, and a designer's choice) and is not specified here. Every criterion below must hold for whichever layout the owner picks.

Stories:
- As a user, I can find all app-wide options (look, backup, install, storage) in one place reached from my Pantry.
- As a user, I can see and edit everything I track (houses, appliances, small engines, vehicles, family members, households) and all their tasks in one place.
- As a user handing on or resetting a phone, I can delete all my Pickle It data, and I can't do it by accident.
- As a user who doesn't use a jar, I can hide it, and bring it back later without losing anything.

**General**
1. Settings opens from the Pantry in one tap (4.2 AC 14) and has a clear way back to the Pantry. It is not a tab in the bottom tab bar **(decided)**.
2. Settings has exactly two tabs, named "App settings" and "Assets" **(decided)**. The selected tab is visually distinct and announced to screen readers as selected; tabs are reachable by keyboard.
3. Every control works at 320 px wide and with the largest system text size, with touch targets at least 44 x 44 px.
4. Jars have no tabs inside them **(decided)**.

**App settings tab**
5. Appearance: Light / Dark / System, and the 7-palette picker with Green as the default **(decided)**. Changes apply immediately.
6. Backup: Export (with the warning in 4.9 AC 7) and Import (preview, then Merge or Replace).
7. Jars: a show/hide control for each of the four jars **(decided: users can hide jars)**. At least one jar must stay visible. Hiding a jar that has This week tasks first says "N tasks due this week in <jar> will leave your Pantry. Your data is kept." Showing it again restores its tab, tasks and red dot unchanged.
8. Storage on this device: the existing note that data is kept only on this device, with the iOS eviction warning.
9. Install as an app: the existing install help (iOS and Android steps).
10. About: app version, and the privacy policy link once it exists.
11. Delete all data, as a separate, visually destructive control placed after the others (see below).

**Delete all data**
12. "Delete all data" asks the user to confirm at least twice **(decided)**:
    - a. First step: a dialog titled "Delete all Pickle It data?" that lists what goes (every thing, task, fill-up, reading, done history, shop, and settings on this device), says it can't be undone and can't be recovered by anyone, and offers "Export a backup first" (runs Export, then returns here), "Cancel" and "Continue". Focus starts on Cancel.
    - b. Second step: a separate confirmation that needs a deliberate action different from the first tap, so a double tap can't pass both. Proposed (D15): type DELETE into a field, which enables a "Delete everything" button. Cancel is always available.
    - c. Cancel, Back, closing the dialog, or leaving the screen at either step changes nothing.
    - d. On confirm: everything Pickle It stores on this device is removed: the `pickle-it` database contents and every `pickle-it:` setting (theme and palette return to System and Green). Data belonging to any other app on the same web address (the Vehicle Maintenance App) is never touched.
    - e. The app then shows the first-run welcome (4.7), with no things and an empty Pantry. The installed app and its offline copy keep working; nothing needs a network connection.
    - f. Other open Pickle It windows or tabs on the same device show the empty state and don't write old data back.
    - g. If deleting fails partway, the app says so plainly and doesn't claim success; trying again finishes the job.
    - h. Only "Delete all data" deletes everything; no other control (Replace import aside, which already warns) does.

**Assets tab**
13. Lists every thing the user has, across all four jars, each shown with its jar and name, including things in hidden jars (marked as hidden) and inactive vehicles (marked as inactive). How it's grouped is the layout decision.
14. The user can add, rename and delete: houses, small engines and appliances (Home, D12), vehicles (via the existing walkthrough, including starting odometer and active/inactive), family members (Health) and households (Finance).
15. For each thing, the user can see and edit all its tasks: add from the starter library, add a custom task, edit name, measure(s), remind window, notes and last done, pause, and delete.
16. A small engine's hour reading can be edited (and a vehicle's starting odometer, as today).
17. Deleting a thing asks for confirmation, names how many tasks and history entries go with it, and removes them. Deleting a task asks for confirmation; its past done history stays in the thing's history under the task's old name (data-model `itemName`).
18. Changes made in Assets show immediately in the Pantry and jars.
19. The shops list (shops, contractors, providers) stays editable; where it sits is part of the layout decision.

### 4.11 Moving from the Vehicle Maintenance App
Pickle It launches on the same GitHub Pages address as the Vehicle Maintenance App for now **(decided)**. Once Pickle It v1 is ready, the owner deletes the Vehicle Maintenance App, since Pickle It replaces it **(decided)**. Existing users must be able to bring their data over before that happens. How data moves is the data-architect's call (today: CSV export and import, per the 2026-11-03 storage-names decision; the open question on a one-time copy is still with the data-architect and owner).

Stories:
- As a Vehicle Maintenance App user, I can move all my vehicles, schedules, shops, fill-ups and service history into Pickle It, and see that nothing was lost.
- As a Vehicle Maintenance App user, I'm told in the old app, well before it goes away, that I need to move and how.
- As a Vehicle Maintenance App user who moves late, a file I exported from the old app still imports after the old app is gone.

Acceptance criteria:
1. Before the Vehicle Maintenance App is deleted, Pickle It v1 is live and offers a working way to bring over all old-app data: vehicles, schedules (every / remind miles), shops, fill-ups and maintenance history.
2. After moving, every vehicle shows the same MPG, the same due mileage per task and the same history as in the old app.
3. The move needs no account, server or internet connection beyond loading the apps.
4. Moving twice (or moving, then importing the same file again with Merge) doesn't duplicate anything.
5. Pickle It never changes or deletes the old app's data; any copy is started by the user.
6. Onboarding (4.7 AC 4) and Settings > App settings both offer the way in.
7. Before deletion, the old app shows its users a notice saying it's being replaced, where Pickle It is, and the steps to move. The notice period is D16. Copy from release-manager.
8. Pickle It keeps importing Vehicle Maintenance App files (no `format_version` column) indefinitely, after the old app is gone.
9. Data that existed under the old app's earlier name (Fill-Up Receipts) is covered as data-model 4.1 says.

## 5. Needs a decision

Decided and removed from this list on 2026-11-03: Health scope, Finance scope, Settings placement, several homes and people, combined measures, mileage and hours date estimates, small engines as things, hiding jars, units, box boundaries. Earlier numbers D1-D10 are retired; new items start at D11.

**D11. Due text when a meter task can't show "<remaining> / <date>"** (4.2a ACs 8-11).
- A. As proposed: remaining only when there's no estimate ("1,200 mi"), "300 mi over / Overdue", "150 mi / Today" when the estimate has passed, "Add a reading" with no reading. *(Recommended)*
- B. Show a placeholder date ("1,200 mi / no date yet").
- C. Hide meter tasks from the Pantry until a date can be estimated.

Recommendation: A. It always shows what the user can act on, the format stays short at 320 px, and C would hide real due tasks.

**D12. Appliances: own thing or tasks on a home?** The decisions name appliances in Assets; small engines are already their own things.
- A. An appliance can be its own thing in Home (e.g. "Furnace", "Fridge"), like small engines, but the starter library puts appliance tasks on the home by default. *(Recommended)*
- B. Appliances are always tasks on a home.
- C. Every appliance is always its own thing.

Recommendation: A. Simple homes stay one list; people who want "everything about the furnace" in one place can split it out. No new model work: it's just a thing without hours.

**D13. Finance things.** What a "thing" is in Finance.
- A. Households or accounts the user names, default "Household". *(Recommended)*
- B. One implicit thing per jar; only tasks.

Recommendation: A. Matches Health's people and Home's homes, and covers a rental property's deadlines separately. Names only, never numbers.

**D14. Soft warning on number-like Health and Finance text** (4.6 AC 11). Privacy review recommends it.
- A. Yes, in v1. *(Recommended, cuttable)*
- B. Later.

Recommendation: A. Cheap, local, and catches the worst mistake (an account number in a plain-text backup). Cut first if v1 runs long.

**D15. Second confirmation for Delete all data** (4.10 AC 12b).
- A. Type DELETE to enable the final button. *(Recommended)*
- B. A second "Are you sure?" dialog with the destructive button in a different place.
- C. Press and hold for 3 seconds.

Recommendation: A. Hard to do by accident, works with screen readers and keyboards; C is awkward for some motor disabilities.

**D16. Notice period before the Vehicle Maintenance App is deleted** (4.11 AC 7).
- A. At least 60 days of in-app notice after Pickle It v1 is live. *(Recommended)*
- B. 30 days.
- C. Delete as soon as Pickle It v1 is live.

Recommendation: A. Users who open the app rarely (once per oil change) need time to see the notice. Release-manager and data-architect should confirm with their plans.

**Settings layout** (open, not this spec's): pick from the ux-designer's three mockups in docs/design/.

Also depends on work owned by others: the lawyer engagement (name, privacy policy, terms) **(decided)**, and the data-architect's migration mechanism (4.11).

## 6. Out of scope for v1
- Pets jar **(decided: not a v1 category)**.
- Accounts, login, cloud sync, any backend. Storage is local-only **(decided)**; see section 7 for keeping the cloud path open.
- AI features, including reading fill-up and mechanic receipts **(decided: long-term, not v1)**.
- Native app stores: no Apple App Store for v1; Google Play maybe later **(decided)**.
- A separate web address or custom domain (shared GitHub Pages address for now **(decided)**; no domain spend before the lawyer review **(decided)**).
- Push or email notifications and calendar export. Users see due tasks when they open the app.
- Snoozing a task (the data model's "skip this time" is cuttable to v1.1).
- Shared households or multiple users on one thing.
- Photos, receipt scanning, document attachments, warranties.
- Finance amounts and any cost tracking for non-vehicle tasks; optional amounts may follow after a privacy review **(decided)**. Fill-up cost stays as today.
- Medication schedules, doses and health records **(decided: no medical fields)**.
- Per-jar "hide names" on the Pantry (v1.1 **(decided)**).
- Per-jar export, and password-protected backups **(decided: one full export)**.
- One-time (non-repeating) reminders; every task recurs (data-model 2.7).
- Climate- or region-aware seasonal schedules; Southern Hemisphere defaults.
- Vehicle lookup by VIN or make/model-specific schedules.
- Languages other than English; kilometres and litres **(decided: miles and gallons for v1)**.
- User-created jars.
- Migrating the owner's personal version wholesale **(decided: stays separate)**.

## 7. What the data-architect needs to provide (not decided here)
In docs/specs/data-model.md (being revised in parallel):
1. Things and tasks for all four jars, with Health people and Finance households (D13) and no fields from the never-add list in 4.6 AC 5, enforced in the record builders, not just the forms.
2. Hours of use as a measure, with readings, remind window, small engines as their own things **(decided)**, and an estimated date from hours per day between readings **(decided)**. The current draft's "no hours estimate" proposal (its decision 4) is superseded.
3. Fixed recurring dates, including every-N-weeks from a start date, alongside "from last done".
4. Combined measures limited to miles + time and hours + time **(decided)**, with "whichever first" due logic.
5. One due-date function across all measures returning due date (actual or estimated), whether it's estimated, overdue flag, and miles or hours left, so the Pantry and 4.2a format everything the same way. Its result must cover each case in 4.2a ACs 8-11.
6. The miles-per-day and hours-per-day estimates and when there isn't enough data; the "not sure" rule in 4.3 AC 7.
7. CSV covering all jars with `format_version` on every row, still reading Vehicle Maintenance App files, round-trip identical.
8. Local-only storage shaped so a later cloud option is a migration, not a rewrite. Storage for jar visibility, onboarding-complete flag and box collapse state.
9. Delete all data (4.10 AC 12d): exactly which stores and `pickle-it:` keys are cleared, leaving any other app's data on the shared address alone.
10. The way Vehicle Maintenance App users move before that app is deleted (4.11), and an answer to the open question about a one-time copy.

## 8. Edge cases to cover in design and test
- A vehicle with no fill-ups or odometer readings, or a machine with one hour reading (no estimate: 4.2a AC 8).
- Two readings on the same day, or a second reading equal to the first (no rate).
- A very high rate from a short window giving an estimated date of today; a very low rate giving a date years away (year shown, 4.2a AC 4).
- An estimated date that passes before the user enters a new reading (4.2a AC 10).
- An hour reading entered lower than the last one (meter replaced or typo).
- A "from last done" task last done long ago: overdue by many cycles shows once.
- A fixed-date task done early, late, or skipped for several cycles.
- A biweekly fixed-date task across a month end and a daylight-saving change.
- Device date or time zone changes; boxes use the device's local date.
- More than 50 tasks in one box.
- Deleting a thing (in Assets) with tasks currently in the Pantry.
- Hiding a jar that has overdue tasks: they leave the Pantry and the user is told first (4.10 AC 7); trying to hide the last visible jar.
- Importing a backup that duplicates a thing or task; importing the same Vehicle Maintenance App file twice.
- Delete all data with the app open in two tabs; while offline; cancelled at each step; then importing a backup straight after.
- Delete all data on the shared address: the Vehicle Maintenance App's data must still be there afterwards.
- A user who never moved their data when the Vehicle Maintenance App is deleted.
- Very long thing and task names at 320 px, with five tabs, and long due text ("12,345 mi / Jan 4, 2027").
- Red dot and due badge contrast in every palette, light and dark (7 x 2 combinations), and the destructive Delete control in each.
- Sensitive words in task names (Health, Finance) shown on the Pantry.
- Numbers in Health/Finance notes: a phone number, a date written as digits, a real card number (D14 must not nag on ordinary text).

## 9. Could be cut if v1 runs long
In order: D14 number warning, marking done from the Pantry (do it in the jar), Health / Finance starter libraries (custom tasks only), rotating empty-state lines (use one), "Export a backup first" shortcut in Delete all data (keep the two confirmations). The owner's 2026-11-03 decisions (combined measures, hiding jars, several homes and people, hours estimates, Health and Finance jars, two-step delete) are not on this list.

## 10. Risks
- Four jars plus Pantry on a 320 px tab bar is tight, and "<miles> / <date>" due text adds width to every row; the ux-designer should check both early.
- Hours estimates from sparse, seasonal readings can mislead (e.g. a mower date predicted in winter). The decision stands; pairing hours tasks with a time limit (4.8 AC 3) and D11's no-estimate rule soften it. The data-model draft still proposes no hours estimate and needs updating to the decision.
- Without an "about" label, users may read an estimated date as firm. The screen-reader text says "estimated"; help copy should explain it once.
- Health and Finance task names and notes in a plain-text CSV backup are more sensitive than car data; the warning and hints reduce but don't remove this.
- Sharing one web address with the Vehicle Maintenance App means a script bug in either app could expose both apps' data, and a careless "delete all" or cache cleanup could hit the other app (4.10 AC 12d guards this).
- Deleting the Vehicle Maintenance App strands anyone who hasn't moved yet; their old data may sit in the browser with no app to export it. 4.11 and D16 reduce this; the data-architect's open question is the fallback.
- Seasonal and fixed dates assume the Northern Hemisphere.
