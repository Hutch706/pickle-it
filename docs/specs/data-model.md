# Pickle It: data model, due dates, storage and migration

Status: **draft proposal** from data-architect, 2026-11-03. Nothing here is decided. Storage, hosting and the box boundaries need the owner's approval (see "Decisions needed" at the end).

Sources read: CLAUDE.md, docs/brief.md, docs/decisions.md, docs/open-questions.md, data.js, the storage parts of app.js and sw.js, and README.md (CSV section).

---

## 1. Storage: local-only or accounts with cloud sync

### Option A: local-only, as today (recommended for v1)
Data stays in IndexedDB in the user's browser. Backups are the CSV export.

| | |
|---|---|
| **Cost** | $0. Static hosting (GitHub Pages or Cloudflare Pages) is free at this scale. |
| **Privacy** | Best possible. The owner never receives anyone's data, so there's no user database to protect, breach, or answer deletion requests for. The privacy policy can honestly say "we don't collect your data". |
| **Effort** | Near zero. It's what the code already does. |
| **Lock-in** | Low. Plain browser APIs, and the CSV opens in Excel and moves anywhere. |
| **Downsides** | No sync between a phone and a laptop. Data is lost if the user clears site data, loses the device without a backup, or (on iPhone) Safari evicts storage for a site that isn't installed to the home screen and isn't used for a while. The app already asks for persistent storage (`askPersist`) and nags for backups (`backupDue` in app.js). Reminders can't arrive while the app is closed: web push needs a server. |

### Option B: accounts with cloud sync
A hosted backend (for example Supabase or Firebase) with sign-in, a server copy of every record, and offline-first sync on each device.

| | |
|---|---|
| **Cost** | Free tiers exist, then roughly $25/month (Supabase Pro) or pay-as-you-go (Firebase Blaze) once usage grows, plus a domain and email sending for sign-in. Prices change; release-manager should verify before any decision. |
| **Privacy** | The owner becomes responsible for everyone's data: emails, vehicles, fuel receipts (dates and station names show where someone was), home tasks (what someone owns, when they're away). That brings a real privacy policy, account deletion (required by the app stores), data export on request, breach handling, and GDPR/CCPA duties if used outside the US. |
| **Effort** | Large. Sign-in and account recovery, server schema and access rules, sync with conflict handling for offline edits, deletes that sync (tombstones), account deletion, and support. Weeks of work, and it breaks the "no dependencies" rule in CLAUDE.md. |
| **Lock-in** | Medium (Supabase: standard Postgres, can be moved) to high (Firebase: proprietary database and auth). |
| **Upside** | Multi-device sync, no lost data, server-sent reminders become possible. |

### Option C (for later): sync through the user's own storage
Export or auto-save the backup file to iCloud Drive or Google Drive through the phone's share sheet. Keeps Option A's privacy, adds a manual form of sync. Worth revisiting after v1.

### Recommendation
**Option A for v1.** It matches the brief's public-release plan with no running cost and no personal data held by the owner. To avoid trapping the app if sync is wanted later, the model below gives every record a random id (already true) and an `updatedAt` timestamp, which is what a later merge or sync needs. Tombstones for synced deletes are not built now. **The owner decides.**

---

## 2. Data model

### 2.1 Storage names (required, not optional)
Pickle It must use its **own** names. If it's hosted on the same `github.io` account as the old app (this repo is `Hutch706/pickle-it`, so likely `hutch706.github.io/pickle-it`), the two apps share one origin, and IndexedDB, localStorage and the service worker cache are per origin, not per path. With today's code unchanged, Pickle It would read and write the live Vehicle Maintenance App's database, and the old app would break the first time Pickle It raised the database version.

| What | Old app (keep) | Pickle It (proposed) |
|---|---|---|
| IndexedDB name | `vehicle-maintenance-app` | `pickle-it` |
| localStorage prefix | `vma:` | `pickle:` |
| Service worker cache | `vehicle-maintenance-app-v1`, and sw.js deletes every cache starting `vehicle-maintenance-app-` | `pickle-it-v1`, and only delete caches starting `pickle-it-` |
| Export file name | `vehicle-maintenance-app-YYYY-MM-DD.csv` | `pickle-it-YYYY-MM-DD.csv` |

Pickle It should also **drop** `moveFromOldName()` (data.js) and the `fur:` key move (app.js). Both delete the old app's data after copying it, which is wrong when the old app is still live. Section 4 replaces them with a read-only copy.

Because Pickle It starts with a fresh database, its layout can be chosen now with no IndexedDB upgrade code. Old data only arrives through import (section 4).

### 2.2 Jars (categories)
Jars are a constant in code, not stored records:

```
JARS = [ { id: "vehicles", name: "Vehicles", icon: ... },
         { id: "home",     name: "Home",     icon: ... } ]
```

Adding Health, Finance or Pets later means adding an entry here. No migration. If users ever create their own jars, that's when jars become a store; not before. Jar order or visibility, if wanted, goes in `settings`.

### 2.3 Stores (IndexedDB `pickle-it`, version 1)

**things** (key `id`): what the user owns. Replaces the `vehicles` store.

| Field | Type | Notes |
|---|---|---|
| id | string | `newId("t")`. Imported vehicles keep their `v_...` id. |
| jar | `"vehicles"` \| `"home"` | Which tab it lives in. Vehicle-only behavior (odometer, fill-ups, MPG) is keyed on `jar === "vehicles"`. |
| name | string, 1-80 chars | "2019 Civic", "Home", "Cabin". |
| active | boolean | Inactive things are hidden from due boxes (same as today's inactive vehicles). |
| odometer, odometerDate | whole miles or null, YYYY-MM-DD or "" | Vehicles only: starting reading. Same rules as `makeVehicle`. |
| items | array of maintenance items (below) | Embedded, as today. Item ids are unique within one thing only (every vehicle has an `oil` item). |
| createdAt, updatedAt | ISO timestamp (UTC) | `updatedAt` is new. |

A Home jar starts with one thing named "Home" the first time it's opened. The model allows more (a cabin, a rental), but whether the UI offers that is a product decision.

**Maintenance item** (inside `thing.items`): one recurring task. Today's `{ id, name, every, remind }` becomes:

| Field | Type | Notes |
|---|---|---|
| id | string | Unique within the thing. Library items keep short ids (`oil`, `furnace`) so imports and the curator's library can match them. |
| name | string, 1-80 chars | |
| miles | `{ every, remind }` or null | Whole miles, `every` 1-999,999, `remind` 0-999,999. Vehicles only. Exactly today's `every`/`remind`. |
| time | `{ n, unit, from, firstDue, season }` or null | `n` whole 1-999; `unit` `"day"`, `"week"`, `"month"` or `"year"`; `from` `"done"` or `"calendar"` (section 3.2); `firstDue` YYYY-MM-DD; `season` optional display label (`"spring"`...), never used in math. |
| active | boolean | Paused items are hidden from due boxes. Default true. |

At least one of `miles` or `time` is required. Both set means whichever comes first. Home items have `time` only.

**logs** (key `id`): one completed or skipped task. Replaces the `services` store, same shape plus three fields.

| Field | Type | Notes |
|---|---|---|
| id | string | `newId("m")`, as today |
| thingId | string | Renamed from `vehicleId` |
| itemId | string | The item it completes, or `"other"` for a one-off job with no schedule (as today) |
| itemName | string | Name at the time, so history survives renaming or deleting the item |
| date | YYYY-MM-DD | When it was done or skipped |
| odometer | whole miles or null | Required for vehicles (as today), null for home |
| shop | string | Shop, contractor or "DIY". Same shop list in settings. |
| notes | string, up to 2,000 chars | |
| visit | string | Groups items done in one visit, as today |
| status | `"done"` \| `"skipped"` | New. Imported old records are `"done"`. |
| forDue | YYYY-MM-DD or "" | New. The due date this log closed, saved when it's logged. Needed for calendar schedules (3.2). "" for imports and one-off jobs. |
| createdAt, updatedAt | ISO timestamp (UTC) | |

**fillups** (key `id`): unchanged except `vehicleId` is renamed `thingId` and `updatedAt` is added.

**settings** (key `key`): `shops`, `lastExport`, `lastChange` as today, plus `hemisphere` (`"north"` default, or `"south"`; used only to suggest season dates) and `copiedFrom` (set after the one-time copy in 4.2 so it's never offered twice).

### 2.4 Why this shape
- Everything a later Health, Finance or Pets jar needs is already generic: a thing in a jar, items with a time schedule, logs. Only odometer, fill-ups and MPG are vehicle-specific, and they stay that way. Nothing is built for those jars now.
- Keeping items embedded in their thing, and keeping the existing record builders (`makeVehicle`, `makeItem`, `makeService`, `makeFillup`) with small additions, keeps the import/merge code in data.js nearly intact.
- The `vehicleId` to `thingId` rename is mechanical in data.js and app.js. CSV columns keep their old names (section 4.3).

### 2.5 Not included (name them so nobody assumes they are)
Costs on maintenance logs, kilometers, engine hours for small engines, photos or receipts, snooze, notifications, user-created jars, sharing between people. Each can be added later without reshaping the above.

---

## 3. Due dates and the Pantry boxes

### 3.1 Dates and time zones
- Every due date and log date is a **local calendar date** string, `YYYY-MM-DD`, exactly like today's `date` fields. Never a timestamp.
- "Today" (T) is the device's local date (`today()` in data.js).
- Days between two dates are counted on the calendar parts only: `(Date.UTC(y2,m2-1,d2) - Date.UTC(y1,m1-1,d1)) / 86400000`. This ignores daylight saving (23- and 25-hour days) and the device's time zone.
- Travel across time zones can move "today" by one day. That's accepted; nothing is stored differently.
- The boxes are recalculated when the app opens, when it comes back to the foreground (`visibilitychange`), and at local midnight if it's open.
- Only `createdAt`, `updatedAt`, `lastExport` and `lastChange` are UTC timestamps. They're never used for due dates.

### 3.2 Time-based schedules
`addUnits(date, n, unit)`:
- `day`: date + n days. `week`: date + 7n days.
- `month`: move n months; the day becomes `min(original day, days in the target month)`. Jan 31 + 1 month = Feb 28 (Feb 29 in a leap year).
- `year`: same as 12n months, so Feb 29 + 1 year = Feb 28.

Two kinds, chosen by `time.from`:

**From last done** (`from: "done"`, the default for "every N days/weeks/months/years"). The clock restarts when it's done.
- No log yet: due = `firstDue`. When adding an item, the UI asks "when was it last done?" (firstDue = that + interval) or "when is it next due?" (firstDue = that). If the user skips both: firstDue = today + interval.
- With logs: L = the latest log for that item (latest `date`, then latest `createdAt`). Due = `addUnits(L.date, n, unit)`.
- Done late or early shifts the schedule: change filter every 3 months, done 2 weeks late on Apr 15 → next due Jul 15.

**On the calendar** (`from: "calendar"`, for seasonal or fixed dates like "each spring" or "every 3 months on the 1st"). The schedule stays on fixed dates no matter when it's done.
- Occurrences are `occ(k) = addUnits(firstDue, k*n, unit)` for k = 0, 1, 2, ... Always computed from `firstDue`, never from the previous occurrence, so month-end doesn't drift: monthly from Jan 31 gives Jan 31, Feb 28, Mar 31, Apr 30.
- No log yet: due = `firstDue` (the UI defaults it to the next occurrence on or after today).
- With logs: due = the first occurrence strictly after `max(L.date, L.forDue)`.
  - Done early: AC tune-up due Apr 1, done Mar 18 (forDue Apr 1) → next due Apr 1 next year, not Apr 1 this year.
  - Done late: due Apr 1, done May 20 → next due Apr 1 next year.
  - Done very late (more than a full cycle): the first occurrence after the done date, so missed cycles don't pile up.

**Seasons.** "Each spring/summer/fall/winter" is a calendar yearly schedule (`n: 1, unit: "year", from: "calendar"`) with `firstDue` set to the next season start and `season` saved as a label. Placeholder starts (meteorological): north Mar 1, Jun 1, Sep 1, Dec 1; south shifted 6 months (Sep 1, Dec 1, Mar 1, Jun 1). The maintenance-content-curator and owner may pick better dates (e.g. AC tune-up in April). Changing the hemisphere setting doesn't move existing items. Location is never read to guess the hemisphere.

**Leap years.** Day and week intervals are unaffected. A yearly calendar item first due Feb 29, 2028 falls on Feb 28 in 2029-2031 and Feb 29 again in 2032. A yearly "from done" item done on Feb 29 is next due Feb 28, and stays on the 28th after that (it follows the done date).

### 3.3 Mileage-based schedules (vehicles)
Unchanged from data.js `maintStatus`:
- Current odometer = the highest reading among the vehicle's starting odometer, fill-ups and logs (`latestOdo`).
- With logs: due odometer = highest-odometer log for that item + `every`.
- No log: assume it was done at the last regular interval: `max(every, ceil(odo / every) * every)` (`scheduledDue`).
- left = due odometer - current odometer.

**Estimated date**, so mileage items can be placed in date boxes:
- Readings: the starting odometer, fill-ups and logs for that vehicle dated within the last 365 days.
- Need at least 2 readings at least 30 days apart with more miles on the later one; otherwise there's no estimate.
- Rate = (latest odometer - earliest odometer in the window) / days between them.
- Estimated due date = date of the latest reading + `ceil(left / rate)` days.
- The UI should mark these as estimates ("about Dec 12").

### 3.4 Whichever comes first
An item with both `miles` and `time` is due on the earlier of its time due date and its mileage estimate. One log resets both: the time part uses the latest log by date, the mileage part the highest-odometer log; for normal use that's the same log.

### 3.5 Skipped
"Skip this time" saves a log with `status: "skipped"`, today's date, the current odometer for vehicles, and `forDue` set to the due date it skips. The due-date math treats it exactly like a done log, so the next due is calculated the same way. History shows it as "Skipped", and "last done" ignores skipped logs. Deleting a log (done or skipped) makes the previous log count again, because nothing is stored on the item; due dates are always recalculated from logs.

### 3.6 Overdue
- Time: due date before today.
- Mileage: left < 0 (the logged odometer is past the due mileage). left = 0 is "due now", treated as due today.
- An estimated date that has passed is **due**, not overdue. Overdue needs a real reading, never an estimate.

### 3.7 The Pantry boxes
For each active item on each active thing, find its due date D (3.2-3.4) and `days = D - T`.

| Box | Rule |
|---|---|
| **This week** | Overdue, or `days` from 0 to 6 (today plus the next 6 days). |
| **This month (2-4 weeks)** | `days` from 7 to 27. |
| **Later** | `days` 28 or more, and mileage items with no estimate (below). |

Mileage items with no estimate (too few readings): left ≤ 0 → This week; left ≤ `remind` → This month; otherwise Later. A mileage item with an estimate but left ≤ `remind` is never placed in Later (at most This month), so the user's reminder setting is still honored.

**Order inside a box:** overdue first (most overdue first), then by D, then by miles left, then thing name, item name, id, using the plain `cmp` comparison from data.js so the order is the same on every device.

**50-item caps:** each box shows the first 50 items after sorting, then "and N more" linking to the jar. Overdue items aren't exempt. The header "N things need attention this week" counts every This week item, not just the 50 shown. The witty empty line shows when This week has 0 items, even if the other boxes have some.

**Jar red dot:** shown when that jar has at least one This week item.

**One-off jobs** (`itemId: "other"`) and inactive things or paused items never appear in the boxes.

### 3.8 Worked examples (for qa-accessibility-tester)
T = 2026-11-03.

| Item | Rule | Last log | Due | Box |
|---|---|---|---|---|
| Smoke alarm battery | every 1 year, from done | none, firstDue 2026-11-09 | 2026-11-09 (day 6) | This week |
| Gutters | each fall, calendar, firstDue 2025-09-01 | done 2025-10-20, forDue 2025-09-01 | 2026-09-01 (overdue) | This week |
| HVAC filter | every 3 months, from done | done 2026-08-10 | 2026-11-10 (day 7) | This month |
| Water softener salt | every 1 month, calendar, firstDue 2026-01-31 | done 2026-10-31, forDue 2026-10-31 | 2026-11-30 (day 27) | This month |
| Furnace tune-up | each fall, calendar, firstDue 2026-09-01 | done 2026-09-15, forDue 2026-09-01 | 2027-09-01 | Later |
| Oil change | every 5,000 mi, remind 1,000 | at 40,000; now 44,600 (read 2026-11-03); 30 mi/day | 45,000 mi, about 2026-11-17 (day 14) | This month |
| Oil change, too few readings | every 5,000 mi, remind 1,000 | at 40,000; now 44,600 | 45,000 mi, no estimate | This month (left 400 ≤ remind) |

Boundaries: day 6 (Nov 9) is the last day of This week, day 7 (Nov 10) the first of This month, day 27 (Nov 30) the last of This month, day 28 (Dec 1) the first of Later.

---

## 4. Migration from the Vehicle Maintenance App

### 4.1 CSV path (works everywhere)
1. In the old app: Settings → Export. It saves `vehicle-maintenance-app-YYYY-MM-DD.csv`.
2. In Pickle It: Import, choose the file, see the preview, choose Merge or Replace (same flow as today).

Pickle It's importer keeps everything the current `analyzeImport` accepts: header-based columns in any order, record_type aliases, Excel re-saves (M/D/YYYY, D/M/YYYY, D.M.YYYY, 14-Oct-26, serial numbers), semicolon and tab files, decimal commas, UTF-8/UTF-16/Windows-1252, the formula-guard `'`. Its error text needs rewording from "Vehicle Maintenance App backup" to mention both apps.

Mapping from a version 1 file:

| v1 row | Becomes |
|---|---|
| `vehicle` | thing, `jar: "vehicles"`, same id, name, active, starting odometer |
| `schedule` | item on that thing: `miles: { every, remind }`, `time: null`, same item id |
| `shop` | settings.shops |
| `fillup` | fillup, `vehicle_id` → `thingId` |
| `maintenance` | log, `status: "done"`, `forDue: ""` |
| (all) | `updatedAt` = `created_at`, or import time if blank |

Fill-Up Receipts, the app's earlier name: data.js moved its database (`fillup-receipts`) into `vehicle-maintenance-app` on open, so anyone who has opened the renamed app since has their data there. Someone who hasn't opens the old app once, then exports. I couldn't confirm whether Fill-Up Receipts CSV exports used the same columns; the importer's aliases (`fill-up`, `kind`, `type`) suggest it was tolerated. **Need a sample Fill-Up Receipts CSV from the owner** to test.

**Regression fixtures** (qa-accessibility-tester): keep real v1 exports in the repo as test files with no personal data: a fresh export, one re-saved by Excel (US), one semicolon/decimal-comma (European Excel), and one with formula-guarded text. Every Pickle It release must import all of them with identical results.

### 4.2 Same-origin copy (only if hosted on the same origin as the old app)
If Pickle It and the old app share an origin (same `github.io` account), Pickle It can read the old database directly:
- Offered once, only when Pickle It has no data and the old database exists: "Copy your vehicles from Vehicle Maintenance App?"
- Open `vehicle-maintenance-app` (or `fillup-receipts` if that one doesn't exist) **read-only and without a version number**, the way `openIfExists` does, so it's never created, upgraded or blocked.
- Run the records through the same mapping and builders as a CSV import, with the same preview.
- **Never delete or change the old database.** The old app stays live and in use.
- Save `settings.copiedFrom` so it isn't offered again.

On a different origin (custom domain, Cloudflare Pages) this isn't possible and the CSV path is the only path. Where Pickle It is hosted is release-manager's call with the owner.

### 4.3 Export format, version 2
Still one CSV, because users already have it, it opens in Excel, and the importer already handles Excel's quirks.

- **Version marker:** the first data row is `record_type = meta` with `format_version = 2` and `created_at` = export time. A file without a meta row is version 1 (every Vehicle Maintenance App export).
- **Columns:** the 20 version 1 columns, same names, same order, same meaning, then new columns appended: `thing`, `thing_id`, `jar`, `every_n`, `every_unit`, `time_from`, `first_due`, `season`, `item_active`, `status`, `for_due`, `updated_at`, `format_version`.
- **Rows:**
  - Vehicles stay `vehicle`, `schedule`, `fillup`, `maintenance` rows with `vehicle`/`vehicle_id`, as in version 1.
  - Other things are `thing` rows (`thing`, `thing_id`, `jar`, `active`, `created_at`, `updated_at`).
  - Their items are `schedule` rows and their logs `maintenance` rows that use `thing`/`thing_id` instead of `vehicle`/`vehicle_id`, with blank mileage and odometer.
  - Time rules go in `every_n`, `every_unit`, `time_from`, `first_due`, `season`. Whichever-first items fill both these and `every_mi`/`remind_mi`.
- **Reading files:** no meta row → version 1 rules. Version 2 → as above. Higher than the app knows → stop with "This backup was made by a newer version of Pickle It. Update the app, then import again." Unknown columns are ignored.
- **Rules for future changes:** bump `format_version`, only append columns or record types, never rename or repurpose a column, and keep reading every older version.
- **Bonus:** because vehicle rows keep the version 1 layout, the old app can still import the vehicle part of a Pickle It backup. It lists the `meta` and `thing` rows and home items as rows it can't use, and treats skipped logs as done. That's not a requirement, just a side effect.
- **Text safety:** the new text columns (`thing`, `season`) join `CSV_TEXT` so the formula guard covers them.
- Merge duplicates: a log is a duplicate on the same id or the same thing, date, odometer, item, name, notes (today's `serviceKey`), with `status` added to the key.

---

## 5. Personal data: for privacy-security-reviewer

1. **Shared origin with the old app.** If both are on the same `github.io` account, each app can read the other's IndexedDB and localStorage, and a script-injection bug in either one exposes both. The renames in 2.1 prevent accidental mixing, not deliberate access.
2. **What the data reveals.** Fill-up dates and station names show where someone was and when. Home items and their dates show what someone owns and possibly when they're away. Notes are free text and can hold anything (VINs, addresses, gate codes).
3. **Backups are plain text.** The CSV lands in Downloads and often gets shared or put in cloud drives, unencrypted. Should the export screen say so?
4. **Import is a trust boundary.** Files can come from anyone. Every row goes through the record builders with length and range limits, which stays. There's no file-size limit today; suggest one (e.g. 20 MB) so a huge file can't freeze the app.
5. **Data loss.** iPhone Safari can delete storage for sites not installed to the home screen. Check the install prompt and backup reminder copy cover this.
6. **If Option B (cloud) is chosen,** everything in section 1's privacy row applies and needs its own review before any build.
7. **Hemisphere setting** is chosen by the user; location permission is never requested.
8. **Test fixtures** in 4.1 must contain made-up data only. This repo may become public.

---

## Decisions needed (owner)

1. **Storage:** local-only (A), accounts with cloud sync (B), or local-only now with user-drive sync later (C). Recommend **A**.
2. **This month boundary:** days 7-27 (weeks 2-4, so This week plus This month is exactly 4 weeks) or 7-30 (a calendar-ish month). Recommend **7-27**, matching "2-4 weeks" in the brief.
3. **This week:** rolling (today plus 6 days) or the calendar week (Sunday or Monday start, varies by country). Recommend **rolling**: no week-start setting, and an item never jumps boxes just because it's Monday.
4. **Mileage items in date boxes:** use the estimated date from driving history (3.3) or only the miles-left reminder. Recommend **estimated date**, labeled "about".
5. **Same-origin direct copy (4.2):** offer it if Pickle It ends up on the same origin as the old app? Recommend **yes**, read-only. Depends on the hosting decision.
6. **Season dates:** meteorological starts (Mar 1 etc.) or curated per task. Recommend letting **maintenance-content-curator** propose per-task dates, with meteorological as the fallback.
