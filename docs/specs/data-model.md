# Pickle It: data model, due dates, storage and migration

Status: **draft proposal** from data-architect, revised 2026-11-03 to match docs/decisions.md. The storage approach, storage names, v1 jars, recurrence measures and CSV versioning are decided by the owner and recorded here as such. Everything else is proposed; open items are in "Decisions needed" at the end.

Sources read: CLAUDE.md, docs/decisions.md, docs/brief.md, docs/specs/v1-scope.md (draft, being revised in parallel), data.js, app.js, sw.js, index.html and manifest.webmanifest (storage names only).

**Terms.** This doc says **thing** for what the user owns (a vehicle, a home, a mower) and **item** for one recurring task on it. v1-scope.md calls these "item" and "task". Same concepts; the code names can be settled when it's built.

---

## 1. Storage (decided)

Decided by the owner: **local-only now, with a path to cloud sync later.** Data stays in IndexedDB in the user's browser; backups are the CSV export. No accounts, no server.

What keeps the cloud path open (all cheap, all in this model):
- Every record has a random `id` (`newId()` in data.js), so records made on two devices never collide.
- Every record has `createdAt` and `updatedAt` (UTC). `updatedAt` is new and is what a later sync uses to pick the newer copy.
- Due dates are always recalculated from logs and readings, never stored, so there's no derived state to keep in sync.
- The CSV carries every field, so a future sync service can be seeded from a user's export.

What's deliberately not built now: deletes are hard deletes (no tombstones or `deletedAt`). A sync feature would add those; it's an additive change, not a reshape. Accounts and sync need their own spec, cost check and privacy review when the owner schedules them.

---

## 2. Data model

### 2.1 Storage names (done in code)
Pickle It uses its own names everywhere, so it can share a web address with the Vehicle Maintenance App without touching its data. Current state:

| What | Pickle It (current code) | Where |
|---|---|---|
| IndexedDB name | `pickle-it` (version 1) | data.js `DB_NAME` |
| localStorage keys | `pickle-it:` prefix (`theme`, `palette`, Log section Hide/Show) | app.js `pref`, index.html head script |
| BroadcastChannel | `pickle-it` | app.js line 46 |
| Service worker cache | `pickle-it-v1`; activate deletes only caches starting `pickle-it-` | sw.js `CACHE`, `OWN_CACHE` |
| Export file name | `pickle-it-YYYY-MM-DD.csv` | data.js `exportFileName` |

The old-name migration (`moveFromOldName()` and the `fur:` key move) is removed, by decision. **No code still uses the old names** (`vehicle-maintenance-app`, `vma:`, `fur:`, `fillup-receipts`); the only mention is the import error text naming both apps, which is intended.

Stale docs that still describe the old names (not mine to edit): docs/release/checklist.md (line 24), docs/release/distribution.md (line 60), docs/reviews/privacy-security-2026-11-03.md (line 47-48), docs/specs/v1-scope.md section 7 item 7.

Because the `pickle-it` database is new, the layout below can replace version 1 directly before launch, with no IndexedDB upgrade code, **as long as no real users have Pickle It data yet**. Once anyone does, the change needs a `DB_VERSION` bump and an upgrade step that rewrites `vehicles` → `things` and `services` → `logs` (section 2.3).

### 2.2 Jars (categories)
v1 jars are **Vehicles, Home, Health and Finance** (decided). Pets is not in v1. Jars are a constant in code, not stored records:

```
JARS = [ { id: "vehicles", name: "Vehicles", icon: ... },
         { id: "home",     name: "Home",     icon: ... },
         { id: "health",   name: "Health",   icon: ... },
         { id: "finance",  name: "Finance",  icon: ... } ]
```

Adding Pets later means adding an entry. No migration. Jars only become a store if users can create their own. Jar order or visibility, if wanted, goes in `settings` (2.6).

### 2.3 Stores (IndexedDB `pickle-it`)

**things** (key `id`): what the user owns or looks after. Replaces the `vehicles` store.

| Field | Type | Notes |
|---|---|---|
| id | string | `newId("t")`. Imported vehicles keep their `v_...` id. |
| jar | `"vehicles"` \| `"home"` \| `"health"` \| `"finance"` | Which tab it lives in. Fill-ups and MPG are keyed on `jar === "vehicles"`. |
| name | string, 1-80 chars | "2019 Civic", "Home", "Push mower", "Me". |
| active | boolean | Inactive things are hidden from due boxes (as today's inactive vehicles). |
| odometer, odometerDate | whole miles or null, YYYY-MM-DD or "" | Starting odometer. Vehicles only, same rules as `makeVehicle`. |
| hours, hoursDate | number or null, YYYY-MM-DD or "" | **New.** Starting hour-meter reading, 0-99,999.9, one decimal. Any jar (a mower in Home, a generator, an outboard). Asked for only when the thing has at least one item with an `hours` rule. |
| items | array of items (below) | Embedded, as today. Item ids are unique within one thing only. |
| createdAt, updatedAt | ISO timestamp (UTC) | `updatedAt` is new. |

**Item** (inside `thing.items`): one recurring task. Today's `{ id, name, every, remind }` becomes:

| Field | Type | Notes |
|---|---|---|
| id | string | Unique within the thing. Library items keep short ids (`oil`, `furnace`) so imports and the curator's library can match them. |
| name | string, 1-80 chars | |
| miles | `{ every, remind }` or null | Whole miles, `every` 1-999,999, `remind` 0-999,999. Vehicles only. Exactly today's `every`/`remind`. |
| hours | `{ every, remind }` or null | **New.** Hours of use, `every` 0.1-99,999.9, `remind` 0-99,999.9, one decimal. Any jar. |
| time | `{ n, unit, from, firstDue, season }` or null | `n` whole 1-999; `unit` `"day"`, `"week"`, `"month"` or `"year"`; `from` `"done"` or `"calendar"` (3.2); `firstDue` YYYY-MM-DD; `season` optional display label, never used in math. |
| active | boolean | Paused items are hidden from due boxes. Default true. |

At least one of `miles`, `hours`, `time` is required. More than one set means whichever comes first (3.4). This covers every decided measure: odometer miles (`miles`), months/days/weeks/years from last done (`time`, `from: "done"`), hours of use (`hours`), and fixed recurring dates such as biweekly recycling or winter prep (`time`, `from: "calendar"`).

**logs** (key `id`): one completed or skipped task. Replaces the `services` store.

| Field | Type | Notes |
|---|---|---|
| id | string | `newId("m")`, as today |
| thingId | string | Renamed from `vehicleId` |
| itemId | string | The item it completes, or `"other"` for a one-off job with no schedule (as today) |
| itemName | string | Name at the time, so history survives renaming or deleting the item |
| date | YYYY-MM-DD | When it was done or skipped |
| odometer | whole miles or null | Required for vehicles (as today), null otherwise |
| hours | number or null | **New.** Hour-meter reading when done. Required when the item has an `hours` rule; optional on any other log for a thing that tracks hours (it still counts as a reading). |
| shop | string | Shop, contractor, provider or "DIY". Same shop list in settings. |
| notes | string, up to 2,000 chars | |
| visit | string | Groups items done in one visit, as today |
| status | `"done"` \| `"skipped"` | New. Imported old records are `"done"`. |
| forDue | YYYY-MM-DD or "" | New. The due date this log closed, saved when it's logged. Needed for calendar schedules (3.2). "" for imports and one-off jobs. |
| createdAt, updatedAt | ISO timestamp (UTC) | |

**readings** (key `id`): **new.** An hour-meter reading taken without doing a task ("Update hours"). Vehicles don't need this: fill-ups, including odometer-only fill-ups, already are readings.

| Field | Type | Notes |
|---|---|---|
| id | string | `newId("r")` |
| thingId | string | |
| date | YYYY-MM-DD | |
| hours | number | 0-99,999.9 |
| createdAt, updatedAt | ISO timestamp (UTC) | |

Current hours for a thing = the highest of its starting `hours`, its logs' `hours` and its readings (same idea as `latestOdo`).

**fillups** (key `id`): unchanged except `vehicleId` is renamed `thingId` and `updatedAt` is added.

**settings** (key `key`): `shops`, `lastExport`, `lastChange` as today, plus `hemisphere` (`"north"` default or `"south"`, used only to suggest season dates).

### 2.4 Health and Finance
Their contents aren't defined yet. The model above already covers the likely shape without anything jar-specific: a thing in the `health` or `finance` jar ("Me", "Dad", "Car insurance", "Taxes"), items with `time` rules (yearly physical, dentist every 6 months, renew insurance each March, quarterly estimated tax on fixed dates), and logs with date, provider (`shop`) and notes. No new fields are added for them now.

What I'd need from the product-spec-writer before building them:
1. What a "thing" is in each jar: a person (Health), an account or policy (Finance), or just one implicit thing per jar.
2. Whether any item repeats by something other than time (none expected).
3. Whether logs need fields beyond date, provider and notes, for example amounts paid, policy or account numbers, results or doses. Each of those is sensitive and changes the privacy review (section 5).
4. Whether some items are one-time deadlines rather than recurring (a renewal that doesn't repeat). The model can do that as an item with no repeat only if we add one; today every item recurs.
5. Starter library content (maintenance-content-curator) and how much it may say (no medical or financial advice).

### 2.5 Why this shape
- One task model for every jar: a thing, items with any mix of miles, hours and time, and logs. Only fill-ups and MPG are vehicle-specific.
- Keeping items embedded and keeping the existing record builders (`makeVehicle`, `makeItem`, `makeService`, `makeFillup`) with small additions keeps the import/merge code in data.js nearly intact.
- Hours mirror miles exactly (`every`/`remind`, current reading = highest reading, same "no log yet" rule), so the code reuses the mileage path with a different reading source.
- The `vehicleId` to `thingId` rename is mechanical. CSV columns keep their old names (4.2).

### 2.6 Where small UI state lives
- Device-only conveniences (box collapsed/expanded, Log section Hide/Show, theme, palette): localStorage under `pickle-it:` keys, as today. Not exported.
- Onboarding completed and jar visibility (if v1-scope D8 is approved): `settings` store. Not exported, so a new device runs onboarding again after an import unless the importer marks onboarding done when it saves data (recommended).

### 2.7 Not included (name them so nobody assumes they are)
Costs on maintenance logs, kilometers, photos or receipts, snooze, notifications, user-created jars, sharing between people, one-time (non-recurring) deadlines, tombstones for sync. Each can be added later without reshaping the above.

---

## 3. Due dates and the Pantry boxes

### 3.1 Dates and time zones
- Every due date and log date is a **local calendar date** string, `YYYY-MM-DD`, exactly like today's `date` fields. Never a timestamp.
- "Today" (T) is the device's local date (`today()` in data.js).
- Days between two dates are counted on the calendar parts only: `(Date.UTC(y2,m2-1,d2) - Date.UTC(y1,m1-1,d1)) / 86400000`. This ignores daylight saving and the device's time zone.
- Travel across time zones can move "today" by one day. Accepted; nothing is stored differently.
- The boxes are recalculated when the app opens, when it comes back to the foreground (`visibilitychange`), and at local midnight if it's open.
- Only `createdAt`, `updatedAt`, `lastExport` and `lastChange` are UTC timestamps. They're never used for due dates.

### 3.2 Time-based schedules (intervals and fixed dates)
`addUnits(date, n, unit)`:
- `day`: date + n days. `week`: date + 7n days.
- `month`: move n months; the day becomes `min(original day, days in the target month)`. Jan 31 + 1 month = Feb 28 (Feb 29 in a leap year).
- `year`: same as 12n months, so Feb 29 + 1 year = Feb 28.

Two kinds, chosen by `time.from`:

**From last done** (`from: "done"`, for "every N days/weeks/months/years", e.g. furnace filter every 3 months). The clock restarts when it's done.
- No log yet: due = `firstDue`. When adding an item, the UI asks "when was it last done?" (firstDue = that + interval) or "when is it next due?" (firstDue = that). If the user doesn't know: firstDue = today + interval.
- With logs: L = the latest log for that item (latest `date`, then latest `createdAt`). Due = `addUnits(L.date, n, unit)`.
- Done late or early shifts the schedule: filter every 3 months, done 2 weeks late on Apr 15 → next due Jul 15.

**On the calendar** (`from: "calendar"`, for fixed recurring dates: biweekly recycling drop-off, winter prep each fall, quarterly tax on fixed dates). The schedule stays on its dates no matter when it's done.
- Occurrences are `occ(k) = addUnits(firstDue, k*n, unit)` for k = 0, 1, 2, ... Always computed from `firstDue`, never from the previous occurrence, so month-end doesn't drift: monthly from Jan 31 gives Jan 31, Feb 28, Mar 31, Apr 30.
- Biweekly recycling is `n: 2, unit: "week"` with `firstDue` on a pickup day; every occurrence stays on that weekday.
- No log yet: due = `firstDue` (the UI defaults it to the next occurrence on or after today).
- With logs: due = the first occurrence strictly after `max(L.date, L.forDue)`.
  - Done early: AC tune-up due Apr 1, done Mar 18 (forDue Apr 1) → next due Apr 1 next year, not Apr 1 this year.
  - Done late: due Apr 1, done May 20 → next due Apr 1 next year.
  - Done very late (more than a full cycle): the first occurrence after the done date, so missed cycles don't pile up.
- A missed occurrence with no log stays due (and goes overdue) until it's done or skipped. For frequent fixed dates like recycling, Skip (3.5) is the expected way to clear a missed one.

**Seasons.** "Each spring/summer/fall/winter" is a calendar yearly schedule (`n: 1, unit: "year", from: "calendar"`) with `firstDue` at the next season start and `season` saved as a label. v1-scope's "preferred month" maps to the same thing with `firstDue` on the 1st of that month. Placeholder starts (meteorological): north Mar 1, Jun 1, Sep 1, Dec 1; south shifted 6 months. The curator may pick better per-task dates. Changing the hemisphere setting doesn't move existing items. Location is never read.

Why calendar mode instead of "last done + interval, then snap to the preferred month" (v1-scope 4.4 AC 4): with a yearly interval the snap rule skips a year whenever the task is done after its month. Furnace tune-up preferred in September, done Oct 15: last done + 1 year = Oct 15 next year, and the next September on or after that is the year after, so a whole year is lost. Calendar mode gives next September.

**Leap years.** Day and week intervals are unaffected. A yearly calendar item first due Feb 29, 2028 falls on Feb 28 in 2029-2031 and Feb 29 again in 2032. A yearly "from done" item done on Feb 29 is next due Feb 28, and stays on the 28th after that.

### 3.3 Meter-based schedules: miles and hours
Both work the same way, with a different reading source:

| | Miles (vehicles) | Hours (any thing) |
|---|---|---|
| Readings | starting odometer, fill-ups, logs | starting hours, logs, readings |
| Current value | highest reading (`latestOdo`) | highest reading |
| Unit precision | whole miles | 0.1 hour |

- With logs: due value = the item's log with the highest reading + `every`. (Logs without a reading for that meter are ignored here.)
- No log: assume it was done at the last regular interval: `max(every, ceil(cur / every) * every)` (today's `scheduledDue`).
- left = due value - current value.
- No current reading at all (no starting value, no logs, no readings): no meter due; the item shows "Add a reading" and goes to Later unless another rule places it.

**Estimated date for miles** (so mileage items can be placed in date boxes):
- Readings: the starting odometer, fill-ups and logs for that vehicle dated within the last 365 days.
- Need at least 2 readings at least 30 days apart with more miles on the later one; otherwise there's no estimate.
- Rate = (latest odometer - earliest odometer in the window) / days between them.
- Estimated due date = date of the latest reading + `ceil(left / rate)` days. Shown as an estimate ("about Dec 12").

**Hours: no estimated date (proposed).** Small engines are used in seasons and in bursts (a mower all summer, a generator only in storms, a snowblower only in winter), and readings are sparse (often only at service time). A straight-line rate would predict due dates in the off-season and jump around after each reading. So an hours rule places the item by hours left alone:
- left < 0 → overdue → This week.
- left ≤ `remind` → This month.
- otherwise → Later.
The Pantry row shows hours ("about 3 hr left", "5 hr over"), not a date. Hours items should usually also have a time rule (most small-engine guidance is "every 50 hours or once a year"), which gives them a real date through 3.4. The curator's library should pair them that way. Decision 4 below offers estimating anyway.

### 3.4 Whichever comes first
Each rule on an item gives a placement:
- `time`: a due date.
- `miles`: an estimated date if one exists, otherwise a box from left vs `remind` (as for hours).
- `hours`: a box from left vs `remind`.

The item goes in the **most urgent** box any of its rules gives, and is overdue if any rule is overdue. Its sort date D is the earliest date among its rules that have one; if none have a date, it has no D. A mileage rule with an estimate but left ≤ `remind` is never placed in Later (at most This month), so the user's reminder setting is honored.

One log resets every rule: the time rule uses the latest log by date, the meter rules the log with the highest reading for that meter. For normal use that's the same log. A log without a reading for a meter (an hours item logged without hours, which the form shouldn't allow) leaves that meter's rule where it was.

### 3.5 Skipped
"Skip this time" saves a log with `status: "skipped"`, today's date, the current odometer and/or hours if the item has those rules, and `forDue` set to the due date it skips (blank for meter-only items). The due math treats it exactly like a done log. History shows it as "Skipped", and "last done" ignores skipped logs. Deleting a log makes the previous one count again, because due dates are always recalculated from logs.

### 3.6 Overdue
- Time: due date before today.
- Miles or hours: left < 0 on a real reading. left = 0 is "due now", treated as due today.
- An estimated date that has passed is **due**, not overdue. Overdue needs a real reading, never an estimate.

### 3.7 The Pantry boxes
For each active item on each active thing, place it by 3.2-3.4 with `days = D - T`.

| Box | Rule |
|---|---|
| **This week** | Overdue, or `days` from 0 to 6 (today plus the next 6 days), or a meter rule with left ≤ 0. |
| **This month (2-4 weeks)** | `days` from 7 to 27, or a meter rule without a date with 0 < left ≤ `remind`. |
| **Later** | `days` 28 or more, meter rules without a date with left > `remind`, and items with no reading yet. |

**Order inside a box:** overdue first (most overdue first, by days for dated items, then by units over), then items with a D by D, then items without a D by units left, then jar order (Vehicles, Home, Health, Finance), thing name, item name, id, using the plain `cmp` comparison from data.js so the order is the same on every device.

**50-item caps:** each box shows the first 50 items after sorting, then "and N more" linking to the jars. Overdue items aren't exempt. The header "N things need attention this week" counts every This week item. The witty empty line shows when This week has 0 items, even if the other boxes have some.

**Jar red dot:** shown when that jar has at least one This week item.

**One-off jobs** (`itemId: "other"`), inactive things and paused items never appear in the boxes.

### 3.8 Worked examples (for qa-accessibility-tester)
T = 2026-11-03 (a Tuesday).

| Item | Rule | Last log / readings | Due | Box |
|---|---|---|---|---|
| Smoke alarm battery | every 1 year, from done | none, firstDue 2026-11-09 | 2026-11-09 (day 6) | This week |
| Gutters | each fall, calendar, firstDue 2025-09-01 | done 2025-10-20, forDue 2025-09-01 | 2026-09-01 (overdue) | This week |
| Recycling drop-off | every 2 weeks, calendar, firstDue 2026-10-10 (Sat) | done 2026-10-24, forDue 2026-10-24 | 2026-11-07 (day 4) | This week |
| HVAC filter | every 3 months, from done | done 2026-08-10 | 2026-11-10 (day 7) | This month |
| Winter prep | each year, calendar, firstDue 2026-11-15 | none | 2026-11-15 (day 12) | This month |
| Water softener salt | every 1 month, calendar, firstDue 2026-01-31 | done 2026-10-31, forDue 2026-10-31 | 2026-11-30 (day 27) | This month |
| Furnace tune-up | each fall, calendar, firstDue 2026-09-01 | done 2026-09-15, forDue 2026-09-01 | 2027-09-01 | Later |
| Oil change | every 5,000 mi, remind 1,000 | at 40,000; now 44,600 (read 2026-11-03); 30 mi/day | 45,000 mi, about 2026-11-17 (day 14) | This month |
| Oil change, too few readings | every 5,000 mi, remind 1,000 | at 40,000; now 44,600 | 45,000 mi, no estimate | This month (left 400 ≤ remind) |
| Oil change, mileage or time | every 5,000 mi (remind 1,000) or 6 months from done | done 2026-05-01 at 40,000; now 42,000, about 2027-01-10 by miles | time 2026-11-01 (overdue) | This week (time wins) |
| Mower oil | every 50 hr (remind 5) or 1 year from done | done 2026-05-01 at 120.0 hr; reading 168.0 hr | 170.0 hr, left 2.0; time 2027-05-01 | This month (hours win; shows "about 2 hr left", sorted with D 2027-05-01) |
| Generator oil | every 100 hr (remind 10) | done at 100.0 hr; reading 205.5 hr on 2026-10-30 | 200.0 hr, left -5.5 | This week (overdue, "5.5 hr over") |
| Snowblower spark plug | every 100 hr (remind 10) | no logs, starting hours 37.0 | 100.0 hr, left 63.0 | Later |
| Chainsaw chain | every 10 hr (remind 2) | no starting hours, no logs | no reading | Later ("Add a reading") |

Boundaries: day 6 (Nov 9) is the last day of This week, day 7 (Nov 10) the first of This month, day 27 (Nov 30) the last of This month, day 28 (Dec 1) the first of Later.

---

## 4. Migration and backup files

### 4.1 Moving from the Vehicle Maintenance App: CSV only
Decided: users move data by CSV export and import. There is no automatic copy.
1. In the old app: Settings → Export. It saves `vehicle-maintenance-app-YYYY-MM-DD.csv`.
2. In Pickle It: Import, choose the file, see the preview, choose Merge or Replace (same flow as today).

Pickle It's importer keeps everything the current `analyzeImport` accepts: header-based columns in any order, record_type aliases, Excel re-saves (M/D/YYYY, D/M/YYYY, D.M.YYYY, 14-Oct-26, serial numbers), semicolon and tab files, decimal commas, UTF-8/UTF-16/Windows-1252, the formula-guard `'`. Unknown columns are ignored.

Mapping from a version 1 file (Vehicle Maintenance App, or Pickle It before version 2):

| v1 row | Becomes |
|---|---|
| `vehicle` | thing, `jar: "vehicles"`, same id, name, active, starting odometer |
| `schedule` | item on that thing: `miles: { every, remind }`, `hours: null`, `time: null`, same item id |
| `shop` | settings.shops |
| `fillup` | fillup, `vehicle_id` → `thingId` |
| `maintenance` | log, `status: "done"`, `forDue: ""`, `hours: null` |
| (all) | `updatedAt` = `created_at`, or import time if blank |

Fill-Up Receipts (the app's earlier name): anyone who opened the Vehicle Maintenance App since the rename has their data there and exports from it. I couldn't confirm whether Fill-Up Receipts CSVs used the same columns; **a sample file from the owner** would settle it.

**Regression fixtures** (qa-accessibility-tester): keep version 1 exports in the repo as test files with made-up data only: a Vehicle Maintenance App export (no `format_version` column), a Pickle It version 1 export (`format_version` = 1), one re-saved by Excel (US), one semicolon/decimal-comma (European Excel), and one with formula-guarded text. Every release must import all of them with identical results.

### 4.2 Same-origin direct copy: rejected
My earlier draft proposed reading the old app's database directly when both apps share a web address. **Rejected by decision (2026-11-03):** on a shared address that code would be reading another app's data, and users bring data over by CSV instead. Not to be built.

### 4.3 Export format, version 2
Still one CSV, because users already have it, it opens in Excel, and the importer handles Excel's quirks.

**Versioning (decided):** a `format_version` column on every row, starting at 1 (`CSV_FORMAT_VERSION` in data.js, already written on export and checked on import). A blank or missing value means version 1, so Vehicle Maintenance App files import as version 1. A value higher than the app knows stops the import with the existing "made by a newer version of Pickle It" message. The earlier "meta row" idea is dropped.

**How version 2 adds columns:**
1. `CSV_FORMAT_VERSION` becomes 2.
2. New names are **appended** to `CSV_COLUMNS` after `format_version`, so every version 1 column keeps its name, position and meaning:
   `thing`, `thing_id`, `jar`, `hours`, `every_hr`, `remind_hr`, `every_n`, `every_unit`, `time_from`, `first_due`, `season`, `item_active`, `status`, `for_due`, `updated_at`.
3. New record types: `thing` (a non-vehicle thing) and `reading` (an hour-meter reading).
4. New text columns (`thing`, `season`) join `CSV_TEXT` so the formula guard covers them.
5. The importer reads each row by its own `format_version`. A version 1 row ignores the new columns (they're blank anyway), so a file pieced together from old and new exports still imports.

**Rows in version 2:**
- Vehicles stay `vehicle`, `schedule`, `fillup`, `maintenance` rows with `vehicle`/`vehicle_id`, as in version 1. A vehicle's starting hours, if any, go in `hours`.
- Other things are `thing` rows (`thing`, `thing_id`, `jar`, `active`, `date` + `hours` for starting hours, `created_at`, `updated_at`).
- Their items are `schedule` rows and their logs `maintenance` rows that use `thing`/`thing_id` instead of `vehicle`/`vehicle_id`, with blank mileage and odometer.
- Rules: miles in `every_mi`/`remind_mi` (as now), hours in `every_hr`/`remind_hr`, time in `every_n`, `every_unit`, `time_from`, `first_due`, `season`. Whichever-first items fill more than one group.
- Logs carry `hours`, `status` and `for_due`. Readings are `reading` rows with `thing_id`, `date`, `hours`.

**Rules for future versions:** bump `format_version`, only append columns or record types, never rename or repurpose a column, and keep reading every older version.

**Side effect, not a requirement:** because vehicle rows keep the version 1 layout and the old importer ignores unknown columns, the old app can still import the vehicle part of a Pickle It file. It reports `thing`, `reading` and non-vehicle rows as rows it can't use, and treats skipped logs as done.

**Merge duplicates:** a log is a duplicate on the same id, or the same thing, date, odometer, item, name, notes (today's `serviceKey`) with `status` and `hours` added to the key. A reading is a duplicate on the same id or the same thing, date and hours.

---

## 5. Personal data: for privacy-security-reviewer

1. **Shared origin with the old app.** The renames in 2.1 are done, including the BroadcastChannel and the scoped cache cleanup, so the apps no longer mix data by accident. On one origin each app can still read the other's storage, and a script-injection bug in either exposes both. A separate origin avoids that; hosting is release-manager's call with the owner.
2. **What the data reveals.** Fill-up dates and station names show where someone was and when. Home items and their dates show what someone owns and possibly when they're away. Notes are free text and can hold anything (VINs, addresses, gate codes).
3. **Health and Finance raise the bar.** Even with only names, dates and notes, these jars can hold medical appointments and conditions, providers, insurers and account names. If the spec adds amounts, account numbers or results (2.4), that needs review before build. Local-only storage keeps all of it off any server.
4. **Backups are plain text.** The CSV lands in Downloads and often gets shared or put in cloud drives, unencrypted, and with Health and Finance it will hold more sensitive data. Should the export screen say so?
5. **Import is a trust boundary.** Files can come from anyone. There **is** a 20 MB size limit (app.js, `file.size > 20 * 1024 * 1024`, checked before reading), and every row goes through the record builders with length and range limits. Both stay; new fields (hours, time rules) get the same range checks.
6. **Data loss.** iPhone Safari can delete storage for sites not installed to the home screen. Check the install prompt and backup reminder copy cover this. The app already asks for persistent storage (`askPersist`).
7. **Cloud sync later** needs its own privacy review before any build (accounts, server copies, deletion, breach handling).
8. **Hemisphere setting** is chosen by the user; location permission is never requested.
9. **Test fixtures** in 4.1 must contain made-up data only. This repo may become public.

---

## Decisions needed (owner)

1. **This month boundary:** days 7-27 (weeks 2-4, so This week plus This month is exactly 4 weeks) or 7-30 (a calendar-ish month). Recommend **7-27**, matching "2-4 weeks" in the brief.
2. **This week:** rolling (today plus 6 days) or the calendar week (Sunday or Monday start). Recommend **rolling**: no week-start setting, and an item never jumps boxes just because it's Monday.
3. **Mileage items in date boxes:** use the estimated date from driving history (3.3) or only the miles-left reminder. Recommend **estimated date**, labeled "about".
4. **Hours items in date boxes:** (A) no date estimate, place by hours left vs reminder and pair with a time rule (3.3), or (B) estimate a date from usage the same way as miles. Recommend **A**: small engines are seasonal and readings are sparse, so estimates would mislead.
5. **Season dates:** meteorological starts (Mar 1 etc.) or curated per task. Recommend letting **maintenance-content-curator** propose per-task dates, with meteorological as the fallback.
6. **Seasonal rule:** fixed calendar dates (3.2, this doc) or v1-scope's "last done + interval, snapped to the preferred month". Recommend **calendar dates**: the snap rule skips a year when a yearly task is done after its month. The UI can still ask for a "preferred month"; it's stored as a calendar yearly rule.
