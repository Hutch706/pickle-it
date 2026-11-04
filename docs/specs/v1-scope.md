# Pickle It v1 launch scope

Status: draft for owner review, revised 2026-11-03 to the owner's Phase 1 and Phase 2 decisions in docs/decisions.md. Items marked **(decided)** are logged there; everything else is a proposal until the owner logs it. Open items are in section 5.

## 1. Problem and who it's for
People own things that need regular care: cars that need oil changes, furnaces that need a fall tune-up, mowers that need winterizing, plus life admin that comes round on a schedule (a dental cleaning, a registration renewal). The reminders live in their heads, on stickers, or nowhere. Pickle It puts every upcoming task in one place, sorted by when it's due, on the phone they already carry.

v1 is for everyday people, not mechanics, contractors or clinicians:
- Someone with one or more cars (dealer, independent shop, or DIY) who wants to know when service is due and what their MPG is.
- A homeowner (or renter with some upkeep, like a yard or a window AC) who wants seasonal, yearly and small-engine reminders.
- Someone who wants simple recurring reminders for health appointments and money deadlines, without the app holding medical or account details.

The Vehicle Maintenance App, which Pickle It replaces, has no users with data to move **(decided)**, so there is no migration work beyond importing its CSV files (4.11).

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
| Inside each jar | No tabs inside jars **(decided)** | Due boxes first, then the jar's things; a thing opens its own screen; a jar can link into Settings > Assets **(decided)** |
| Settings | In **(decided)** | Reached from the Pantry, with two tabs: Assets (first) and App settings. Layout is Option C, docs/design/settings-option-c.html **(decided)** |
| Onboarding | In | Short first-run flow |
| Starter task libraries | In | Vehicles (from STANDARD_SCHEDULE, reviewed), Home (new), Health and Finance (small) |
| Backup: CSV export / import | In | All jars; `format_version` on every row **(decided)**; one full export with a plain "not encrypted" warning **(decided)** |
| Vehicle Maintenance App files | Import only | Its CSV files import as today. No copy, notice period or banner: it has no users with data **(decided)** |
| Units | Miles and gallons **(decided)** | |
| Look | In **(decided)** | Follows app.css; Green default; all 7 palettes, each light and dark, plus Light / Dark / System. Phase 2 color fixes: `--err-ink`, per-palette `--line-strong`, backup-due dot (on the Settings gear) in `--err` with screen-reader text, slightly darker light-mode `--ok` **(decided)** |
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
1. A bottom tab bar is visible on the Pantry and every jar screen, and stays visible while the screen scrolls. It is hidden on Settings **(decided)**. It is built as navigation (links, with the current one marked as the current page), not as tabs **(decided)**.
2. The far-left tab is Pantry, styled as the brief describes (raised solid rounded square in the palette's main color, white cabinet icon, thin divider after it).
3. Each visible jar has one tab, in a fixed order: Vehicles, Home, Health, Finance. Hidden jars have no tab (4.10 AC 7).
4. A jar tab shows a red dot when that jar has at least one task in This week (including overdue). The dot disappears when none remain.
5. The active jar shows a filled jar, white icon and bold label in the palette's main color; while a jar is active the Pantry tab switches to its outlined style.
6. Every tab has an accessible name that includes the jar name and, when the red dot shows, "has items due" (or equivalent).
7. There is no Settings tab **(decided)**; Settings opens from the Pantry (4.10).
8. No tab-bar item ever shows a backup-due dot; that dot lives on the Pantry's Settings gear (4.2 AC 15).
9. Five tabs fit and remain usable at 320 px wide and with the largest system text size (labels may truncate; touch targets stay at least 44 x 44 px).

### 4.2 Pantry home
Stories:
- As a user, I open the app and immediately see what needs doing this week, across all my jars.
- As a user, I can glance at what's coming later without opening each jar.
- As a user, I can mark a task done right from the Pantry.
- As a driver or mower owner, I see both how many miles or hours are left and roughly when that will be, so I can plan.

Acceptance criteria:
1. The header shows "PICKLE IT", "Your pantry", and "N things need attention this week", where N is the number of tasks in the This week box. N = 1 reads "1 thing needs attention this week"; N = 0 reads "Nothing needs attention this week" **(decided)**.
2. Three collapsible boxes appear in this order: This week, This month, Later, with the hints "Overdue and the next 7 days", "In 1 to 4 weeks" and "4 weeks or more" **(decided)**.
3. This week holds tasks overdue or due today through today + 6 days **(decided)**. Overdue tasks are listed first and labeled "Overdue" with the due badge color.
4. This month holds tasks due from today + 7 through today + 27 days **(decided)**.
5. Later holds tasks due from today + 28 days onward **(decided)**, plus tasks with no due date yet (data-model 3.7).
6. Within each box, tasks are sorted as data-model 3.7 defines (overdue first, then by due date, then by units left, then jar, thing and task name).
7. Each box shows at most 50 tasks. When more exist, the box ends with "Showing 50 of N" and a link to each jar holding the rest **(decided)**. The header count in AC 1 counts all This week tasks, not only the 50 shown.
8. Each task row shows the task name, the thing name ("2019 Civic", "Main house", "Mower", "Me"), the jar icon, and the due text in 4.2a. Nothing else: no notes, provider or history (4.6).
9. When This week is empty, it shows one witty canning line (e.g. "Everything's sealed tight. Nothing to pickle this week."). Lines rotate, using the lines in docs/design/system.md, pun included **(decided)**.
10. Each box can be collapsed and expanded; the choice is remembered on the device.
11. Tapping a task row opens its quick actions in place (not swipe) **(decided)**: Done, Skip ("Skip this time"), and Add reading for miles and hours tasks (Open for other tasks). Only one row is open at a time. Done and Skip offer Undo for 8 seconds **(decided)**. Done asks for the date (default today) and, for miles or hours tasks, the current reading (default the latest known). Saving recalculates the next due date and moves the task to the right box immediately.
12. When the user has no things at all, the Pantry shows a first-step prompt to set something up instead of three empty boxes.
13. The screen scrolls above the tab bar; the last row is never hidden behind it.
14. The Pantry has a gear control that opens Settings (4.10). Its accessible name is "Settings" **(decided)**.
15. **Backup-due dot (decided):** when a backup is due (the backup reminder in 4.9 AC 6), a red dot shows on the Settings gear, in `--err`. The gear's accessible name becomes "Settings, backup due"; the dot is never the only signal. The dot sits on the gear only, never on a tab-bar item or the Pantry tab. It goes away once an export completes. It does not change the This week count or any box. It stays readable in every palette, light and dark, and at 320 px the gear keeps a 44 x 44 px target.

#### 4.2a Due text
The same due text is used on the Pantry and wherever a task's next due shows in a jar.

Decided:
1. A mileage task with an estimated date shows "<miles remaining> / <estimated date>", e.g. "1,200 mi / Dec 12" **(decided)**. No "about", "~" or "est." label **(decided)**.
2. An hours-of-use task with an estimated date shows "<hours remaining> / <estimated date>", e.g. "6.5 hr / Jun 3, 2027" **(decided)**. The date is estimated from hours per day between readings **(decided)**.
3. A date is estimated only when the latest reading is under 90 days old and two readings are at least 30 days apart **(decided)**; data-model 3.3 has the exact rule.

Formatting:
4. Miles are whole numbers with a thousands separator and "mi". Hours show at most one decimal, dropping ".0", and always use "hr", e.g. "1 hr", "6.5 hr" **(decided)**.
5. Dates show as "Mon D" (e.g. "Dec 12"). Estimated dates more than about 6 months away add the year ("Jun 3, 2027") **(decided)**.
6. Time and fixed-date tasks show "Today", "Tomorrow", "in N days" (2-6 days), or the date (7 days or more). Overdue ones show the "Overdue" badge and "since <date>".
7. Screen readers hear the words in full, e.g. "1,200 miles left, estimated December 12" and "6.5 hours left, estimated June 3, 2027", so the estimate is clear even though the visual text has no label.
8. A combined task (miles + time, or hours + time **(decided)**) shows the miles or hours remaining and the earlier of the estimated date and the time rule's due date, e.g. "1,200 mi / Nov 30". The date shown is always the date that placed the task in its box.

When a meter task can't show "<remaining> / <date>" **(decided)**; same wording for miles and hours:
9. **No estimate**: the remaining amount only, e.g. "63 hr" or "1,200 mi". Screen readers hear "63 hours left. No date estimated yet." The task is placed by the remind window (data-model 3.4).
10. **Overdue by reading** (the latest real reading is past the due reading): the "Overdue" badge plus "<amount> over", e.g. "5.5 hr over", "120 mi over". No date.
11. **Due now**: exactly 0 left, or the estimated date has passed with no new reading. Shows "Due now" (due, not overdue, data-model 3.6) until a new reading moves it. Screen readers also hear that adding a reading will update it.
12. **No reading at all**: "Add a reading", for miles and hours alike.

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
1. All current features remain: add / edit / delete vehicles (walkthrough), log fill-ups, log maintenance, MPG per vehicle and lifetime, maintenance due list, recent fill-ups, service history, shops list, MPG outlier warning, missed fill-up handling. Logging and viewing live in the Vehicles jar; editing vehicles and their tasks lives in Settings > Assets (4.10). The jar has no tabs inside it **(decided)**: due boxes first, then the jar's things, and a thing opens its own screen **(decided)**. This applies to every jar.
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
7. The user can see each home's and engine's tasks by due date and a history of completed tasks, laid out as in 4.4 AC 1.
8. Home tasks appear in the Pantry boxes and drive the Home jar's red dot.
9. An appliance can be its own thing (e.g. "Furnace"), like a small engine but without hours; the starter library puts appliance tasks on the home by default **(decided)**.
10. Seasonal tasks use fixed calendar dates **(decided)**.

### 4.6 Health and Finance jars
**Health tracks recurring appointments and renewals per person, with no medical fields (decided). Finance tracks money deadlines only, with no amounts (decided).** Both reuse the Home engine: things with time or fixed-date tasks, done logs and notes. No new measures, no new screens beyond what Home needs. Privacy guidance below comes from docs/reviews/privacy-security-2026-11-03.md section 2.

Stories:
- As someone who forgets dental and eye exams, I get a reminder for each person in my family when one comes round.
- As someone with quarterly estimated taxes and yearly renewals, I don't miss a money deadline.
- As a private person, I can keep Health or Finance off my screen entirely, and I'm told plainly what my backup file contains.

What they hold (examples for the starter libraries, 4.8):
- Health things are people: "Me" plus family members by first name. Tasks: annual physical, dental cleaning every 6 months, eye exam, flu shot each fall, prescription refill every 30 days, contact lens replacement.
- Finance things are households or accounts the user names ("Household", "Rental"), default "Household" **(decided)**. Tasks: quarterly estimated taxes, annual insurance renewal, property tax, check credit report, review subscriptions, annual budget check-in.

Acceptance criteria:
1. Health and Finance each let the user have several things **(decided)** (people / households), with a first default ("Me" / "Household"). Adding, renaming and deleting them is in Settings > Assets.
2. Their tasks use interval-from-last-done or fixed-date measures only (no miles or hours).
3. Tasks support name, measure, notes, last done, mark done, history, edit and delete, as in Home.
4. Their tasks appear in the Pantry boxes and drive their jar's red dot.
5. **No medical fields (decided) and no amounts (decided).** No field anywhere in the app, nor any stored field (not just no input), holds: diagnosis, condition, medication, dose, test results, insurance member or policy ID, provider phone or address, date of birth, age, sex, account number, routing number, card number, SSN or tax ID, password, PIN, security answers, balances, or any money amount. A person has no "relationship" field; a first name or "Me" is enough. In any jar, also never stored: the user's own name, email or phone, location, photos, and device, analytics or advertising IDs. An import cannot create any of these: unknown columns are ignored (data-model 2.4a). A library task that depends on age ("colonoscopy at 45") is suggested without asking for a birth date.
6. The notes field shows a per-jar placeholder before the user types:
   - Health: "e.g. Ask about switching to 90-day refills. Skip results and ID numbers."
   - Finance: "e.g. Renewal notice comes by mail. Don't store account numbers or passwords."
   - Vehicles and Home: a maintenance example ("e.g. Replaced front brake pads").
7. The Pantry row for a Health or Finance task shows only the task name, thing name and due text, so a glance at the phone shows no more than the user typed as a task name. Notes, provider and history never show on the Pantry.
8. A user can hide the Health and Finance jars (as any jar, 4.10 AC 7) **(decided)**. A hidden jar's tasks leave the Pantry and the tab bar; its data is kept and comes back when the jar is shown again.
9. Help copy (release-manager) suggests discreet task names for sensitive things ("Dr. visit" instead of the condition) **(decided: discreet task names)**.
10. The export warning in 4.9 AC 7 covers Health and Finance.
11. In v1 **(decided)**: a soft warning, not a block, when a Health or Finance name or note contains a run of 9 or more digits or a likely card number (13-19 digits passing a Luhn check): "This looks like an account or ID number. Pickle It backups aren't encrypted. Save anyway?" Checked on the device when saving a thing name, task name, provider or note, before the record is built; choosing Save stores the text exactly as typed, with no flag or masking, and nothing about the check is stored. Import does not run the check (data-model 2.4a).

Later, not v1: a per-jar "hide names" setting that shows "Health task" instead of names on the Pantry (v1.1 **(decided)**); optional Finance amounts after a privacy review **(decided)**. See section 6.

### 4.7 Onboarding (first run)
Stories:
- As a new user, I understand what the app does and have my first thing set up in under two minutes.
- As someone with a backup file (Pickle It or Vehicle Maintenance App), I can import it instead of starting again.

Acceptance criteria:
1. First run shows a single welcome screen: what Pickle It is, and that data stays on this device (local-only **(decided)**).
2. The user picks what to set up: any of the four jars, or "Import a backup". They can also skip.
3. "Vehicle" runs the existing add-a-vehicle walkthrough. Other jars run a short setup: name the thing, pick tasks from that jar's starter library, then a last-done date per task or "not sure" for all.
4. "Import a backup" opens the import flow and accepts both Pickle It backups and Vehicle Maintenance App files (4.11).
5. After setup the user lands on the Pantry, which already shows their tasks.
6. Onboarding never shows again once completed or skipped, except after "Delete all data" (4.10 AC 12). The same setup paths stay available from the empty Pantry and from each jar.
7. Jars the user didn't pick start hidden **(decided)**, and the last step says they can be shown in Settings. If the user skips, all jars show.

### 4.8 Starter task libraries (scope only; content by maintenance-content-curator)
1. Vehicles: start from `STANDARD_SCHEDULE` (8 items). The curator reviews intervals and adds time limits where they apply (miles + time **(decided)**). Keep all 12 vehicle tasks, with the monthly tire check paused by default; engine air filter every 30,000 mi or 1 year; battery check yearly in fall **(decided)**. Vehicle registration lives here.
2. Home: physical upkeep, medium and large appliances, yard work and small engines, including the brief's examples (spring AC tune-up, fall furnace tune-up, winterizing outdoor small engines) and at least one hours-of-use task (e.g. mower oil change) and one fixed-date task (e.g. winter prep). Target 15-25 tasks.
3. Small-engine hours tasks pair with a time limit ("every 50 hours or each spring", hours + time **(decided)**), so machines without an hour meter or with rare readings still come due.
4. Health and Finance: 5-10 tasks each, within 4.6 (no medical or money fields). Insurance renewals live in Finance, so they don't show twice with Vehicles by default. Estimated taxes are four yearly fixed-date tasks, with a note that the IRS may shift the dates **(decided)**.
4a. Intervals with no source stay as marked, editable defaults **(decided)**. Home: CO alarm replacement uses the date printed on the alarm, with 7 years as the fallback **(decided)**. The generator oil interval is still open (docs/open-questions.md).
5. Every library task is generic and safe for a non-expert ("Have a pro service the furnace", not repair instructions; "Schedule a dental cleaning", not medical advice; no tax or investment advice).
6. Seasonal tasks are on fixed calendar dates. The curator picks a date per task, with fixed season starts as the fallback **(decided)**. Users can edit any date.
7. Changing a library later doesn't change tasks users already have (same as today's vehicle behavior).

### 4.9 Backup, import and export
Stories:
- As a user, I can save everything to a file and restore it on another device.
- As a user, I'm told plainly that the file isn't protected before I share or store it.

Acceptance criteria:
1. Export writes one CSV containing every jar: things, fill-ups, tasks (all measures), shops, hour readings, meter changes (4.12) and done history. There is no per-jar export option **(decided)**.
2. Every row has a `format_version` column **(decided)**. Files without it (Vehicle Maintenance App) import as version 1.
3. Import shows a preview and offers Merge or Replace, as today.
4. Import accepts a Vehicle Maintenance App CSV and brings over all its vehicle data (4.11).
5. Export from one device then import on an empty device gives identical data (as today).
6. The backup reminder nudge still works and counts changes in all jars. When a backup is due, it shows as the dot on the Pantry's Settings gear (4.2 AC 15) **(decided)**, plus the existing note beside Export.
7. Next to the Export control, every time (not once), this plain line shows **(decided: plain warning that the backup isn't encrypted)**: "This file isn't encrypted. It includes everything you've saved, including Health and Finance tasks and notes. Keep it somewhere private."
8. The file name stays `pickle-it-YYYY-MM-DD.csv` and never includes jar names.
9. No password-protected backup in v1.
10. Export, import, the storage note and install help live in Settings > App settings (4.10).

### 4.10 Settings
Settings is reached from the Pantry and has its own tabs, Assets and App settings, instead of tabs inside each jar **(decided)**. The layout is Option C (docs/design/settings-option-c.html) **(decided)**: Assets first, with search (matching task names too) and jar filter chips; App settings second.

Stories:
- As a user, I can find all app-wide options (look, backup, install, storage) in one place reached from my Pantry.
- As a user, I can see and edit everything I track (houses, appliances, small engines, vehicles, family members, households) and all their tasks in one place.
- As a user handing on or resetting a phone, I can delete all my Pickle It data, and I can't do it by accident.
- As a user who doesn't use a jar, I can hide it, and bring it back later without losing anything.

**General**
1. Settings opens from the Pantry in one tap (4.2 AC 14) and has a clear way back to the Pantry. It is not a tab in the bottom tab bar, and the bottom bar is hidden on Settings **(decided)**. A jar can also link into Settings > Assets **(decided)**.
2. Settings has exactly two tabs, "Assets" then "App settings" **(decided)**. Assets opens first; after that, Settings reopens on the last tab used **(decided)**. The selected tab is visually distinct and announced to screen readers as selected; tabs are reachable by keyboard.
3. Every control works at 320 px wide and with the largest system text size, with touch targets at least 44 x 44 px.
4. Jars have no tabs inside them **(decided)**.

**App settings tab**
5. Appearance: Light / Dark / System, and the 7-palette picker with Green as the default **(decided)**. Changes apply immediately.
6. Backup: Export (with the warning in 4.9 AC 7) and Import (preview, then Merge or Replace).
7. Jars: a show/hide switch for each of the four jars, here in App settings **(decided)**. At least one jar must stay visible. Hiding a jar that has This week tasks first says "N tasks due this week in <jar> will leave your Pantry. Your data is kept." Showing it again restores its tab, tasks and red dot unchanged.
8. Storage on this device: the existing note that data is kept only on this device, with the iOS eviction warning.
9. Install as an app: the existing install help (iOS and Android steps).
10. About: app version, and the privacy policy link once it exists.
11. Delete all data, as a separate, visually destructive control placed after the others (see below).

**Delete all data**
12. "Delete all data" asks the user to confirm at least twice **(decided)**:
    - a. First step: a dialog titled "Delete all Pickle It data?" that lists what goes (every thing, task, fill-up, reading, done history, shop, and settings on this device), says it can't be undone and can't be recovered by anyone, and offers "Export a backup first" (runs Export, then returns here), "Cancel" and "Continue". Focus starts on Cancel.
    - b. Second step: the user types DELETE (any case) into a field, which enables a "Delete everything" button **(decided)**. A double tap can't pass both steps. Cancel is always available.
    - c. Cancel, Back, closing the dialog, or leaving the screen at either step changes nothing.
    - d. On confirm, only Pickle It's data is removed **(decided)**: the whole `pickle-it` database is deleted in one step, and every `pickle-it:` localStorage key is removed, so theme and palette reset to System and Green **(decided)**. There is no option to delete the Vehicle Maintenance App's data **(decided)**; data belonging to any other app on the same web address is never touched.
    - e. The app then shows the first-run welcome (4.7), with no things and an empty Pantry. The installed app and its offline copy keep working; nothing needs a network connection.
    - d2. Order (data-model 6): the database is deleted first, and only after that succeeds are the `pickle-it:` keys removed. The app's own cached files and service worker stay (they hold no user data), so it reopens offline.
    - f. Other open Pickle It windows or tabs on the same device reload to the empty state and don't write old data back.
    - g. If deleting the database fails, the app says so plainly, claims no success, clears nothing else and offers a retry; the data is still there. If another open Pickle It tab holds up the delete, the app shows "Close other Pickle It tabs to finish deleting" and keeps waiting; it finishes by itself when that tab closes and does not report success before then.
    - g2. After a successful delete the tab reloads and onboarding runs. Help copy says that clearing site data or removing the app from the home screen also deletes everything, and that exported files stay where they were saved.
    - h. Only "Delete all data" deletes everything; no other control (Replace import aside, which already warns) does.

**Assets tab**
13. Lists every thing the user has, across all four jars, each shown with its jar and name, including things in hidden jars (marked as hidden) and inactive vehicles (marked as inactive). Grouping, search and jar filter chips follow Option C.
14. The user can add, rename and delete: houses, small engines and appliances (Home, 4.5 AC 9), vehicles (via the existing walkthrough, including starting odometer and active/inactive), family members (Health) and households (Finance).
15. For each thing, the user can see and edit all its tasks: add from the starter library, add a custom task, edit name, measure(s), remind window, notes and last done, pause, and delete.
16. A small engine's hour reading can be edited (and a vehicle's starting odometer, as today).
17. Deleting a thing asks for confirmation, names how many tasks and history entries go with it, and removes them. Deleting a task asks for confirmation; its past done history stays in the thing's history under the task's old name (data-model `itemName`).
18. Changes made in Assets show immediately in the Pantry and jars.
19. The shops list (shops, contractors, providers) stays editable; where it sits follows Option C.

### 4.11 Importing Vehicle Maintenance App files
The Vehicle Maintenance App has no users with data to move **(decided)**. So there is no copy from the old app, no notice period and no banner or final update in the old app **(decided)**. Pickle It launches on the same GitHub Pages address for now, and the owner deletes the old app once Pickle It v1 is ready **(decided)**. Importing the old app's CSV files stays, since it already works **(decided)**.

Stories:
- As someone with a Vehicle Maintenance App CSV file, I can import it and see my vehicles, schedules, shops, fill-ups and service history.

Acceptance criteria:
1. Import accepts a Vehicle Maintenance App CSV (no `format_version` column) and brings over vehicles, schedules (every / remind miles), shops, fill-ups and maintenance history.
2. After importing, every vehicle shows the same MPG, the same due mileage per task and the same history as in the old app.
3. Importing the same file again with Merge doesn't duplicate anything.
4. Pickle It never reads, changes or deletes the old app's stored data; only files the user picks are imported.
5. Onboarding (4.7 AC 4) and Settings > App settings both offer import.
6. Pickle It keeps importing Vehicle Maintenance App files indefinitely, after the old app is gone.

### 4.12 Meter replaced or reset (decided 2026-11-03, data-model 3.3b option A)
An odometer or hour meter can go backward when an instrument cluster, engine or hour meter is replaced, or a mechanical meter rolls over. Without handling, a task stays in the wrong box until the new meter passes the old highest value.

Stories:
- As a driver whose instrument cluster was replaced, I can enter the new, lower odometer reading and my oil change still comes due at the right time.
- As a mower owner who swapped the hour meter, I can enter the new hours without losing my history or my schedules.
- As a user who mistyped a number, I'm asked first, so a typo doesn't become a meter change.

Acceptance criteria:
1. When a fill-up, service log or reading for a vehicle (odometer) or small engine (hours) is lower than the current value, saving it first asks: "That's lower than the last reading (<value>). Was the meter replaced or reset?", with Yes and No. Nothing is saved until the user answers. The prompt is announced to screen readers and Yes and No are at least 44 x 44 px.
2. **Yes** saves the entry and records one meter change: its date, the old meter's last value (prefilled with the current value, editable) and the new meter's first value (the number just typed). **No** saves nothing and returns to the form to fix the number.
3. Typed readings are never edited. Older readings of that meter on that thing are shifted at read time by (new minus old), so history still shows what was typed. Several changes add up. Shifted values can be negative; they are never shown.
4. After a meter change, the due text, box and estimated date follow the shifted readings. Example: a mower oil task due at 20 hr with 18 hr on the new meter shows "2 hr / Nov 7" and sits in This week, not "20 hr" in Later (data-model 3.3b worked example).
5. This works for odometers (miles) and hours alike, and for combined miles + time and hours + time tasks. Schedules carry over unchanged for a swapped meter or a new engine.
6. A "Meter replaced" action on the vehicle or engine records a meter change without a regular entry.
7. MPG after a change uses the shifted odometer, so the next fill-up gives a normal distance, not a negative one (checked at build, data-model 3.3b).
8. A lower reading with no meter change recorded is kept, as today, and does not lower the current value (data-model 3.3).
9. The user can see a thing's meter changes (date, old, new) and delete one. Deleting asks for confirmation, then removes the shift, so due values are recalculated from the readings as typed; no typed reading is lost. Deleting a thing deletes its meter changes with it (counted in 4.10 AC 17).
10. Export writes each meter change as a `reading` row with the `meter` and `old_value` columns (data-model 3.3b, 4.3), for vehicles as well as engines. Import accepts them and applies the 4.4 checks (finite numbers 0-99,999.9, allowed values, id pattern; a row that fails is listed in the preview and skipped). Merge doesn't duplicate a change already present. Export then import on an empty device gives the same shifted results. Files without these columns import as before.
11. Delete all data (4.10 AC 12) removes meter changes with everything else, and the import checks in 4.9 and 4.11 apply to them like any other row.

## 5. Needs a decision

Decided and removed from this list on 2026-11-03: Health scope, Finance scope, Settings placement and layout (Option C), several homes and people, combined measures, mileage and hours date estimates, small engines as things, hiding jars, units, box boundaries, and in Phase 2: D11 meter due text, D12 appliances, D13 Finance things, D14 number warning, D15 type DELETE, and D16 (dropped: no old-app users, so no notice period).

Nothing in this spec is waiting on the owner. Still open elsewhere: the generator oil interval (docs/open-questions.md, maintenance-content-curator), and the lawyer engagement (name, privacy policy, terms) **(decided to happen; outcome pending)**.

## 6. Out of scope for v1
- Pets jar **(decided: not a v1 category)**.
- Accounts, login, cloud sync, any backend. Storage is local-only **(decided)**; see section 7 for keeping the cloud path open.
- AI features, including reading fill-up and mechanic receipts **(decided: long-term, not v1)**.
- Native app stores: no Apple App Store for v1; Google Play maybe later **(decided)**.
- A separate web address or custom domain (shared GitHub Pages address for now **(decided)**; no domain spend before the lawyer review **(decided)**).
- Push or email notifications and calendar export. Users see due tasks when they open the app.
- Snoozing a task to a later date. ("Skip this time" is in v1 as a quick action, 4.2 AC 11.)
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
1. Things and tasks for all four jars, with Health people, Finance households and appliances as optional things, and no fields from the never-add list in 4.6 AC 5, enforced in the record builders, not just the forms.
2. Hours of use as a measure, with readings, remind window, small engines as their own things **(decided)**, and an estimated date from hours per day between readings **(decided)**. The current draft's "no hours estimate" proposal (its decision 4) is superseded.
3. Fixed recurring dates, including every-N-weeks from a start date, alongside "from last done".
4. Combined measures limited to miles + time and hours + time **(decided)**, with "whichever first" due logic.
5. One due-date function across all measures returning due date (actual or estimated), whether it's estimated, overdue flag, and miles or hours left, so the Pantry and 4.2a format everything the same way. Its result must cover each case in 4.2a ACs 9-12.
6. The miles-per-day and hours-per-day estimates (only when the latest reading is under 90 days old and two readings are 30+ days apart **(decided)**); the "not sure" rule in 4.3 AC 7.
7. CSV covering all jars with `format_version` on every row, still reading Vehicle Maintenance App files, round-trip identical.
8. Local-only storage shaped so a later cloud option is a migration, not a rewrite. Storage for jar visibility, onboarding-complete flag and box collapse state.
9. Delete all data (4.10 AC 12d): delete the whole `pickle-it` database in one step, then (only after it succeeds) remove every `pickle-it:` localStorage key **(decided)**, leaving any other app's data on the shared address alone. Data-model section 6 has the blocked-delete and other-tab steps.
9a. Meter changes (4.12): stored as readings, older readings shifted at read time, typed values never edited (data-model 3.3b).
10. Keep importing Vehicle Maintenance App CSV files (4.11). No one-time copy from the old app **(decided)**.

## 8. Edge cases to cover in design and test
- A vehicle with no fill-ups or odometer readings ("Add a reading"), or a machine with one hour reading (no estimate: 4.2a AC 9).
- Two readings on the same day, readings under 30 days apart, a second reading equal to the first, or a latest reading 90+ days old (no estimate).
- A very high rate giving an estimated date of today; a very low rate giving a date years away (year shown, 4.2a AC 5).
- An estimated date that passes before the user enters a new reading ("Due now", 4.2a AC 11).
- An odometer or hour reading entered lower than the last one: answer Yes (meter change) or No (typo), see 4.12.
- Two meter changes on one thing; a change dated before earlier readings; deleting a meter change; a backup with meter changes imported over existing data.
- Delete all data blocked by another open tab; the database delete failing, with the `pickle-it:` keys left alone.
- A "from last done" task last done long ago: overdue by many cycles shows once.
- A fixed-date task done early, late, or skipped for several cycles.
- A biweekly fixed-date task across a month end and a daylight-saving change.
- Device date or time zone changes; boxes use the device's local date.
- More than 50 tasks in one box.
- Deleting a thing (in Assets) with tasks currently in the Pantry.
- Hiding a jar that has overdue tasks: they leave the Pantry and the user is told first (4.10 AC 7); trying to hide the last visible jar.
- Importing a backup that duplicates a thing or task; importing the same Vehicle Maintenance App file twice.
- Delete all data with the app open in two tabs; while offline; cancelled at each step; typing "delete" or "Delete" (accepted) or "DELET" (not); then importing a backup straight after.
- Delete all data on the shared address: any other app's data must still be there afterwards.
- Very long thing and task names at 320 px, with five tabs, and long due text ("12,345 mi / Jun 3, 2027", "1,204.5 hr over").
- Undo pressed just before the 8 seconds run out; another row opened while Undo shows.
- Red dot and due badge contrast in every palette, light and dark (7 x 2 combinations), and the destructive Delete control in each.
- Sensitive words in task names (Health, Finance) shown on the Pantry.
- Numbers in Health/Finance notes: a phone number, a date written as digits, a real card number (the 4.6 AC 11 warning must not nag on ordinary text).

## 9. Could be cut if v1 runs long
In order (the owner decides any cut): number-like text warning (4.6 AC 11), marking done from the Pantry (do it in the jar), Health / Finance starter libraries (custom tasks only), rotating empty-state lines (use one), "Export a backup first" shortcut in Delete all data (keep the two confirmations). The owner's 2026-11-03 decisions (combined measures, hiding jars, several homes and people, hours estimates, Health and Finance jars, two-step delete) are not on this list.

## 10. Risks
- Four jars plus Pantry on a 320 px tab bar is tight, and "<miles> / <date>" due text adds width to every row; the ux-designer should check both early.
- Hours estimates from sparse, seasonal readings can mislead (e.g. a mower date predicted in winter). The decision stands; pairing hours tasks with a time limit (4.8 AC 3) and the 90-day / 30-day estimate rule (4.2a AC 3) soften it.
- Without an "about" label, users may read an estimated date as firm. The screen-reader text says "estimated"; help copy should explain it once.
- Health and Finance task names and notes in a plain-text CSV backup are more sensitive than car data; the warning and hints reduce but don't remove this.
- Sharing one web address with the Vehicle Maintenance App (until the owner deletes it) means a script bug in either app could expose both apps' data, and a careless "delete all" or cache cleanup could hit the other app (4.10 AC 12d guards this).
- Seasonal and fixed dates assume the Northern Hemisphere.
