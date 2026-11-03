# Privacy and security review: Phase 1 drafts and imported code

Reviewer: privacy-security-reviewer, 2026-11-03. Status: review of **unapproved drafts**. Nothing here is decided; the owner decides.

Read: CLAUDE.md, docs/brief.md, docs/decisions.md, docs/open-questions.md, docs/specs/data-model.md, docs/specs/v1-scope.md, docs/release/distribution.md, docs/release/checklist.md, and (read-only) index.html, app.js, data.js, app.css, sw.js, manifest.webmanifest, README.md, install-steps.md, .gitignore, and the git history of this branch.

Code reviewed is this branch (`claude/subagents-project-8ff5a6`, commit 8344403), which still has the imported Vehicle Maintenance App code unchanged. Another local branch (`claude/pickle-it-repo-setup-a40c79`) has commits named "Give Pickle It its own storage names" and "Rename to Pickle It". I did not review that branch; some findings below may already be fixed there.

This is not legal advice. Items marked **Lawyer** need a qualified lawyer's review before launch.

---

## 1. Storage options compared

### What personal data the app handles (all options)
| Data | Where it comes from | Why it's sensitive |
|---|---|---|
| Vehicle names ("2019 Civic", sometimes a plate or VIN typed in) | User | Can identify a person or vehicle |
| Fill-ups: date, odometer, gallons, price, **station name** | User | Date + station = where someone was and when; repeated stations reveal routines and home/work area |
| Maintenance log: date, odometer, shop, item, **free-text notes** (up to 2,000 chars) | User | Notes can hold anything: VIN, address, gate code, phone numbers |
| Home items and dates (v1, planned) | User | What someone owns, where, and when they're likely away (e.g. "winterize cabin") |
| Shops list | User | Local businesses used, approximate location |
| Settings: last export date, change count, theme, hemisphere (planned) | App | Low |

The app does **not** collect: name, email, phone, precise GPS location, contacts, photos, device IDs, analytics or ad identifiers. Keep it that way. Hemisphere is user-chosen (data-model 5.7), which is the right call: never request the location permission to set it.

### Comparison
| | A: device only | B: accounts + cloud sync | C: user's own iCloud / Google Drive |
|---|---|---|---|
| **What the owner holds** | Nothing. The owner never receives user data. The host (GitHub or Cloudflare) sees standard request logs: IP address, user agent, time, page requested. | Everything above for every user, plus email addresses, sign-in records, server logs and backups. The owner becomes the controller of a database of where people buy fuel and what they own. | Two variants. **C1 manual** (share sheet to Files/Drive, which the export already does on phones): owner holds nothing, same as A. **C2 automatic** (app calls the Google Drive API or CloudKit JS): owner still holds no records, but registers an OAuth app and the user grants it access to their drive. |
| **Legal obligations that kick in** | Light. A privacy policy is still needed (both app stores require one; good practice for the PWA). Saving data on the user's own device to provide the feature they asked for is the "strictly necessary" case under EU/UK cookie rules, so no consent banner is needed as long as there are no analytics or third-party requests. **Lawyer** to confirm. | Heavy. GDPR/UK GDPR controller duties if anyone in the EU/UK uses it (lawful basis, access/export/deletion requests, records of processing, a data processing agreement with Supabase/Firebase, international transfer terms, breach notice to the regulator within 72 hours). US state breach-notification laws (every state has one). State privacy laws (California etc.) mostly have revenue or user-count thresholds a free app won't hit, but **Lawyer** to confirm. App stores require in-app account deletion (Apple guideline 5.1.1(v); Google Play's account deletion policy) and a "data collected" disclosure. Children: must say the app isn't for under-13s, and act if one signs up (COPPA). | C1: same as A. C2: Google's API Services User Data Policy and OAuth app verification (a privacy policy URL, a verified domain, a consent screen; use the narrow `drive.file` or `appDataFolder` scope, never full Drive). Apple CloudKit JS needs the $99/yr Apple Developer Program. The owner is not holding the data but is responsible for what the app does with the access token. |
| **Breach exposure** | Smallest possible. No central store to breach. Remaining risks are per device: a script-injection bug (none found, see 2), a shared origin (finding B1), a lost unlocked phone, or a leaked backup file. | Largest. One misconfigured access rule (a classic with Supabase row-level security and Firebase rules) exposes every user's location history at once. Credential stuffing on accounts. Requires security monitoring the owner would have to run. | C1: same as A. C2: a compromised or malicious app version could read/write the user's synced backup file, and the OAuth client becomes a target. Exposure is per user, not all users at once. |
| **Running cost / effort** | $0, done | Paid tier likely, weeks of work, breaks "no dependencies" | C1: $0, exists today. C2: weeks, OAuth setup, possibly $99/yr for Apple |

### Recommendation
**Back Option A for v1**, the same as the data-architect, with C1 (share-sheet backup to the user's own cloud drive) described in the app as the way to keep a copy safe. It holds no user data, keeps the legal surface small, and the honest one-line promise "Your data never leaves your device unless you export it" is a real product feature. Revisit B or C2 only after v1, and treat either as a new privacy review before any build (data-model 5.6). Health and Finance jars (v1-scope D1) would raise the bar further under B; keep them out of v1 as recommended.

---

## 2. Findings, ranked

Severity: **Blocker** = must fix before public launch. **Major** = should fix before launch. **Minor** = fix when convenient.

### Blockers

**B1. Same-origin hosting with the old app, while the code still uses the old app's storage names.**
On this branch, the code uses IndexedDB `vehicle-maintenance-app` (data.js:95), localStorage prefix `vma:` (app.js:20-21), BroadcastChannel `vehicle-maintenance-app` (app.js:52), cache `vehicle-maintenance-app-v1` (sw.js:5), and its activate step deletes every cache starting `vehicle-maintenance-app-` (sw.js:22-23). It also runs `moveFromOldName()` (data.js:128-146), which copies the `fillup-receipts` database and then **deletes** it, and the `fur:` key move (app.js:23-27), which deletes old keys. If Pickle It goes up on `hutch706.github.io/...`, it reads and writes the live old app's data, can delete the old app's legacy data, and will break the old app when the schema changes. That's a data-loss and data-mixing problem for real users.
- **Fix:** Do the renames in data-model 2.1, and **add the BroadcastChannel name** (`pickle-it`), which 2.1's table leaves out; otherwise the two apps on one origin would trigger each other's reloads. Remove `moveFromOldName()` and the `fur:` move, as 2.1 says.
- **Fix (stronger, recommended):** host Pickle It on its **own origin** (Cloudflare `pages.dev` or a custom domain), as release-manager recommends in distribution.md section 2. Renames stop accidental mixing; only a separate origin stops a script-injection bug in either app from reading the other's data (data-model 5.1). The cost is losing the same-origin direct copy (data-model 4.2); CSV import covers migration. Owner decision, see "Needs a decision".

### Major

**M1. No Content-Security-Policy.** index.html has no CSP. The code is clean today (see M2), but a CSP is cheap insurance against a future `innerHTML` mistake, a compromised dependency, or an injected script, and it enforces the "no third-party requests" promise the privacy policy will make.
- **Fix:** add a `<meta http-equiv="Content-Security-Policy">` to index.html, roughly: `default-src 'self'; script-src 'self' 'sha256-<hash of the inline theme script>'; style-src 'self'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'`. The inline theme script in `<head>` needs its hash (or move it into a file). GitHub Pages can't set response headers, so `frame-ancestors` (anti-framing) only works on Cloudflare Pages via a `_headers` file; another small reason to prefer Cloudflare. frontend-engineer should test that the share sheet, file picker, blob download and service worker still work with it on.

**M2. Keep the "no innerHTML with user text" rule as the app is rebuilt.** Current state is good: every user string goes through `textContent` (the `el()` helper, app.js:6, `setMsg`, app.js:17) or `.value`. The only `innerHTML` (app.js:649) is a fixed SVG checkmark. No `eval`, `new Function`, `document.write` or `insertAdjacentHTML`. The risk is the v1 rebuild: Pantry, jars and Home screens are all new UI, and new code is where injection bugs appear.
- **Fix:** write the rule into CLAUDE.md or the frontend-engineer brief: build DOM with `el()`/`textContent`; `innerHTML` only for fixed strings in the code; never for names, notes, stations, shops, imported text or anything from storage. qa-accessibility-tester should include an import fixture with names like `<img src=x onerror=alert(1)>` and `"><script>` and check they show as plain text everywhere (Pantry, due boxes, dialogs, `<datalist>`, chart tooltip).

**M3. Third-party font (DM Sans): self-host, don't use Google Fonts.** Today the app loads no external resources at all (fonts are system stacks, app.css:22-24), and sw.js ignores cross-origin requests (sw.js:31). The brief now asks for DM Sans.
- Google Fonts: every app open sends the user's IP address, browser and the page address to Google. A Munich court (LG München I, 20 Jan 2022, 3 O 17493/20) held that embedding Google Fonts this way without consent broke GDPR and awarded damages, which started a wave of demand letters in Germany. It would also make "we don't send your data anywhere" false, need a consent question for EU users, and the font would fail offline because sw.js doesn't cache other origins.
- Self-hosting: DM Sans is under the SIL Open Font License 1.1, which allows bundling. No outside request, works offline, nothing to disclose.
- **Fix:** self-host DM Sans as `woff2` files (Latin subset, only the weights used), declared with `@font-face` and `font-display: swap` in app.css, include the OFL license text in the repo, and add the font files to `FILES` in sw.js. Ask the owner before adding the files (they're a new asset, not code, but still worth a yes).

**M4. Backups are plain text and travel.** (data-model 5.3.) The CSV holds station names with dates, notes and everything else, unencrypted. On phones the export opens the share sheet (app.js:923-930), so people email it to themselves or drop it in cloud drives and chats.
- **Fix:** add one plain line near the Export button: "This file isn't encrypted and includes everything you've logged, like gas stations and notes. Keep it somewhere private." Don't add encryption in v1: a password-protected backup that users forget the password for is a worse data-loss risk than the privacy gain, and it breaks opening the file in Excel. Revisit if notes or receipts grow.

**M5. Free-text notes invite sensitive data.** Notes accept 2,000 characters (data.js:85) and land in the CSV. Users will type VINs, addresses, gate or alarm codes.
- **Fix:** placeholder text that steers to maintenance ("e.g. Replaced front brake pads"; already true for "Other repairs", index.html) and no prompt that asks for VIN, plate or address. The privacy policy should say notes are stored like everything else (on the device, in the backup). Don't add a VIN field in v1 (v1-scope section 6 already rules out VIN lookup; keep it that way).

### Minor

**m1. Import size limit already exists; data-model 5.4 says it doesn't.** app.js:952 rejects files over 20 MB before reading them. Good. data-model.md section 5.4 says "There's no file-size limit today"; that's a factual slip to correct when the doc is approved. Keep the check in the rebuilt importer. Inside the limit, a 20 MB CSV is still around 200,000 rows; the parser is linear and records go through the builders, so the worst case is a slow preview, not a crash. Optional: cap rows (say 100,000) with a clear message.

**m2. Import is otherwise well defended.** Every row goes through `makeVehicle`/`makeItem`/`makeFillup`/`makeService` with length caps (`cleanText`, 60-120 chars; notes 2,000) and number/date range checks (data.js:54-89). Binary files are rejected (data.js:404). Nothing from the file is executed or put into HTML. A preview is shown and the user chooses Merge or Replace. Keep all of this in the v2 importer; the new columns in data-model 4.3 (`thing`, `season`, `every_unit`, `time_from`, `jar`, `status`) need the same treatment: enums checked against an allow-list (`jar` must be `vehicles` or `home`, not any string), text capped.

**m3. CSV formula guard misses the id columns.** The guard (data.js:273-280) prefixes `'` on `vehicle`, `station`, `shop`, `item`, `notes` when they start with `= + - @` tab or CR. That covers everything a user types. But `vehicle_id`, `item_id`, `id` and `visit` are taken from imported files (capped at 60 chars, data.js:59, 70, 87-88) and exported unguarded. A crafted file could carry `=HYPERLINK(...)` in an id column, survive an import, and run as a formula when the user's next export is opened in Excel. Low likelihood (needs someone to hand the user a crafted file), low-medium impact.
- **Fix:** either validate imported ids to a safe pattern (e.g. `^[A-Za-z0-9_~-]{1,60}$`, else generate a new id) or add the id columns to the guard set. Validating is better: it also keeps ids clean as IndexedDB keys. Add the new v2 text columns to `CSV_TEXT` as data-model 4.3 already plans.

**m4. No "delete all my data" button.** Users can delete vehicles one by one; wiping everything means clearing browser site data, which most people don't know how to do and which differs between Safari tabs and the home-screen app on iOS.
- **Fix:** add "Delete all data on this device" in Settings, behind a confirmation that offers export first. Lets the privacy policy give a simple, true answer to "how do I delete my data".

**m5. iOS Safari data eviction.** (data-model 5.5.) Current copy is good: the iOS nudge (index.html, `iosNudge` and `iosWelcome`), the storage card (app.js:1051-1054), the persistent-storage request (data.js:183-184) and the backup reminder all say it plainly. distribution.md adds that bug reports show some home-screen installs still lose data.
- **Fix:** carry all of this into the Pickle It rebuild (onboarding 4.5 AC1 and the Settings storage card). Make the backup reminder count changes in both jars (v1-scope 4.7 AC5). The privacy policy and help copy should say plainly that the owner can't recover lost data.

**m6. Hosting logs.** GitHub Pages and Cloudflare Pages both log visitor IP addresses and user agents as part of serving the site. The owner doesn't control or see these by default.
- **Fix:** name the host in the privacy policy and link its privacy statement. Don't turn on Cloudflare Web Analytics or any other analytics without a new review and a policy update.

**m7. Secrets and personal data in the repo: none found.** I searched tracked files and the history of this branch for API keys, tokens, passwords and private keys: nothing. README and install-steps use `YOUR-USERNAME` placeholders. `.gitignore` excludes `.env` and `.env.*`. There are no test fixtures yet.
- **Fix:** keep it that way: the regression CSV fixtures planned in data-model 4.1 must be made-up data (data-model 5.8), not real exports from the owner's personal version, since real exports contain station names and dates. If Option C2 is ever built, the Google OAuth client ID is public by design and fine to commit; a client *secret* must never be (and a browser app shouldn't have one).

**m8. Framing (clickjacking).** Without `frame-ancestors` or `X-Frame-Options`, another site could frame the app. Damage is limited (an attacker can't pick a file or read data across origins), but a framed "Delete vehicle" or "Replace" tap is possible in theory.
- **Fix:** covered by M1 on Cloudflare Pages (`_headers`: `Content-Security-Policy: frame-ancestors 'none'`). On GitHub Pages, accept the risk.

**m9. Service worker scope.** sw.js only handles same-origin GETs under its own path (sw.js:29-33), which is correct and keeps it from touching another app's pages on a shared origin. Keep the scope check when renaming, and narrow the cache-cleanup filter to `pickle-it-` as data-model 2.1 says.

---

## 3. Privacy policy and terms: outline for v1 under Option A

Write in plain language, short, and true to how the app actually works. Host at a permanent URL on the same origin as the app (needed for the stores later and for the Settings "About" link in v1-scope 4.8). Date it and keep old versions.

### Privacy policy must say
1. **Who we are and how to reach us.** The owner's name or trading name and a contact email (a dedicated address, not a personal one). **Lawyer:** whether a postal address is needed for EU/UK users.
2. **The short version.** Pickle It stores what you enter only on your device. We don't have accounts, we don't receive your data, and we can't see it.
3. **What the app stores on your device.** List the categories in section 1 (vehicles, fill-ups including gas station names and dates, maintenance and home tasks, notes, shops, app settings), and that it uses browser storage (IndexedDB and localStorage) and an offline cache. Say this storage is needed for the app to work and isn't used for tracking.
4. **What we don't collect.** No analytics, no ads, no trackers, no third-party scripts or fonts, no location permission, no contacts. (Only true if M3 is fixed by self-hosting and M1's CSP holds the line.)
5. **Hosting.** The site is served by GitHub Pages or Cloudflare Pages (whichever is chosen), which receives your IP address and browser details when you load it, under its own privacy policy (link it).
6. **Backups.** Export creates an unencrypted file containing everything you've entered. Where it goes (email, iCloud, Google Drive, AirDrop) is your choice and is governed by that service's terms. Imported files are read on your device only.
7. **Your control.** How to export, how to delete one record, how to delete everything (m4), and that uninstalling the home-screen app or clearing site data deletes it. Because we hold no data, we can't access, correct, export or delete it for you. **Lawyer:** how to phrase GDPR/UK GDPR and US state-law rights when the controller holds nothing.
8. **Data loss.** We can't recover lost data. Browsers, especially Safari on iPhone, may delete it. Keep backups.
9. **Children.** Not directed at children under 13 (or 16 in some EU countries). **Lawyer:** confirm age wording.
10. **Changes.** How changes are announced (e.g. a note in the app), with the effective date.
11. **App store disclosures, if Option B/C of distribution.md happens later:** Google Play data safety form and Apple privacy label would both be "no data collected", consistent with this policy.

### Terms of use should say
A short terms page is worth having even for a free app. **Lawyer** to review all of it, especially items 3-5, which are jurisdiction-dependent.
1. Free to use, provided as is, may change or stop.
2. **Maintenance reminders are general guidance, not professional advice.** Follow the vehicle manufacturer's schedule and qualified professionals for safety-critical work (brakes, gas furnaces, electrical). The starter libraries are generic (v1-scope 4.6.3); the terms should back that up.
3. **Data is the user's responsibility.** The owner doesn't store it and isn't liable for loss; keep backups.
4. Limitation of liability and warranty disclaimer. Consumer-protection laws (EU, UK, Australia, some US states) limit how far these can go.
5. Governing law.
6. Acceptable use is barely relevant for a single-user offline app; keep it to a line.
7. Open-source license of the code, if the repo goes public (separate from the terms; pick a license deliberately, and include the DM Sans OFL notice).

### If Option B were chosen instead
Everything above changes: lawful basis per data type, retention periods, sub-processors (Supabase/Firebase, email sender), international transfers, account deletion in-app, data export on request, breach notification, security description, and likely a data processing agreement. That's a full lawyer engagement, not a review.

---

## Needs a decision (owner)
1. **Storage:** A (device only), B (accounts and sync) or C2 (automatic sync to the user's drive)? Recommend **A**, with the existing share-sheet export (C1) promoted as the backup path.
2. **Hosting origin:** own origin (Cloudflare `pages.dev` or a custom domain) or the shared `github.io` origin with the old app? Recommend **own origin**. It isolates the two apps' data from each other's bugs. Trade-off: no same-origin direct copy (data-model 4.2); users migrate by CSV.
3. **DM Sans:** self-host or Google Fonts? Recommend **self-host** (no third-party request, works offline, nothing to disclose).
4. **Lawyer review:** get one before launch for the privacy policy, terms, and the name/trademark question already flagged by release-manager? Recommend **yes**, one engagement covering all three.
