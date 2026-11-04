# Pickle It: launch checklist (draft)

Everything here must be true before v1 goes public. Owned by release-manager. Draft 2026-11-03; items will be added as specs land. See docs/release/distribution.md for the reasoning.

## Owner decisions made and logged in docs/decisions.md
- [x] Distribution: PWA only for v1 (decided 2026-11-03)
- [x] Launch web address: `https://hutch706.github.io/pickle-it/` on GitHub Pages (decided 2026-11-03); treat as permanent, don't rename the repo or account
- [ ] Name confirmed (trademark lawyer opinion on "PICKL-IT" and the App Store "PickleIt" apps)
- [ ] Data storage: local-only or accounts with sync
- [ ] v1 categories and other open questions in docs/open-questions.md closed or deferred on purpose

## Product and quality
- [ ] Every v1 feature has an owner-approved spec and mockup, and is built
- [ ] No open blocker or high-severity bugs from qa-accessibility-tester
- [ ] Accessibility pass done (contrast, screen reader labels, tap targets, text zoom)
- [ ] Tested on a real iPhone (Safari and installed to Home Screen) and a real Android phone (Chrome and installed)
- [ ] Works fully offline after first load; no blank screen when offline
- [ ] Due-date math checked for mileage and time-based tasks

## Data safety
- [ ] CSV export works and includes every kind of record
- [ ] CSV import works, including a file exported from the Vehicle Maintenance App
- [ ] Storage names are Pickle It's own (`pickle-it` database, `pickle-it:` keys, `pickle-it-` cache): done 2026-11-03; re-check before launch
- [ ] Backup reminder works and is easy to find
- [ ] Installed-app storage tested on iPhone: data still there after 8+ days unused
- [ ] Help copy tells iPhone users to install to the Home Screen and back up

## Privacy and legal
- [ ] privacy-security-reviewer sign-off
- [ ] Privacy policy written and live at a permanent URL (required by both stores, good practice for the PWA)
- [ ] Terms of use, if the reviewer says they're needed
- [ ] No analytics, trackers or third-party requests unless the owner approved them and the policy says so
- [ ] Repo has no secrets, .env files or personal data

## App identity
- [ ] manifest.webmanifest updated: name, short_name, description, colors (still says "Vehicle Maintenance App")
- [ ] Pickle It icons (192, 512, maskable 512) and favicon
- [ ] Page title and in-app name say Pickle It
- [ ] install-steps.md and README.md rewritten for Pickle It

## Hosting (needs owner go-ahead for every account, purchase and deploy)
- [ ] GitHub Pages turned on for `Hutch706/pickle-it` from `main`, folder `/` (decided 2026-11-03); turn on only with the owner's go-ahead
- [ ] HTTPS working at `https://hutch706.github.io/pickle-it/`
- [ ] Manifest, sw.js and all links still use relative paths (nothing starting with `/`)
- [ ] Installed app opens and works offline at `/pickle-it/` on iPhone and Android
- [ ] sw.js cache name and FILES list match the shipped files
- [ ] After v1 is live: owner deletes the Vehicle Maintenance App (repo or Pages site). Its database, keys, caches and service worker stay in users' browsers until they clear site data; Pickle It must not read or delete them

## Release
- [ ] Version number set (start at 1.0.0) and shown in Settings or About
- [ ] CHANGELOG.md and release notes written
- [ ] In-app help copy done
- [ ] Rollback plan: previous files kept so a bad release can be re-uploaded within minutes

## Store only (skip if PWA only)
- [ ] Google Play: developer account, Bubblewrap bundle, assetlinks.json live, data safety form, 12 testers for 14 days, store listing and screenshots
- [ ] Apple: developer program ($99/yr), native wrapper with features that pass guideline 4.2, privacy labels, store listing and screenshots
