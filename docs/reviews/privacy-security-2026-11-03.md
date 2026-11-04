# Privacy and security review: Phase 1 drafts and current code

Reviewer: privacy-security-reviewer, 2026-11-03. **Revised 2026-11-03 (second pass)** against the current branch and the revised drafts. The first pass reviewed an older commit (8344403) with the Vehicle Maintenance App's storage names and assumed Health and Finance were out of v1. What changed in this pass:
- B1 (shared storage names) is **closed**: verified fixed in code. The remaining shared-origin risk is now M1.
- Storage is **decided** (local-only, with a path to cloud later), so the storage comparison is gone and "Needs a decision" no longer asks about it. Section 4 covers what changes if cloud comes later.
- The DM Sans finding (old M3) is **moot**: the look follows app.css, which loads no web font.
- New section 2 on **Health and Finance** (now v1 jars) and the new **hours-of-use readings**.
- "Delete all my data" moved up from Minor to Major because the app will now hold health and money reminders.
- The privacy policy and terms outline (section 5) is updated for all of the above.

Status: review of **unapproved drafts** (docs/specs/v1-scope.md, docs/specs/data-model.md, both revised 2026-11-03). Only the owner decides.

Read: CLAUDE.md, docs/decisions.md (source of truth), docs/brief.md, docs/open-questions.md, docs/specs/v1-scope.md, docs/specs/data-model.md, docs/release/distribution.md, and (read-only) index.html, app.js, data.js, app.css, sw.js, manifest.webmanifest, and the tracked file list. Code reviewed: branch `claude/subagents-project-8ff5a6`, commit f72d868.

This is not legal advice. Items marked **Lawyer** need a qualified lawyer's review before launch.

---

## 1. What personal data the app handles

Storage is decided: **local-only** in the user's browser (IndexedDB `pickle-it`, localStorage `pickle-it:` keys, an offline cache), no accounts, no server. The owner never receives user data. The host (GitHub or Cloudflare) sees normal request logs: IP address, browser, time, page requested.

| Data | Jar | Why it's sensitive |
|---|---|---|
| Thing names: vehicles ("2019 Civic", sometimes a plate or VIN), homes ("Lake cabin"), **people** ("Me", "Sam", "Dad"), households or accounts ("Rental", "Chase card") | All | People's names are personal data about family members who never used the app. Account names hint at banks and lenders. |
| Fill-ups: date, odometer, gallons, price, **station name** | Vehicles | Date + station = where someone was and when; repeated stations reveal routines and home/work area |
| Task names and due dates | All | Home: what someone owns and when they're away ("Winterize cabin"). **Health: conditions and treatments** ("Insulin refill", "Oncology follow-up", "Therapy"). **Finance: debts and income patterns** ("Payday loan due", "Quarterly estimated tax" implies self-employment). |
| Done logs: date, odometer or hours, **shop/provider**, **free-text notes** (up to 2,000 chars), done or skipped | All | Provider names in Health (a fertility clinic, a psychiatrist) are health data on their own. Notes can hold anything: VINs, gate codes, results, account numbers. Skipped logs show missed medical care or missed payments. |
| **Hour-meter readings** (new `readings` store): thing, date, hours | Home, any | Low on their own. A generator's readings with dates hint at power outages and when someone was home; boat or outboard hours show leisure patterns. |
| Shops list (`settings.shops`) | Shared by all jars | See finding M5: one list, so health providers show up as suggestions in the vehicle form |
| Settings: last export, change count, hemisphere, onboarding done, jar visibility; theme, palette, box collapse state | App | Low. Hidden jars (D8) reveal nothing; they keep their data. |

The app does **not** collect: the user's own name, email, phone, precise location, contacts, photos, device IDs, analytics or ad identifiers. Keep it that way. Hemisphere stays user-chosen (data-model 3.2, 5.8); never request the location permission. Screen names are the only thing in the URL hash (app.js:98); keep thing and task names out of the URL and `document.title`, since browser history syncs to the user's Google or Apple account.

---

## 2. Health and Finance: privacy stakes by scope option

Local-only storage means none of this reaches the owner. The stakes are on the device and in the backup file: someone glancing at the phone, a shared or lost phone, a CSV emailed or left in a cloud drive, and a script-injection bug. They rise sharply if cloud sync comes later (section 4).

### 2.1 Health (v1-scope D1)
| Option | What could be exposed | Privacy view |
|---|---|---|
| **A. Appointments and renewals, no medical fields** | Task names, people, provider names, dates, notes. Reveals some conditions by name ("Insulin refill"), but only what the user chooses to type. | **Acceptable for v1** with the fixes below. Recommend A. |
| B. A plus medication schedules | Medication names, doses, times, adherence (taken/missed). Clearly health data, daily, and detailed. | Not for v1. It also needs notifications, which on a PWA means a push service (a third party that sees timing and payload unless encrypted). Would need a new review. |
| C. A plus records | Results, diagnoses, providers, documents. | Avoid. Turns a reminder app into a health-records app; much heavier legal picture even locally once cloud sync exists. |

### 2.2 Finance (v1-scope D2)
| Option | What could be exposed | Privacy view |
|---|---|---|
| **A. Money deadlines, no amounts** | Insurer, lender, tax and subscription names and dates. Reveals some financial situation (debts, self-employment, which bank). | **Acceptable for v1** with the fixes below. Recommend A. |
| B. A plus amounts | Spending and income patterns, bill sizes. | Fine locally and a reasonable v1.1, but it makes the CSV more sensitive and the export warning more important. Review again before build. |
| C. Bills and budgeting | Payees, balances, budgets, and it invites account numbers. | Avoid. Account numbers and balances are fraud material in a plain-text backup. |

### 2.3 Fields to never add (any option)
Diagnosis, condition, medication, dose, test results, insurance member or policy ID, provider phone or address, date of birth, age, sex, account number, routing number, card number, SSN or tax ID, password, PIN, security answers, balances. Also no "relationship" field on people (Health things): a first name or "Me" is enough. If a starter library ever wants age-based screenings ("colonoscopy at 45"), suggest the task without asking for a birth date.

v1-scope 4.6 AC 5 already says no such fields; keep it as a hard rule in the spec and in the data-model's record builders (no field, not just no input).

### 2.4 Notes and name hints
A hint helps but isn't enough alone. Recommend all three, all cheap and local:
1. **Per-jar placeholder text** on the notes field, visible before typing:
   - Health: "e.g. Ask about switching to 90-day refills. Skip results and ID numbers."
   - Finance: "e.g. Renewal notice comes by mail. Don't store account numbers or passwords."
   - Vehicles and Home keep maintenance examples ("e.g. Replaced front brake pads").
2. **A soft warning, not a block**, when Finance or Health notes or names contain a run of 9 or more digits or look like a card number (13-19 digits passing a Luhn check): "This looks like an account or ID number. Pickle It backups aren't encrypted. Save anyway?" Runs on the device only. Store nothing about the check.
3. **Help copy** (release-manager): suggest discreet task names for sensitive things ("Dr. visit" instead of the condition).

### 2.5 What the Pantry shows at a glance
There are no notifications in v1, so nothing reaches the lock screen. The exposure is someone looking at the open app, or the phone's app switcher (iOS and Android show a snapshot of the last screen; a web app can't blur it).
- v1-scope 4.6 AC 6 is right: the row shows only task name, thing name and due text. Keep notes, provider and history off the Pantry.
- Keep jar visibility (D8): a user can hide Health or Finance entirely. That's the simplest "discreet" control, so recommend approving D8 for privacy as well as clutter.
- Optional (owner decision 3 below): a per-jar "Show in Pantry as 'Health task'" setting that hides task and thing names on the Pantry for that jar. Cuttable to v1.1.
- If notifications are ever added (Health option B, or the native wrappers in distribution.md), they must default to generic text ("1 thing is due") and need a new review.

### 2.6 Export and backup
The CSV will now carry health and money reminders, in plain text, and on phones it opens the share sheet (app.js:917-923), so it gets emailed, AirDropped or saved to cloud drives.
- **Export warning (required):** one plain line by the Export button: "This file isn't encrypted. It includes everything you've saved, including Health and Finance tasks and notes. Keep it somewhere private." Show it every time, not once.
- The file name `pickle-it-YYYY-MM-DD.csv` reveals nothing. Keep jar names out of it.
- Optional (owner decision 4 below): "Include Health and Finance" checkbox on export, default on (a backup that silently leaves data out is a data-loss risk). Cuttable.
- Still no password-protected backup in v1: a forgotten password loses everything, and it breaks opening the file in Excel. Revisit if Finance amounts or cloud sync arrive.

### 2.7 Third parties in the data
People in the Health jar are often family members. They didn't agree to be in the app, but the data stays on the user's device and the owner never sees it. The privacy policy should say users may enter information about others and are responsible for it. **Lawyer** to confirm wording.

---

## 3. Findings, ranked

Severity: **Blocker** = must fix before public launch. **Major** = should fix before launch. **Minor** = fix when convenient.

### Blockers
None open.

**B1. Same-origin storage names. CLOSED (verified 2026-11-03).** The code now uses its own names everywhere: IndexedDB `pickle-it` (data.js:96), localStorage `pickle-it:` keys (app.js:20-21, and the inline theme script in index.html:22), BroadcastChannel `pickle-it` (app.js:46), cache `pickle-it-v1` with activate cleanup limited to `pickle-it-` caches (sw.js:7, 21-26). `moveFromOldName()` and the `fur:`/`vma:` key moves are gone; no code mentions `vehicle-maintenance-app`, `vma:`, `fur:` or `fillup-receipts` (data-model 2.1 agrees). The two apps can no longer overwrite or delete each other's data by accident. What's left is the shared origin itself: M1.

### Major

**M1. Host on Pickle It's own origin.** (Was the "stronger fix" under B1.) On a shared `USER.github.io` origin, storage names keep the data apart, but:
- a script-injection bug in either app can read the other's whole database, now including Health and Finance;
- "Clear site data" for one app wipes both, and they share one storage quota and Safari's eviction (distribution.md section 2);
- a service worker or CSP mistake in the old app affects Pickle It.
- **Fix:** launch on its own origin: a custom domain, or Cloudflare `pages.dev` for $0, as release-manager recommends (distribution.md). Users already migrate by CSV (decided), so nothing is lost. Owner decision 2 below. Choose before the first public user: changing origin later strands everyone's data.

**M2. No Content-Security-Policy.** Still none in index.html. The code is clean (M3), but a CSP is cheap insurance against a future `innerHTML` slip or injected script, and it enforces the policy's "no third-party requests" promise. More valuable now that the app holds health and money reminders.
- **Fix:** add a `<meta http-equiv="Content-Security-Policy">` roughly: `default-src 'self'; script-src 'self' 'sha256-<hash of the inline theme script>'; style-src 'self'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'`. The inline theme script (index.html:19-26) needs its hash, or move it to a file. `frame-ancestors` only works as a response header (Cloudflare Pages `_headers`; GitHub Pages can't set headers). frontend-engineer tests the share sheet, file picker, blob download and service worker with it on.

**M3. Keep "no innerHTML with user text" through the rebuild.** Current state is good: user strings go through `textContent` (the `el()` helper, `setMsg`) or `.value`; the only `innerHTML` (app.js:643) is a fixed SVG checkmark; no `eval`, `new Function`, `document.write` or `insertAdjacentHTML`. The Pantry, four jars, onboarding and Settings are all new UI, which is where injection bugs appear.
- **Fix:** write the rule into the frontend-engineer brief: build DOM with `el()`/`textContent`; `innerHTML` only for fixed strings in code; never for thing, task, provider, shop, note, station or imported text. qa-accessibility-tester adds an import fixture with names like `<img src=x onerror=alert(1)>` and `"><script>` in every jar (including Health people and Finance households) and checks they show as plain text on the Pantry, due boxes, jar screens, dialogs, `<datalist>`, red-dot accessible names and the chart tooltip.

**M4. Backups are plain text and travel.** Unchanged in substance, higher in stakes: see 2.6 for the warning copy. Required before launch.

**M5. One shop list for every jar leaks providers across jars.** data-model 2.3 keeps one `settings.shops` list for logs in every jar ("Shop, contractor, provider or 'DIY'. Same shop list in settings."). A psychiatrist or clinic added in Health would then be suggested in the Vehicles maintenance form's dropdown, which is exactly where someone else might be looking over a shoulder at the mechanic's.
- **Fix:** keep shop suggestions per jar (store the jar with each shop, or a list per jar), or don't offer suggestions in Health and Finance at all. data-architect's call; small change if made before build.

**M6. "Delete all data on this device".** (Was m4, raised.) There's still no way to wipe everything except deleting things one by one or clearing browser site data, which most people can't find, and which differs between Safari tabs and the home-screen app on iOS. With health and money reminders on the device, users need a clear, complete delete (selling or lending a phone, a family member leaving).
- **Fix:** add it to Settings behind a confirmation that offers export first. It should clear IndexedDB stores (including `readings`), `pickle-it:` localStorage keys and the `pickle-it-` caches. It lets the privacy policy give a true, simple answer to "how do I delete my data".

### Minor

**m1. Import size limit. Resolved in the docs.** app.js:946 rejects files over 20 MB before reading; data-model 5.5 now says so. Keep it in the rebuilt importer. Optional: cap rows (say 100,000) with a clear message.

**m2. Import is otherwise well defended; extend it to the new data.** Rows go through `makeVehicle`/`makeItem`/`makeFillup`/`makeService` with length caps (`cleanText`, `cleanNotes`) and range checks; binary files are rejected (data.js:376); nothing is executed or put into HTML; preview, then Merge or Replace. For version 2 (data-model 4.3):
- `jar` against an allow-list of exactly `vehicles`, `home`, `health`, `finance`; `every_unit`, `time_from`, `status` against their own allow-lists. An unknown value rejects the row, not the file.
- `hours`, `every_hr`, `remind_hr` and `reading` rows: finite numbers within 0-99,999.9, one decimal, decimal comma handled, no `NaN`/`Infinity`/negatives. A reading lower than the last one is kept (meter replaced) but shouldn't crash the "highest reading" math.
- `thing` names capped at 80 chars like vehicle names; `first_due`, `for_due` through the same date parser as `date`.
- Import must never create fields 2.3 says not to have: unknown columns stay ignored, as today.

**m3. CSV formula guard misses the id columns.** Still open. The guard (data.js:245-251) covers `vehicle`, `station`, `shop`, `item`, `notes`. Ids (`id`, `vehicle_id`, `item_id`, `visit`, and in version 2 `thing_id`) come from imported files and are exported unguarded, so a crafted file could carry `=HYPERLINK(...)` that runs when the user's next export is opened in Excel. Low likelihood, low-medium impact.
- **Fix:** validate imported ids to a safe pattern (e.g. `^[A-Za-z0-9_~-]{1,60}$`, else generate a new id). Add the new text columns `thing` and `season` to `CSV_TEXT` as data-model 4.3 plans. Enum columns are safe once allow-listed (m2).

**m4. iOS Safari data eviction.** The iOS nudges (index.html:44-46, 188), the storage card, the persistent-storage request (`askPersist`, data.js:151-153) and the backup reminder all say it plainly. Carry them into the rebuild, count changes in all four jars (v1-scope 4.9 AC 6), and say in the policy and help that the owner can't recover lost data.

**m5. Hosting logs.** GitHub Pages and Cloudflare Pages log IP addresses and browsers. Name the host in the policy and link its privacy statement. No Cloudflare Web Analytics or any analytics without a new review.

**m6. Secrets and personal data in the repo: none found.** Tracked files contain no API keys, tokens, passwords or private keys; `.gitignore` excludes `.env*`; there are no fixtures yet. The regression CSV fixtures (data-model 4.1) must be made-up data, and the Health and Finance fixtures especially: no real names, providers or conditions.

**m7. No web fonts or third-party requests.** (Replaces the old DM Sans finding, now moot.) app.css uses system font stacks only (app.css:22-24): no `@font-face`, no `@import`, no external URLs in any file, and sw.js ignores other origins. Keep it that way: if a web font is ever added, self-host it and add it to `FILES` in sw.js; never Google Fonts (it sends each visitor's IP to Google, which a Munich court found unlawful without consent in 2022).

**m8. Framing (clickjacking).** No `frame-ancestors`. Low impact (a framed "Delete" or "Replace" tap in theory). Covered by M2 on Cloudflare Pages via `_headers`; accept on GitHub Pages.

**m9. Service worker scope is correct.** sw.js handles only same-origin GETs under its own path (sw.js:29-35) and deletes only `pickle-it-` caches. Keep both in the rebuild.

**m10. Hours readings.** Low sensitivity, no new trust issue beyond m2. Include `readings` in export, Replace, delete-a-thing (deleting a thing must delete its readings, or they linger as orphans in the backup) and delete-all (M6).

---

## 4. If cloud sync comes later

The owner decided local-only now with a path to cloud. data-model section 1 keeps that path open (random ids, `updatedAt`, no stored due dates). That's the right shape. When cloud is scheduled, it needs its own spec and privacy review before any build; this is what changes, so the owner can weigh it early.

**Generally (any cloud option):** the owner becomes the holder of everyone's data. GDPR/UK GDPR controller duties for EU/UK users (lawful basis, access/deletion requests, records of processing, a processing agreement with the provider, transfer terms, 72-hour breach notice), US state breach-notification laws, in-app account deletion for the app stores, and real security operations (one bad access rule on Supabase or Firebase exposes every user at once). **Lawyer.**

**Health data specifically raises the bar:**
- **GDPR/UK GDPR Article 9:** health data is "special category". Holding it in the cloud needs explicit consent (or another Article 9 condition) and very likely a data protection impact assessment. **Lawyer.**
- **US:** HIPAA almost certainly doesn't apply (the owner isn't a healthcare provider, plan or their contractor), but other rules do. The **FTC Health Breach Notification Rule** (updated 2024) covers consumer health apps outside HIPAA and treats unauthorized disclosure, not just hacking, as a breach. **Washington's My Health My Data Act** (and similar laws in Nevada and Connecticut) covers "consumer health data" broadly, has no revenue threshold, requires separate consent to collect and share it plus a dedicated health-data privacy policy, and Washington's has a private right of action. A reminder like "Therapy every Tuesday" plausibly counts. **Lawyer**, before any cloud build.
- **App stores:** Apple's privacy label and Google Play's data safety form would list health and financial info; Google Play also has a health apps declaration (verify current requirements at the time).

**Finance data:** reminders without amounts or account numbers are lower risk. US financial-privacy law (GLBA) targets financial institutions and likely doesn't reach a reminder app, but amounts or account details would change that analysis. **Lawyer.**

**Design options that shrink the obligations** (for the future cloud spec):
1. **End-to-end encryption** with a key only the user holds, so the owner's server stores data it can't read. Strongest option; costs: lost key = lost data, harder to build.
2. **Sync only Vehicles and Home**; Health and Finance stay on the device. Simple and honest.
3. **User's own drive** (Google Drive `drive.file` or `appDataFolder` scope, or iCloud): the owner holds no records, but takes on OAuth app verification and Google's user-data policy.
4. Tombstones for deletes (data-model section 1) must also purge server copies and backups on account deletion.

Recommendation for then: 1 or 2. Don't put Health in a readable server database.

---

## 5. Privacy policy and terms: outline for v1 (local-only)

Plain language, short, true to how the app works. Host it at a permanent URL on the app's own origin (needed for the Settings "About" link, v1-scope 4.10, and for any later store listing). Date it and keep old versions.

### Privacy policy must say
1. **Who we are and how to reach us.** Owner's name or trading name and a dedicated contact email. **Lawyer:** whether a postal address is needed for EU/UK users.
2. **The short version.** Pickle It saves what you enter only on your device. No accounts; we never receive your data and can't see it.
3. **What the app saves on your device.** Things you track (vehicles, homes, people, households), fill-ups including gas station names and dates, tasks and their due dates, done and skipped history, hour-meter readings, providers and shops, notes, and app settings. Say plainly that **the Health and Finance jars can hold health and financial information if you type it in**, and that the app never asks for diagnoses, medications, account numbers or passwords. Uses browser storage (IndexedDB, localStorage) and an offline cache, only so the app works; not for tracking.
4. **Information about other people.** You may add family members in Health. Their information stays on your device like yours. **Lawyer:** wording.
5. **What we don't collect.** No analytics, ads, trackers, third-party scripts or web fonts, location permission, contacts. (True today; M2's CSP keeps it true.)
6. **Hosting.** Served by [GitHub Pages or Cloudflare Pages], which receives your IP address and browser details when you load the app, under its own privacy policy (link).
7. **Backups.** Export creates an unencrypted file with everything you've saved, including Health and Finance tasks and notes. Where you put it (email, cloud drive, AirDrop) is your choice and that service's terms apply. Imported files are read on your device only.
8. **Your control.** How to export, delete one record, hide a jar, and delete everything (M6); uninstalling or clearing site data also deletes it. Because we hold no data, we can't access, correct, export or delete it for you. **Lawyer:** how to phrase GDPR/UK GDPR and US state-law rights (including Washington's My Health My Data Act) when the owner holds nothing.
9. **Data loss.** We can't recover lost data. Browsers, especially Safari on iPhone, may delete it. Keep backups.
10. **Not a medical or financial service.** Pickle It doesn't give medical or financial advice and isn't a health record. (Also in terms.)
11. **Children.** Not directed at children under 13 (16 in some EU countries). **Lawyer:** age wording.
12. **Changes.** How changes are announced (a note in the app) and the effective date. Any future cloud feature will come with an updated policy and, for Health data, a separate opt-in before anything leaves the device.
13. **Store disclosures, if store apps happen later:** Google Play data safety and Apple privacy label both "no data collected", consistent with this policy, as long as storage stays local.

### Terms of use should say
**Lawyer** to review all of it, especially 4-6, which depend on jurisdiction.
1. Free, provided as is, may change or stop.
2. **Reminders are general guidance, not professional advice.** Vehicles and Home: follow the manufacturer's schedule and use qualified professionals for safety-critical work (brakes, gas furnaces, electrical). **Health: not medical advice; follow your doctor or pharmacist; don't rely on the app for medication timing.** **Finance: not tax, legal or financial advice; check real deadlines with the agency, insurer or lender.** Starter libraries are generic (v1-scope 4.8 AC 4).
3. **No guarantee a reminder appears.** The app shows due tasks only when opened; there are no notifications. A missed reminder (a tax deadline, a prescription refill) is the user's responsibility.
4. **Data is the user's responsibility.** The owner doesn't store it and isn't liable for loss; keep backups.
5. Limitation of liability and warranty disclaimer. Consumer-protection laws (EU, UK, Australia, some US states) limit how far these go.
6. Governing law.
7. Acceptable use: one line; it's a single-user offline app.
8. Open-source license of the code, if the repo goes public (separate from the terms; pick deliberately).

---

## Needs a decision (owner)
1. **Health and Finance scope (v1-scope D1, D2):** from a privacy view, recommend **A and A** (reminders only, no medical fields, no amounts). B for Finance (amounts) is fine as v1.1 after a short review; Health B and C, and Finance C, should stay out.
2. **Launch origin:** own origin (custom domain or Cloudflare `pages.dev`) or the shared `github.io` origin? Recommend **own origin** (M1). Storage names already keep the data apart; a separate origin also isolates bugs and site-data clearing. Already in docs/open-questions.md.
3. **Discreet Pantry rows for Health and Finance:** (A) rely on hiding jars (D8) and discreet task names, (B) add a per-jar "hide names on the Pantry" setting in v1, (C) B in v1.1. Recommend **A for v1, C later**, provided D8 is approved.
4. **Export choice:** (A) one full backup with the warning, (B) add an "Include Health and Finance" checkbox. Recommend **A** for v1; B only if users ask.
5. **Lawyer review:** one engagement before launch covering the privacy policy, terms and the name/trademark question (open-questions.md). Recommend **yes**; tell the lawyer about the Health jar specifically, since state health-data laws are the newest and least settled area.

---

## 2026-11-03: Phase 2 check

Reviewer: privacy-security-reviewer. Scope: designs before build. Read: CLAUDE.md, docs/decisions.md, docs/specs/data-model.md 2.1, 2.3, 4.2, 4.4, 5, 6; docs/specs/v1-scope.md 4.9-4.11; docs/design/settings-option-c.html (CD1-CD4); and, read-only, data.js, app.js, sw.js, plus the Vehicle Maintenance App's data.js and sw.js as imported in commit e1b58e8. I did not see the old app's live deployed code; if it changed after e1b58e8, recheck the points marked *(old app)*.

Context: the owner chose the shared github.io origin (decisions.md, Phase 1), which overrides M1 above. M1 is accepted, not fixed: a script bug in either app still exposes both until the old app's data is gone from users' browsers. The findings below assume that origin.

### Verdicts in short
- **Read-only copy (data-model 4.2, option B):** acceptable from a privacy view, user-started and previewed, provided P2-M1 is fixed. As written, one path can create the old app's database.
- **Delete all data (data-model 6, v1-scope 4.10 AC 12, mockups CD1-CD4):** the scope (`pickle-it` / `pickle-it:` / `pickle-it-` only) is right and the two-step confirm plus "Export a backup first" meets the bar. Two gaps: old-app data stays behind and is re-offered (P2-M2), and clearing stores leaves a write-back race (P2-M3).
- **Import checks (data-model 4.4):** close m2 and m3. Small gaps in P2-m5 and P2-m6.
- **Old app's final notice:** list at the end of this section.

### Blockers
None.

### Major

**P2-M1. The copy's fallback check can create the old app's database.** data-model 4.2 step 1 falls back to `indexedDB.open("vehicle-maintenance-app")` with no version and aborts in `onupgradeneeded` if the database didn't exist. Opening a name that doesn't exist creates it. Whether aborting the upgrade then removes it is up to the browser, and Safari's IndexedDB has had bugs here. If an empty `vehicle-maintenance-app` at version 1 with no stores is left behind, the old app breaks in that browser *(old app)*: its `open(DB_NAME, 1)` (e1b58e8 data.js:105) finds version 1 already there, skips `onupgradeneeded`, so its stores are never created and every read fails. That breaks v1-scope 4.11 AC 5 ("never changes or deletes the old app's data").
- **Fix:** detect with `indexedDB.databases()` only. Every browser Pickle It targets has it (Chrome/Android 71+, Safari 14+, Firefox 126+). If it's missing, don't offer the copy; CSV covers those users. Then open by name with no version only after the name is listed, so no upgrade can fire. This removes code as well.

**P2-M2. Delete all data leaves the old app's copy of the same vehicle data, and the copy offer comes back.** Delete all clears `settings.vmaCopiedAt` (rightly), then shows first run. If `vehicle-maintenance-app` still exists in the browser, first run offers "Found Vehicle Maintenance App data. Copy it?" So someone who deletes to hand on or sell a phone leaves their vehicles, fill-up places and service history readable, and the next person is invited to load them. Once the old site is gone, no button anywhere deletes that data except clearing site data in browser settings, which most people can't find.
- **Fix (owner decision P2-1 below):** in delete step 1 (CD2), when `indexedDB.databases()` lists `vehicle-maintenance-app`, say so and show an unticked checkbox: "Also delete Vehicle Maintenance App data saved in this browser." Ticked, it runs `indexedDB.deleteDatabase("vehicle-maintenance-app")` and removes `vma:` keys only. It's the user's explicit choice, so it's not the automatic deletion that was removed on 2026-11-03, but v1-scope 4.11 AC 5 and data-model 6 "Never touched" must be reworded to allow it. Without the box (option A), the dialog must at least say the old data stays and how to remove it, and the old app's final update must have its own delete (see the notice list).

**P2-M3. Clear the database with `deleteDatabase("pickle-it")`, not store by store.** data-model 6 step 1 clears five named stores in one transaction to avoid a "blocked" state. Three problems:
1. Write-back race (v1-scope 4.10 AC 12f): another tab that's mid-save, or that saves before it handles the BroadcastChannel message, writes into the cleared stores. The result is an orphan fill-up or log, or `lastChange`, that survives "delete all".
2. The store list has to be kept up to date by hand. A store added later and missed here keeps its data quietly.
3. Cleared records can remain in the browser's database files until compaction. Deleting the database removes the files, which matters when a phone is handed on.

Today's code already makes every connection close itself on `versionchange` (data.js:117), so `deleteDatabase` won't stay blocked by Pickle It's own tabs. Their `idb` is closed, so a late save fails instead of writing back.
- **Fix:** `indexedDB.deleteDatabase("pickle-it")`. Treat `onblocked` as "Close other Pickle It tabs to finish" and wait for success. Claim success only on `onsuccess`, then clear the `pickle-it:` keys, post `"wiped"` on the channel (other tabs `location.reload()` rather than `reload()`, so open dialogs are dropped), and reload. The schema comes back on the next `openDB()`. The exact name means it can't touch the old app's database. Keep v1-scope AC 12g: on error, say it failed and allow a retry.

### Minor

**P2-m1. Don't delete the caches.** data-model 6 step 3 deletes `pickle-it-` caches when online. I checked sw.js: it caches only same-origin GETs inside its scope, keyed by path with the query dropped, and the app never fetches user data (exports are blobs, which skip the service worker). The caches hold app files and nothing personal. Deleting them gains no privacy, and if the network is flaky (`navigator.onLine` is unreliable) the app can't reopen offline, which breaks v1-scope 4.10 AC 12e. The service worker registration holds no data either. **Fix:** drop step 3 and leave the registration. Say in the doc that caches and the registration hold no user data.

**P2-m2. The delete copy in the mockups doesn't list everything.** CD1's hint and CD2's list name assets, tasks, fill-ups and history but leave out hour readings, shops/providers and settings (theme, palette, hidden jars), which v1-scope 12a lists. CD2's title is "Delete all data?"; the spec's "Delete all Pickle It data?" is better on a shared origin, because the old app's data isn't included unless P2-M2's box is ticked. CD2 also leaves out "can't be recovered by anyone". **Fix:** use the spec's title and list, and add a line about readings, shops and settings.

**P2-m3. Smaller points in the delete flow.**
- "Export a backup first" runs Export, so show the 4.9 AC 7 "isn't encrypted" line there too.
- CD2's "Your last backup was 3 weeks ago" comes from `lastExport`, which is saved when export starts (app.js:914). On iOS the user can cancel the share sheet, so say "Last export started 3 weeks ago" or "Last export", not "backup".
- After deleting, the success message (or CD4) should say: "Backups you exported are still in your files. Delete them there if you need to."
- Collect `pickle-it:` keys into an array before removing them; removing while looping over `localStorage` by index skips keys.

**P2-m4. Read as little as possible from the old database, and let go of it fast.**
- Read `vehicles`, `fillups`, `services` and only `settings.get("shops")`, not `getAll` on `settings` (no need for `lastExport`, `lastChange` or anything else).
- Set `onversionchange = () => db.close()` and close straight after the read, so Pickle It never blocks the old app's final update if that update bumps its version. *(old app)* Better still, the final update shouldn't change the old app's storage at all.
- Make Merge the default in the copy preview. Replace there deletes Pickle It data the user may already have entered.
- Treat the old database as untrusted input, like a file. data-model 4.2 step 3 already does: every record goes through the builders and the 4.4 checks. Keep that in the build; don't bypass it with direct `put`s.

**P2-m5. The id pattern allows a leading `-`.** `^[A-Za-z0-9_~-]{1,60}$` blocks formula payloads (no `=`, `+`, `@`, `(`, `|`, `!`), but an id like `-A1` can still be read as a formula by Excel and come back changed after a re-save. **Fix:** `^[A-Za-z0-9_~][A-Za-z0-9_~-]{0,59}$`. Ids from `newId()`, library ids and the importer's `~` visit placeholders (data.js:555) all still match.

**P2-m6. Small gaps in the import checks.**
- `season` is a display label: cap it (for example 20 chars). It's already formula-guarded through `CSV_TEXT`.
- Combination checks cover `schedule` rows only. Also reject `fillup` rows whose thing isn't in `vehicles`, `reading` rows and log `hours` on things outside `vehicles`/`home`, and `hours`/`odometer` on Health and Finance `thing` rows (data-model 2.3, 2.4a). Otherwise a crafted file can attach meter data to a person or household.
- Optional, as before (m1): a row cap.

**P2-m7. Keep each app's service worker out of the other's pages.** Service worker scope is a path, not an origin. If either app is ever served from the origin root (`hutch706.github.io/`), its service worker controls the other app's pages. Both must stay project sites under their own paths. Also note README.md:31 says `/pickle-it/` while distribution.md says `/pickle_it/`. Whichever path launches is permanent; release-manager should settle it.

### m2 and m3 from the earlier review
- **m2: closed in the design.** The allow-lists (`record_type`, `jar`, `every_unit`, `time_from`, `status`, yes/no), the number ranges with `NaN`/`Infinity`/negatives rejected, `thing` capped at 80, the date parser for `first_due`/`for_due`, unknown columns ignored, and reject-the-row-not-the-file all match. P2-m6 is extra hardening.
- **m3: closed in the design.** Ids are checked on import with a stable remap, and `thing`/`season` join `CSV_TEXT`. Tighten the pattern per P2-m5. Verify both when built (qa fixture: an id of `=HYPERLINK("x")` and one of `-A1`; the export should show neither as is).

### Old app's final notice: what it must tell users
A final Vehicle Maintenance App update, before deletion. release-manager writes the copy. Builds on data-model 4.2's list:
1. **On every screen, not dismissable for good:** "Vehicle Maintenance App is being replaced by Pickle It on <date>," with the link.
2. **Export button in the banner**, plus the steps: in Pickle It, Settings → App settings → Import → Merge.
3. **iPhone home-screen users:** "Pickle It can't see data saved inside the home-screen app. Export now." Android or same browser: "Pickle It can copy your data for you when you open it."
4. **What happens to the data:** the site going away doesn't delete it from the browser, but nothing will be able to show or export it, and Safari may clear it.
5. **How to delete it (new; ties to P2-M2):** a "Delete this app's data from this browser" button after the user has moved. It runs `deleteDatabase("vehicle-maintenance-app")`, removes `vma:` keys and its own caches, and nothing else. Never `localStorage.clear()`, `Clear-Site-Data` or "delete every cache": those would wipe Pickle It. Also warn that "Clear site data" in browser settings deletes **both** apps' data.
6. **The final update mustn't change storage:** no `DB_VERSION` bump, no new stores, no migrations. So the copy (and P2-m4) keep working.
7. **After deletion:** an installed old app is network-first and falls back to its cached copy when the server returns 404, so it keeps running the last version it saved. That's good (the export and delete buttons stay reachable), so make sure that last version is the one with the notice. If the owner instead puts a "this app has moved" page at the old address, it must return 200 and still include Export and Delete. Otherwise the service worker caches that page over the app and users lose their only export button.
8. **Privacy policy:** Pickle It's policy (section 5 above) should mention the one-time copy: it reads the old app's data on this device only when the user taps, nothing leaves the device, and the old data isn't changed.

### Needs a decision (owner), Phase 2
- **P2-1. Old-app data in Delete all data (P2-M2).** (A) Pickle It only tells the user the old data stays and how to remove it; (B) step 1 adds an unticked "Also delete Vehicle Maintenance App data in this browser" box, which means rewording v1-scope 4.11 AC 5. Recommend **B**: after the old site is gone, Pickle It is the only app left that can delete that data, and it happens only on an explicit tick.
- **P2-2. Read-only copy (data-model decision 1).** From a privacy view, **B (CSV plus copy) is acceptable** with P2-M1 and P2-m4 applied.
