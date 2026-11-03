# Pickle It: data model, due dates, storage and migration

Status: **draft proposal** from data-architect, revised 2026-11-03 (second pass) to match docs/decisions.md "2026-11-03 (Phase 1 decisions)", and again for "2026-11-03 (Phase 2 open questions)". Decided by the owner and marked **(decided)** here: storage approach, storage names, v1 jars, recurrence measures, CSV versioning, box boundaries, rolling week, season dates, several homes/people, hiding jars, units, which measures may combine, estimated dates for miles and hours, what Health and Finance hold, hosting on the shared github.io origin, no data copy from the old app, the scope of Delete all data, the 90-day estimate rule, seasonal tasks on fixed calendar dates, appliances, the Finance default thing, the account-number warning and meter changes (3.3b). Everything else is proposed; open items are in "Decisions needed" at the end.

Sources read: CLAUDE.md, docs/decisions.md, docs/brief.md, docs/specs/v1-scope.md (draft, being revised in parallel), docs/reviews/privacy-security-2026-11-03.md, data.js, app.js, sw.js, index.html and manifest.webmanifest (storage names only).

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

Adding Pets later means adding an entry. No migration. Jars only become a store if users can create their own.

**Hiding jars (decided).** Users can hide jars they don't use. Stored as `settings.hiddenJars`, an array of jar ids (default `[]`). A hidden jar keeps all its data, and it's still in the export and still cleared by "Delete all data" (6). It's left out of the tab bar, the Pantry boxes, the "N things need attention" count and the red dots. Unhiding brings everything back as it was; due dates are recalculated, never stored, so nothing goes stale while hidden.

**What each jar allows (decided):**

| Jar | Things are | Measures allowed on its items |
|---|---|---|
| Vehicles | vehicles | miles, time, hours; combined only miles + time or hours + time |
| Home | homes; each small engine as its own thing ("Mower"); an appliance as its own thing if the user wants ("Fridge") | time, hours; combined only hours + time |
| Health | people ("Me", "Sam") | time only |
| Finance | households or accounts the user names; the first one defaults to "Household" ("Rental", "Car insurance") | time only |

Several of each (several homes, several people, several households) are allowed (decided). **Appliances (decided):** an appliance can be its own Home thing, but starter tasks for appliances (fridge coils, dryer vent, water heater) sit on the home by default; the user can move or add them to an appliance thing. Nothing in the model changes either way: an appliance is a Home thing like a mower. The record builders reject anything outside this table: a `miles` rule off a vehicle, an `hours` or `miles` rule in Health or Finance, or miles + hours on one item.

### 2.3 Stores (IndexedDB `pickle-it`)

**things** (key `id`): what the user owns or looks after. Replaces the `vehicles` store.

| Field | Type | Notes |
|---|---|---|
| id | string | `newId("t")`. Imported vehicles keep their `v_...` id. |
| jar | `"vehicles"` \| `"home"` \| `"health"` \| `"finance"` | Which tab it lives in. Fill-ups and MPG are keyed on `jar === "vehicles"`. |
| name | string, 1-80 chars | "2019 Civic", "Home", "Push mower", "Me". |
| active | boolean | Inactive things are hidden from due boxes (as today's inactive vehicles). |
| odometer, odometerDate | whole miles or null, YYYY-MM-DD or "" | Starting odometer. Vehicles only, same rules as `makeVehicle`. |
| hours, hoursDate | number or null, YYYY-MM-DD or "" | **New.** Starting hour-meter reading, 0-99,999.9, one decimal. Vehicles and Home only (a mower, a generator, an outboard). Asked for only when the thing has at least one item with an `hours` rule. |
| items | array of items (below) | Embedded, as today. Item ids are unique within one thing only. |
| createdAt, updatedAt | ISO timestamp (UTC) | `updatedAt` is new. |

**Item** (inside `thing.items`): one recurring task. Today's `{ id, name, every, remind }` becomes:

| Field | Type | Notes |
|---|---|---|
| id | string | Unique within the thing. Library items keep short ids (`oil`, `furnace`) so imports and the curator's library can match them. |
| name | string, 1-80 chars | |
| miles | `{ every, remind }` or null | Whole miles, `every` 1-999,999, `remind` 0-999,999. Vehicles only. Exactly today's `every`/`remind`. |
| hours | `{ every, remind }` or null | **New.** Hours of use, `every` 0.1-99,999.9, `remind` 0-99,999.9, one decimal. Vehicles and Home only. |
| time | `{ n, unit, from, firstDue, season }` or null | `n` whole 1-999; `unit` `"day"`, `"week"`, `"month"` or `"year"`; `from` `"done"` or `"calendar"` (3.2); `firstDue` YYYY-MM-DD; `season` optional display label, never used in math. |
| active | boolean | Paused items are hidden from due boxes. Default true. |

At least one of `miles`, `hours`, `time` is required. Allowed combinations **(decided)**: one rule alone, miles + time, or hours + time, whichever comes first (3.4). Never miles + hours, and never all three. This covers every decided measure: odometer miles (`miles`), months/days/weeks/years from last done (`time`, `from: "done"`), hours of use (`hours`), and fixed recurring dates such as biweekly recycling or winter prep (`time`, `from: "calendar"`).

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
| shop | string | Shop, contractor, provider or "DIY". Name only, up to 80 chars. Suggestions come from that jar's own list (`settings.shops`, below). |
| notes | string, up to 2,000 chars | |
| visit | string | Groups items done in one visit, as today |
| status | `"done"` \| `"skipped"` | New. Imported old records are `"done"`. |
| forDue | YYYY-MM-DD or "" | New. The due date this log closed, saved when it's logged. Needed for calendar schedules (3.2). "" for imports and one-off jobs. |
| createdAt, updatedAt | ISO timestamp (UTC) | |

**readings** (key `id`): **new.** An hour-meter reading taken without doing a task ("Update hours"). Vehicles don't need this for plain odometer readings: fill-ups, including odometer-only fill-ups, already are readings. Also holds meter changes for either meter (3.3b, proposed).

| Field | Type | Notes |
|---|---|---|
| id | string | `newId("r")` |
| thingId | string | |
| date | YYYY-MM-DD | |
| hours | number or null | 0-99,999.9. Null only on a miles meter change. |
| meter | `"hours"` (default) \| `"miles"` | **Proposed, 3.3b.** Which meter the row is for. `"miles"` only on a meter change for a vehicle. |
| odometer | whole miles or null | **Proposed, 3.3b.** Only on a miles meter change: the new odometer's first value. |
| oldValue | number or null | **Proposed, 3.3b.** Set only on a meter change: the old meter's last value. `hours` or `odometer` is then the new meter's first value. Null on a normal reading. |
| createdAt, updatedAt | ISO timestamp (UTC) | |

Current hours for a thing = the highest of its starting `hours`, its logs' `hours` and its readings (same idea as `latestOdo`), after adjusting for meter changes (3.3b).

**fillups** (key `id`): unchanged except `vehicleId` is renamed `thingId` and `updatedAt` is added.

**settings** (key `key`): `lastExport`, `lastChange` as today, plus:
- `shops` **(changed, per jar)**: `{ vehicles: [...], home: [...], health: [...], finance: [...] }`, each a list of names. Fixes privacy review M5: a clinic added in Health is never suggested in the Vehicles form. The log form suggests only its own jar's list; saving a log with a new name adds it to that jar's list only. Reading an old value that is a plain array (today's format) puts it all under `vehicles`.
- `hemisphere`: `"north"` default or `"south"`, used only to suggest season dates.
- `hiddenJars`: see 2.2.

### 2.4 Health and Finance (decided)
**Health tracks reminders only in v1:** recurring appointments and renewals per person. **Finance tracks money deadlines only:** no amounts. Both use the model above with nothing jar-specific added. The earlier open questions are settled:
1. **What a thing is:** Health, a person, name only ("Me", "Sam", "Dad"); Finance, a household or account the user names ("Household", "Rental", "Car insurance"); the first one is prefilled "Household" (decided). Several of each.
2. **Measures:** time only (`from: "done"` or `"calendar"`). No miles, no hours.
3. **Log fields:** date, provider (`shop`, name only, from the jar's own list), notes, status, `forDue`. Nothing else: no amounts, no results, no doses, no policy or account numbers.
4. **One-time deadlines:** not in v1; every item recurs (2.7). A one-off can be logged as `itemId: "other"`, which never shows in the boxes.
5. **Starter libraries:** maintenance-content-curator, generic and without medical or financial advice.

Optional Finance amounts may come later, only after a privacy review (decided). That would be an added field and an added CSV column, not a reshape.

### 2.4a Fields Pickle It never stores
A hard rule for every jar, in the record builders and the importer: **no field, not just no input.** Unknown CSV columns stay ignored, so an import can't create these either. From privacy review 2.3:

- Health: diagnosis, condition, medication, dose, test results, insurance member or policy ID, date of birth, age, sex, a relationship field on people.
- Finance: amounts and balances (until the owner approves amounts after a privacy review), account, routing or card numbers, SSN or tax ID.
- Any jar: provider or shop phone or address, passwords, PINs, security answers, the user's own name, email or phone, location or GPS, photos, device IDs, analytics or advertising IDs.

Free-text notes and names can still hold anything the user types. That's handled in the UI, not the model: per-jar note placeholders and the soft warning (decided for v1). **Account-number warning:** when a Health or Finance thing name, item name, provider or note contains a run of 9 or more digits or a likely card number (13-19 digits passing a Luhn check; privacy review 2.4, v1-scope D14), the form asks "This looks like an account or ID number. Pickle It backups aren't encrypted. Save anyway?" The check runs in app.js in the save handler, on the device, before the record builder. Choosing Save stores the text exactly as typed, the same as any other text: no flag, no masking, no separate field, nothing about the check. The importer doesn't run it. Thing and item names never go in the URL or `document.title`.

### 2.5 Why this shape
- One task model for every jar: a thing, items with any mix of miles, hours and time, and logs. Only fill-ups and MPG are vehicle-specific.
- Keeping items embedded and keeping the existing record builders (`makeVehicle`, `makeItem`, `makeService`, `makeFillup`) with small additions keeps the import/merge code in data.js nearly intact.
- Hours mirror miles exactly (`every`/`remind`, current reading = highest reading, same "no log yet" rule), so the code reuses the mileage path with a different reading source.
- The `vehicleId` to `thingId` rename is mechanical. CSV columns keep their old names (4.3).

### 2.6 Where small UI state lives
- Device-only conveniences (box collapsed/expanded, Log section Hide/Show, theme, palette): localStorage under `pickle-it:` keys, as today. Not exported.
- Onboarding completed and `hiddenJars`: `settings` store. Not exported, so a new device runs onboarding again after an import unless the importer marks onboarding done when it saves data (recommended).

### 2.7 Not included (name them so nobody assumes they are)
Costs on maintenance logs, amounts in Finance, kilometers and litres (**units are miles and US gallons for v1, decided**), photos or receipts, snooze, notifications, user-created jars, sharing between people, one-time (non-recurring) deadlines, tombstones for sync. Each can be added later without reshaping the above.

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

**Seasons (decided: fixed calendar dates).** "Each spring/summer/fall/winter" is a calendar yearly schedule (`n: 1, unit: "year", from: "calendar"`) with `firstDue` at the next season start and `season` saved as a label. v1-scope's "preferred month" maps to the same thing with `firstDue` on the 1st of that month. **Season dates (decided):** the maintenance-content-curator picks a date per library task (e.g. furnace tune-up Sep 15); a task with no curated date uses the fixed season start: north Mar 1, Jun 1, Sep 1, Dec 1; south shifted 6 months. The curated date is just the library item's default `firstDue` month and day, so it needs no new field. Changing the hemisphere setting doesn't move existing items. Location is never read.

Why calendar mode instead of "last done + interval, then snap to the preferred month" (v1-scope 4.4 AC 4): with a yearly interval the snap rule skips a year whenever the task is done after its month. Furnace tune-up preferred in September, done Oct 15: last done + 1 year = Oct 15 next year, and the next September on or after that is the year after, so a whole year is lost. Calendar mode gives next September.

**Leap years.** Day and week intervals are unaffected. A yearly calendar item first due Feb 29, 2028 falls on Feb 28 in 2029-2031 and Feb 29 again in 2032. A yearly "from done" item done on Feb 29 is next due Feb 28, and stays on the 28th after that.

### 3.3 Meter-based schedules: miles and hours
Both work the same way, with a different reading source:

| | Miles (vehicles) | Hours (vehicles and Home) |
|---|---|---|
| Readings | starting odometer, fill-ups, logs | starting hours, logs, readings |
| Current value | highest reading (`latestOdo`) | highest reading |
| Unit precision | whole miles | 0.1 hour |

Each small engine is its own thing in Home and holds its own hour reading (decided), so every task on the mower shares one reading, like an odometer.

- With logs: due value = the item's log with the highest reading + `every`. (Logs without a reading for that meter are ignored here.)
- No log: assume it was done at the last regular interval: `max(every, ceil(cur / every) * every)` (today's `scheduledDue`).
- left = due value - current value. Hours: round to 0.1 (`Math.round(x * 10) / 10`) to drop floating-point noise.
- No current reading at all (no starting value, no logs, no readings): no meter due; the item shows "Add a reading" and goes to Later unless another rule places it.

**Estimated date (decided for both miles and hours, including the 90-day and 30-day rule below).** One function for both meters, so mileage and hours items land in the date boxes. Hours use hours per day between readings, exactly as miles use miles per day.
- **Readings** for the thing: miles = starting odometer (if `odometerDate` is set), fill-ups and logs with an odometer; hours = starting hours (if `hoursDate` is set), logs with hours and `readings`. Only those dated within the last 365 days (date ≥ T - 365).
- **Enough readings** means all three:
  1. at least 2 readings at least 30 days apart,
  2. a higher value on the latest-dated reading than on the earliest-dated one, and
  3. the latest reading is within the last 90 days (date ≥ T - 90).
- **Rate** = (value of the latest-dated reading - value of the earliest-dated reading) / days between their dates. Where two readings share a date, use the higher value.
- **Estimated date** E = latest reading's date + `ceil(left / rate)` days, computed only when left > 0. Compute the day count in whole numbers as `ceil(left × span / delta)` (span = days between the two readings, delta = value difference; hours multiplied by 10 first), so exact cases like 276.0 days don't become 277 through floating-point error.
- If E is before T (the estimate has already passed but no reading shows it), use E = T: the item is due today, not overdue (3.6).

Why the 90-day rule: a mower last read in October with a summer rate would otherwise predict a date in December and sit in This week all winter, and a car with no fill-ups logged for months has no useful rate. With stale readings the item falls back to the remind window until a new reading arrives. The rule limits this, but doesn't remove it: that mower can still show in This week for up to 90 days after its last reading.

**Fallback when there aren't enough readings** (or left ≤ 0): no estimated date. The item is placed by the remind window alone:
- left < 0 → overdue → This week. left = 0 → due now → This week.
- 0 < left ≤ `remind` → This month.
- left > `remind` → Later.
For hours, this is the normal case for a new machine or one read only at service time. The curator's library pairs hours tasks with a time rule ("every 50 hours or each spring"), which gives them a real date through 3.4.

### 3.3a What the Pantry row shows for meter items (decided format)
Mileage tasks show **"<miles remaining> / <estimated date>"** and hours tasks **"<hours remaining> / <estimated date>"**, with no "about" label (decided). The due function returns the values; the UI only formats them.

| Value | Computed as | Displayed as |
|---|---|---|
| Miles remaining | `left` (whole miles) | Device number format, unit "mi": `2,600 mi` |
| Hours remaining | `left` rounded to 0.1 | One decimal, trailing `.0` dropped, unit "hr": `2 hr`, `2.5 hr`, `1,204.5 hr` |
| Estimated date | D for the item (3.4): E above, or the time rule's due date if it's earlier | `Today` when D = T; `Nov 17`; with the year when D is more than about 6 months after T, `Jun 3, 2027` (decided; device locale short month, en-US shown). A passed estimate shows `Due now` instead (next table) |

| Situation | Row shows | Example |
|---|---|---|
| left > 0 and the item has a D | remaining / date | `400 mi / Nov 17`, `2 hr / Nov 7` |
| left > 0, no D (no estimate, no time rule) | remaining only | `400 mi`, `63 hr` |
| left = 0, or E was before T (set to T in 3.3) with no newer reading | `Due now`, no date | `Due now` |
| left < 0 (overdue by reading) | amount over, no date | `120 mi over`, `5.5 hr over` |
| No reading at all | prompt, no date | `Add a reading`, for miles and hours alike |
| miles + time or hours + time, time rule overdue, meter left > 0 | remaining / the time rule's due date, with the overdue flag | `3,000 mi / Nov 1` (shown as overdue) |

For combined items the date is always D, the earlier of the estimate and the time rule's due date, so the row shows when it's really due. Time-only items aren't in this table; they show their due date as v1-scope and the mockups define.

### 3.3b Meter reset or replacement (decided 2026-11-03: option A)
An odometer or hour meter can go backward: a replaced engine or instrument cluster, a swapped hour meter, an old mechanical meter rolling over. Today nothing handles this. The math in 3.3 takes the **highest** reading as current, so a lower new reading is ignored: due values freeze at the old meter's numbers, and rule 2 of "enough readings" fails (the latest reading is lower than the earliest), so there's no estimated date either. The item sits in the wrong box until the new meter passes the old one's highest value.

**Decided: record the change, then shift the older readings.** A meter change is one `readings` row (2.3) with the date, the old meter's last value (`oldValue`) and the new meter's first value. Every reading of that meter on that thing dated before the change (or on the same date and created before it) is shifted by `new - old`, at read time. Stored values never change, so history shows what was typed; the shift is recalculated like due dates. With several changes, a reading is shifted by the sum of every later change. All of 3.3 then runs unchanged on the shifted values: current value, due value, left, rate, the 30-day and 90-day rules. Shifted values can be negative; that's fine for the math and never shown.

- **How it's recorded:** when a fill-up, log or reading is lower than the current value, the form asks "That's lower than the last reading (150.0 hr). Was the meter replaced or reset?" Yes saves the entry plus a meter change with `oldValue` prefilled to the current value (editable). No means a typo; the user fixes the number. A "Meter replaced" action on the thing does the same without a regular entry.
- **Swapped meter, same engine:** nothing else to do; schedules carry over exactly.
- **New engine:** the schedules also carry over. If the new engine came with fresh oil, the user logs those items as done at the change, as with any service.
- **No change recorded:** the lower reading is kept (4.4) and 3.3 behaves as described above, so the app should always ask.
- **MPG:** should use the same shifted odometer, so the fill-up after a change gives a normal distance instead of a negative one. Not checked against the current MPG code; check at build.
- **Export:** if approved, version 2 appends `meter` and `old_value` columns to `reading` rows (4.3) and allows `reading` rows for vehicles.

**Worked example** (T = 2026-11-03, the same mower as 3.8):

| Item | Rule | Last log / readings | Due | Box |
|---|---|---|---|---|
| Mower oil, hour meter replaced | every 50 hr (remind 5) or 1 year from done | done 2026-05-01 at 120.0 hr; meter replaced 2026-08-01, old meter at 150.0, new at 0.0 (shift -150.0); reading 18.0 hr on 2026-10-30 | log shifts to -30.0, so due = -30.0 + 50 = 20.0; current 18.0; left 2.0. Rate: -30.0 on May 1 to 18.0 on Oct 30 = 48 hr in 182 days; E = Oct 30 + ceil(2.0 x 182 / 48) = 8 days = 2026-11-07 (day 4); time 2027-05-01; D = 2026-11-07 | This week, shows `2 hr / Nov 7` |
| Same, change not recorded | as above | the same three values, no meter change | current 150.0 (highest), due 170.0, left 20.0; no estimate (latest reading 18.0 is lower than the earliest) | Later (left > remind), shows `20 hr`, which is wrong: 2 hr are really left |

### 3.4 Whichever comes first
Each rule on an item gives a placement:
- `time`: a due date.
- `miles` or `hours`: an estimated date if one exists (3.3), otherwise a box from left vs `remind`.

The item goes in the **most urgent** box any of its rules gives, and is overdue if any rule is overdue. Its sort date D is the earliest date among its rules that have one; if none have a date, it has no D. A meter rule with an estimate but left ≤ `remind` is never placed in Later (at most This month), so the user's reminder setting is honored.

One log resets every rule: the time rule uses the latest log by date, the meter rules the log with the highest reading for that meter. For normal use that's the same log. A log without a reading for a meter (an hours item logged without hours, which the form shouldn't allow) leaves that meter's rule where it was.

### 3.5 Skipped
"Skip this time" saves a log with `status: "skipped"`, today's date, the current odometer and/or hours if the item has those rules, and `forDue` set to the due date it skips (blank for meter-only items). The due math treats it exactly like a done log. History shows it as "Skipped", and "last done" ignores skipped logs. Deleting a log makes the previous one count again, because due dates are always recalculated from logs.

### 3.6 Overdue
- Time: due date before today.
- Miles or hours: left < 0 on a real reading. left = 0 is "due now", treated as due today.
- An estimated date that has passed is **due today** (E is set to T, 3.3), not overdue. Overdue needs a real reading, never an estimate.

### 3.7 The Pantry boxes
For each active item on each active thing in a jar that isn't hidden, place it by 3.2-3.4 with `days = D - T`. Boundaries **(decided)**: This week is rolling (overdue plus today to day 6), This month is days 7-27, Later is day 28 on. No week-start setting.

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
| Oil change | every 5,000 mi, remind 1,000 | at 40,000 on 2026-07-27; now 44,600 (fill-up 2026-11-03); 4,600 mi in 99 days = 46.5 mi/day | 45,000 mi, left 400; E = Nov 3 + ceil(400 / 46.5) = 9 days = 2026-11-12 (day 9) | This month, shows `400 mi / Nov 12` |
| Oil change, too few readings | every 5,000 mi, remind 1,000 | at 40,000; now 44,600, both on 2026-11-03 | 45,000 mi, left 400, no estimate | This month (left 400 ≤ remind), shows `400 mi` |
| Oil change, stale readings | every 5,000 mi, remind 1,000 | readings 2026-01-10 at 30,000 and 2026-06-01 at 36,000 (latest > 90 days ago) | 40,000 mi (no log: next multiple), left 4,000, no estimate | Later (left > remind), shows `4,000 mi` |
| Oil change, mileage or time | every 5,000 mi (remind 1,000) or 6 months from done | done 2026-05-01 at 40,000; now 42,000 (2026-11-01); 2,000 mi in 184 days = 10.9 mi/day | miles 45,000, left 3,000, E = Nov 1 + 276 days = 2027-08-04; time 2026-11-01 (overdue); D = 2026-11-01 | This week (time wins, overdue), shows `3,000 mi / Nov 1` |
| Mower oil | every 50 hr (remind 5) or 1 year from done | done 2026-05-01 at 120.0 hr; reading 168.0 hr on 2026-10-30; 48 hr in 182 days = 0.264 hr/day | 170.0 hr, left 2.0; E = Oct 30 + ceil(2.0 / 0.264) = 8 days = 2026-11-07 (day 4); time 2027-05-01; D = 2026-11-07 | This week, shows `2 hr / Nov 7` |
| Generator oil | every 100 hr (remind 10) | done at 100.0 hr; reading 205.5 hr on 2026-10-30 | 200.0 hr, left -5.5 | This week (overdue), shows `5.5 hr over` |
| Snowblower spark plug | every 100 hr (remind 10) | no logs, one reading: starting hours 37.0 | 100.0 hr, left 63.0, no estimate (one reading) | Later, shows `63 hr` |
| Pressure washer pump oil | every 50 hr (remind 5) | done 2026-04-20 at 10.0 hr; reading 52.5 hr on 2026-07-15 (more than 90 days ago) | 60.0 hr, left 7.5, no estimate (stale) | Later (left > remind), shows `7.5 hr` |
| Chainsaw chain | every 10 hr (remind 2) | no starting hours, no logs | no reading | Later, shows `Add a reading` |
| Outboard impeller | every 100 hr (remind 10) | done 2026-06-01 at 300.0 hr; reading 395.0 hr on 2026-10-01; 95 hr in 122 days = 0.779 hr/day | 400.0 hr, left 5.0; E = Oct 1 + ceil(5.0 / 0.779) = 7 days = 2026-10-08, before T, so E = T | This week (due today, not overdue), shows `Due now` |

Boundaries: day 6 (Nov 9) is the last day of This week, day 7 (Nov 10) the first of This month, day 27 (Nov 30) the last of This month, day 28 (Dec 1) the first of Later.

---

## 4. Migration and backup files

### 4.1 Moving from the Vehicle Maintenance App: CSV
Decided: CSV export and import is the only way to bring Vehicle Maintenance App data over. There's no copy from the old app's database, and nothing in Pickle It detects, opens or reads the old app's database or `vma:` keys (decided 2026-11-03: the old app has no users with data). Old-app files import as version 1 (no `format_version` column), which already works.
1. In the old app: Settings → Export. It saves `vehicle-maintenance-app-YYYY-MM-DD.csv`.
2. In Pickle It: Import, choose the file, see the preview, choose Merge or Replace (same flow as today).

Pickle It's importer keeps everything the current `analyzeImport` accepts: header-based columns in any order, record_type aliases, Excel re-saves (M/D/YYYY, D/M/YYYY, D.M.YYYY, 14-Oct-26, serial numbers), semicolon and tab files, decimal commas, UTF-8/UTF-16/Windows-1252, the formula-guard `'`. Unknown columns are ignored.

Mapping from a version 1 file (Vehicle Maintenance App, or Pickle It before version 2):

| v1 row | Becomes |
|---|---|
| `vehicle` | thing, `jar: "vehicles"`, same id, name, active, starting odometer |
| `schedule` | item on that thing: `miles: { every, remind }`, `hours: null`, `time: null`, same item id |
| `shop` | `settings.shops.vehicles` (version 1 shops were all vehicle shops) |
| `fillup` | fillup, `vehicle_id` → `thingId` |
| `maintenance` | log, `status: "done"`, `forDue: ""`, `hours: null` |
| (all) | `updatedAt` = `created_at`, or import time if blank |

Fill-Up Receipts (the app's earlier name): anyone who opened the Vehicle Maintenance App since the rename has their data there and exports from it. I couldn't confirm whether Fill-Up Receipts CSVs used the same columns; **a sample file from the owner** would settle it.

**Regression fixtures** (qa-accessibility-tester): keep version 1 exports in the repo as test files with made-up data only: a Vehicle Maintenance App export (no `format_version` column), a Pickle It version 1 export (`format_version` = 1), one re-saved by Excel (US), one semicolon/decimal-comma (European Excel), and one with formula-guarded text. Every release must import all of them with identical results.

### 4.2 (Removed)
The read-only copy from the old app's database is dropped (decided 2026-11-03: the Vehicle Maintenance App has no users with data). No old-app banner or notice period either. Numbers 4.3 and 4.4 are kept because other docs cite them.

### 4.3 Export format, version 2
Still one CSV, because users already have it, it opens in Excel, and the importer handles Excel's quirks.

**Versioning (decided):** a `format_version` column on every row, starting at 1 (`CSV_FORMAT_VERSION` in data.js, already written on export and checked on import). A blank or missing value means version 1, so Vehicle Maintenance App files import as version 1. A value higher than the app knows stops the import with the existing "made by a newer version of Pickle It" message. The earlier "meta row" idea is dropped.

**How version 2 adds columns:**
1. `CSV_FORMAT_VERSION` becomes 2.
2. New names are **appended** to `CSV_COLUMNS` after `format_version`, so every version 1 column keeps its name, position and meaning:
   `thing`, `thing_id`, `jar`, `hours`, `every_hr`, `remind_hr`, `every_n`, `every_unit`, `time_from`, `first_due`, `season`, `item_active`, `status`, `for_due`, `updated_at`.
3. New record types: `thing` (a non-vehicle thing) and `reading` (an hour-meter reading).
4. New text columns (`thing`, `season`) join `CSV_TEXT` so the formula guard covers them. Id columns are checked as in 4.4.
5. The importer reads each row by its own `format_version`. A version 1 row ignores the new columns (they're blank anyway), so a file pieced together from old and new exports still imports.

**Rows in version 2:**
- Vehicles stay `vehicle`, `schedule`, `fillup`, `maintenance` rows with `vehicle`/`vehicle_id`, as in version 1. A vehicle's starting hours, if any, go in `hours`.
- Other things are `thing` rows (`thing`, `thing_id`, `jar`, `active`, `date` + `hours` for starting hours, `created_at`, `updated_at`).
- Their items are `schedule` rows and their logs `maintenance` rows that use `thing`/`thing_id` instead of `vehicle`/`vehicle_id`, with blank mileage and odometer.
- Rules: miles in `every_mi`/`remind_mi` (as now), hours in `every_hr`/`remind_hr`, time in `every_n`, `every_unit`, `time_from`, `first_due`, `season`. Whichever-first items fill more than one group.
- Logs carry `hours`, `status` and `for_due`. Readings are `reading` rows with `thing_id`, `date`, `hours` (plus the meter change columns in 3.3b, if approved).
- Shops are `shop` rows with `jar` set. A `shop` row with a blank `jar` (every version 1 file) goes to `vehicles`.

**Rules for future versions:** bump `format_version`, only append columns or record types, never rename or repurpose a column, and keep reading every older version.

**Side effect, not a requirement:** because vehicle rows keep the version 1 layout and the old importer ignores unknown columns, the old app can still import the vehicle part of a Pickle It file. It reports `thing`, `reading` and non-vehicle rows as rows it can't use, and treats skipped logs as done.

**Merge duplicates:** a log is a duplicate on the same id, or the same thing, date, odometer, item, name, notes (today's `serviceKey`) with `status` and `hours` added to the key. A reading is a duplicate on the same id or the same thing, date and hours. A shop is a duplicate on the same jar and name (case-insensitive).

### 4.4 Import checks (privacy review m2, m3)
Import is a trust boundary: files can come from anyone. Everything in 4.1 (record builders, length caps, 20 MB limit, binary rejection, preview first) stays. Version 2 adds:

**Allowed values.** A value outside its list rejects that row (listed in the preview as a row it can't use), not the whole file. Matching ignores case and surrounding spaces.

| Column | Allowed |
|---|---|
| `record_type` | `vehicle`, `thing`, `schedule`, `shop`, `fillup`, `maintenance`, `reading` (plus today's aliases) |
| `jar` | `vehicles`, `home`, `health`, `finance`; blank means `vehicles` on `vehicle` and `shop` rows; required on `thing` rows |
| `every_unit` | `day`, `week`, `month`, `year` |
| `time_from` | `done`, `calendar` |
| `status` | `done`, `skipped`; blank means `done` |
| `item_active`, `active` | today's yes/no values |

**Numbers.** `hours`, `every_hr`, `remind_hr` and `reading` hours: finite, 0-99,999.9, rounded to one decimal, decimal comma accepted; `NaN`, `Infinity` and negatives reject the row. `every_n`: whole 1-999. A reading lower than an earlier one is kept; without a meter change row it doesn't lower the current value (3.3b).

**Combinations.** A `schedule` row whose rules break 2.2 or 2.3 (miles off a vehicle, hours or miles in Health or Finance, miles + hours) is rejected.

**Text and dates.** `thing` names capped at 80 chars like vehicle names; `first_due` and `for_due` go through the same date parser as `date`. Unknown columns stay ignored, so nothing from 2.4a can arrive by import.

**Ids (m3).** Every id column (`id`, `vehicle_id`, `thing_id`, `item_id`, `visit`) must match `^[A-Za-z0-9_~-]{1,60}$`. Our own ids (`newId()`: prefix, `_`, base-36) and library item ids (`oil`) already do. An id that doesn't match gets a new `newId()`, and **the same bad value maps to the same new id across the whole file**, so a thing's fill-ups, items and logs stay linked to it. This stops a crafted file from planting `=HYPERLINK(...)` in an id that the next export would write out unguarded. Enum columns are safe once allow-listed; `thing` and `season` are covered by `CSV_TEXT`.

---

## 5. Personal data: for privacy-security-reviewer

1. **Shared origin with the old app (decided: shared github.io origin).** The renames in 2.1 are done, including the BroadcastChannel and the scoped cache cleanup, so the apps don't mix data by accident. Each app can still read the other's storage, and a script-injection bug in either exposes both, until the old app is deleted. Pickle It never reads the old app's storage (4.1).
2. **What the data reveals.** Fill-up dates and station names show where someone was and when. Home items and their dates show what someone owns and possibly when they're away. Notes are free text and can hold anything (VINs, addresses, gate codes).
3. **Health and Finance (decided: reminders and money deadlines only).** Fields that are never stored are in 2.4a. Provider lists are per jar (2.3, fixes M5). Task names and notes can still reveal conditions or debts; per-jar note placeholders and the account-number warning (2.4a) are UI work.
4. **Backups are plain text (decided: one full backup with a warning).** Every export shows the "isn't encrypted" line from privacy review 2.6.
5. **Import is a trust boundary.** 20 MB limit, record builders, and the version 2 checks in 4.4 (allowed values, number ranges, id pattern).
6. **Data loss.** iPhone Safari can delete storage for sites not installed to the home screen. Check the install prompt and backup reminder copy cover this. The app already asks for persistent storage (`askPersist`).
7. **Cloud sync later** needs its own privacy review before any build (accounts, server copies, deletion, breach handling).
8. **Hemisphere setting** is chosen by the user; location permission is never requested.
9. **Test fixtures** in 4.1 must contain made-up data only, Health and Finance especially. This repo may become public.
10. **Delete all data** is specified in section 6 (fixes M6).

---

## 6. Delete all data

Settings > App settings has a "Delete all data" button. The user confirms twice, the second time by typing DELETE (any case) (decided). The first step offers Export first. The wording and dialogs are the spec writer's and designer's; this section says what gets cleared. **Scope (decided): only Pickle It's data.**

**Steps, in order:**
1. **IndexedDB:** close this tab's connection (`idb.close()`), then `indexedDB.deleteDatabase("pickle-it")`. One step deletes every store, including any added later (`things`, `logs`, `readings`, `fillups`, and `settings` with shops, last export, change count, hemisphere, hidden jars, onboarding done), and the database files, so nothing is left for a write-back or in leftover files (privacy review P2-M3). It names `pickle-it` exactly, so it can't touch another app's database.
2. **Wait for success.** Claim success only on `onsuccess`. On `onerror`, say it failed, run nothing below, and offer a retry.
3. **localStorage:** only after step 2, remove every key that starts with `pickle-it:`, looping and matching the prefix so keys added later are covered. This resets theme and palette to their defaults (System, Green) along with collapse state and the rest.
4. **Other open tabs:** post `"wiped"` on the `pickle-it` BroadcastChannel. Other tabs call `location.reload()`, not `reload()`, so open dialogs are dropped and they show the empty app. Today's handler (`bc.onmessage` in app.js) reloads data on any message; it needs this `"wiped"` branch.
5. **Reload this tab.** The next `openDB()` recreates the empty schema and onboarding runs.

**Blocked delete (another tab holds the database open).** Every connection already closes itself on `versionchange` (`openDB()` in data.js sets `idb.onversionchange = () => idb.close()`), so other Pickle It tabs let go as soon as the delete starts, and a late save from them fails instead of writing data back. If a connection still doesn't close (a tab running an older copy of the app, or a frozen background tab), the browser fires `onblocked` and holds the delete until it closes. The app then shows "Close other Pickle It tabs to finish deleting" and keeps waiting; the request completes by itself once that tab closes. While blocked it doesn't report success, clear localStorage or reload, and the data still exists until `onsuccess`.

**Not cleared, on purpose:**
- **The `pickle-it-v1` cache and the service worker registration.** They hold only the app's own files (sw.js caches same-origin app files; user data never goes through it), so deleting them protects nothing and would stop the app reopening offline (privacy review P2-m1). They stay, and the app reopens empty.
- **Anything not named `pickle-it` / `pickle-it:`.** No `localStorage.clear()`, no `Clear-Site-Data`, no deleting Cache Storage of any other app, no `deleteDatabase` on any other name. On the shared origin that leaves the Vehicle Maintenance App's database, `vma:` keys and caches alone; there's no option to delete them (decided).

Not reversible: the user's exported CSV files are the only way back, which is why the first step offers Export.

**Can't be cleared by the app:** the persistent-storage grant (`navigator.storage.persist()` can't be undone; it holds no data), files the user exported, and the installed home-screen icon. Help copy should say that removing the app from the home screen or clearing site data in the browser also deletes everything.

---

## Decisions needed (owner)

None open. Most recently decided: the old-app copy (dropped; CSV only), the seasonal rule (fixed calendar dates), the 90-day estimate rule, the scope of Delete all data, and meter reset or replacement (option A, 3.3b).
