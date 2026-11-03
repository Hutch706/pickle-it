# Pickle It: distribution, hosting and name check

Status: draft recommendation from release-manager, 2026-11-03. The owner decides. Nothing here has been bought, registered, deployed or published.

Facts below were checked on 2026-11-03. Fees and store rules change, so re-check the official pages before acting.

## 1. How to ship: PWA, app stores, or both

Pickle It today is a no-build static web app (index.html, app.js, data.js, app.css, sw.js, manifest.webmanifest). Data lives only on the device in IndexedDB and localStorage. There is no server and no account. That shape drives everything below.

### Option A: installable web app (PWA) only

- **Cost:** $0 on GitHub Pages or Cloudflare Pages. A custom domain is optional, roughly $10-20 a year.
- **Effort:** Low. Upload the files. This is how the Vehicle Maintenance App already ships (see README.md).
- **Review rules:** None. No store review, no gatekeeper.
- **Upkeep:** Edit and upload. Users get the update next time they open the app online (sw.js is network first).
- **Local-only data:**
  - Data is tied to the exact web address (origin). Moving the app strands everyone's data at the old address. Users would have to export a CSV and import it at the new one.
  - **iOS Safari:** WebKit deletes script-writable storage (IndexedDB, localStorage, service worker) for a site that hasn't been used in Safari for 7 days. Apps added to the Home Screen are meant to be exempt, because they keep their own "days of use" counter. Bug reports still describe lost data in some home-screen setups, so the safe message to users is: **install it to the Home Screen, and back up.** The manifest already uses `"display": "standalone"`, which matters for this. ([WebKit policy coverage](https://www.theregister.com/2020/03/26/apple_relax_were_not_totally/), [OSNews summary of the clarification](https://www.osnews.com/?p=131566), [WebKit bug 237350](https://bugs.webkit.org/show_bug.cgi?id=237350), [WebKit bug 232302](https://bugs.webkit.org/show_bug.cgi?id=232302))
  - On iOS, data in Safari and data in the Home Screen app are separate. Someone who uses both sees two different sets of data.
  - Clearing site data or browser data wipes it on any platform. The existing backup reminder and CSV export are the only safety net.
- **Downsides:** No store listing to find. On iPhone, installing means Share, then Add to Home Screen, which many people don't know. install-steps.md covers this.

### Option B: app stores (Apple App Store and Google Play)

**Google Play (wrap the PWA as a Trusted Web Activity with Bubblewrap)**
- **Cost:** One-time $25 registration. ([cost summary](https://splitmetrics.com/blog/google-play-apple-app-store-fees/))
- **Effort:** Medium. Generate an Android app bundle with Bubblewrap, sign it, and serve a `.well-known/assetlinks.json` file from the site so Android trusts it. The app opens full screen only once that file verifies. ([Google codelab](https://developers.google.com/codelabs/pwa-in-play), [Thinktecture guide](https://www.thinktecture.com/en/pwa/twa-bubblewrap))
- **Review rules that matter:** A new personal developer account must run a closed test with at least 12 opted-in testers for 14 days straight before it can ask for production access. That is about 3 or more weeks before launch, and finding 12 real testers is the hard part. ([Google Play help](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en-GB), [Choicely summary](https://www.choicely.com/blog/google-play-12-tester-rule)) Play also needs a privacy policy URL and a data safety form, and Google may ask for ID in your legal name.
- **Upkeep:** Content updates come from the website, so the wrapper rarely needs touching. Yearly Android target-API updates still require rebuilding and re-uploading the wrapper.
- **Local-only data:** A Trusted Web Activity runs in the user's Chrome, at the same web address. So it shares data with the PWA in Chrome for that address. That is good: one set of data. It also means the web address must stay fixed forever.

**Apple App Store**
- **Cost:** $99 a year for the Apple Developer Program, and a Mac to build and submit. ([cost summary](https://splitmetrics.com/blog/google-play-apple-app-store-fees/))
- **Effort:** High. Apple has no Trusted Web Activity. You'd need a native wrapper (for example Capacitor) with the files bundled inside, plus Xcode and signing.
- **Review rules that matter:** Guideline 4.2, Minimum Functionality. Apple rejects apps that are basically a repackaged website, and reviewers test offline. A thin wrapper around a web app is the most common 4.2 rejection. To pass, Pickle It would likely need native features such as local notifications for due tasks, which is real extra build work. ([MobiLoud on 4.2 and wrappers](https://www.mobiloud.com/blog/app-store-review-guidelines-webview-wrapper), [4.2 rejection notes](https://vp0.com/blogs/fix-app-store-rejection-4-2-minimum-functionality)) Apple also needs a privacy policy URL and privacy "nutrition label" answers.
- **Upkeep:** $99 every year, or the app is pulled. Each update goes through review. Yearly Xcode and iOS SDK requirements.
- **Local-only data:** Data inside a wrapped iOS app is stored in the app's own container. It is **not** shared with the PWA, and is not subject to Safari's 7-day rule. Deleting the app deletes the data. Moving a user between the PWA and the iOS app needs CSV export and import.

### Option C: both

PWA first, then Google Play as a thin wrapper of the same address, with Apple last (or never).

### Recommendation

**Launch as a PWA only. Revisit Google Play once v1 is stable and there are 12 willing testers. Skip the Apple App Store for v1.**

Why:
- $0 and the least work. It's how the current app already ships successfully.
- Apple is the costliest path ($99 a year plus a Mac), and the highest risk of a 4.2 rejection for a local-only web app. It also splits each iPhone user's data from the web version.
- Google Play is cheap and low-risk technically, and keeps one shared set of data. The 12-tester, 14-day rule is the main hurdle, so plan it as a second step, not a launch blocker.
- Whatever the owner picks, the launch web address must be permanent, because store wrappers would point at it too.

This depends on the open "Data storage" question. If Pickle It adds accounts and cloud sync later, the data trade-offs above change, and the App Store path gets easier to justify.

## 2. Hosting the PWA

**Rule: the existing Vehicle Maintenance App deployment stays untouched.** Pickle It gets its own new address. Don't rename, move or redirect the old repository or its GitHub Pages site. Its users' data is tied to that address.

**The Pickle It launch address must be permanent.** Data is tied to the exact origin (scheme + host + port). A GitHub Pages project site lives at `https://USER.github.io/REPO/`. Every project site on that account shares the origin `USER.github.io`, so it shares storage limits with the Vehicle Maintenance App. Pickle It uses a different IndexedDB name only if the data-architect changes it (today it's still "vehicle-maintenance-app", the same name as the old app). On the same origin, the two apps would collide on IndexedDB and on `vma:` localStorage keys. **So do not host Pickle It on the same `USER.github.io` origin as the old app unless the storage names are changed first.** A custom domain or a separate host avoids this entirely.

| Option | Cost | Address | Notes |
|---|---|---|---|
| GitHub Pages, default address | Free (public repo) | `https://USER.github.io/pickle_it/` | Same origin as the old app: storage collision risk (above). Renaming the repo changes the address and strands data. 1 GB site, 100 GB/month soft bandwidth. Terms say it is not for running an online business; a free app is fine. ([GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)) |
| Cloudflare Pages, default address | Free | `https://pickle-it.pages.dev` (if the name is free) | Its own origin, so no collision. 500 builds/month, 20,000 files, 25 MiB per file on the free plan. Direct upload, no build needed. Needs a Cloudflare account. ([Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/)) |
| Custom domain (on either host) | About $10-20/year | e.g. `https://pickleit.org` or `https://app.example.com` | Most permanent: you can switch hosts later without changing the address, so no stranded data. Must be renewed every year, forever; a lapsed domain strands all users. Needs a registrar account (owner only). |

**Recommendation:** a custom domain, served from Cloudflare Pages or GitHub Pages. It's the only choice where the address survives a change of host. If the owner wants $0, use Cloudflare Pages' `pages.dev` address rather than the shared `github.io` origin. Whichever is chosen, set it once before the first public user and never change it.

Creating any account, buying a domain or deploying needs the owner's go-ahead.

## 3. Name check: "Pickle It"

Searched 2026-11-03. Not exhaustive. **A trademark lawyer should confirm before the name is relied on.**

### App stores
- **Apple App Store: "PickleIT" / "Just Pickle It!"** (id6470372050), by Debashis Chakraborty. A pickleball app: tournaments, court finder, events. Free. ([listing](https://apps.apple.com/in/app/pickleit/id6470372050))
- **Apple App Store: "PickleIt"** (id6742874193), by Pickleit Holdings LLC, iPhone only. Appears to be pickleball too. ([listing](https://apps.apple.com/us/app/pickleit/id6742874193))
- Other nearby names: Pickle Recipes, Pickle Jar, Pickle (several unrelated apps), and Tursu's Pickle & Fermentation Tracker (a pickling theme, but a different name). ([Pickle Recipes](https://apps.apple.com/app/pickle-recipes/id6747289479), [Pickle Jar](https://apps.apple.com/us/app/id1663620372))
- **Google Play:** no listing named exactly "Pickle It" found. A package `com.pickleit.app` was referenced on another site but not confirmed. Search results for Play were thin, so the owner should search Play directly.

Takeaway: the exact name is already used on the App Store, in a different field (pickleball, not maintenance). Two apps with the same name in the same store is allowed in principle, but it hurts search, and the "Pickleit Holdings LLC" name suggests a business that may protect its brand. A longer store name such as "Pickle It: Home & Car Upkeep" would help.

### Domains (public RDAP lookups, not a registrar quote)
| Domain | Status |
|---|---|
| pickleit.com | Registered (since 2007) |
| pickleit.net | Registered (2023) |
| pickleit.app | Registered (Sept 2026, via Hostinger) |
| pickleit.org | Looked unregistered |
| pickleit.io | Looked unregistered |
| pickleitapp.com | Looked unregistered |
| getpickleit.com | Looked unregistered |

"Looked unregistered" means the registry lookup returned not-found. Confirm at a registrar before relying on it. Nothing was bought.

### Trademarks (US)
- **PICKL-IT**, Reg. No. 4981971, **live and registered**, owner Sharon Kathleen Ericson (Alabama). Class 21: glass jars for fermenting pickles and lids for turning jars into fermenting jars. Section 8 and 15 accepted Feb 2023. ([USPTO TSDR](https://tsdr.uspto.gov/statusview/sn86746978))
  - Sounds the same as "Pickle It", and it's pickling-themed, which is exactly Pickle It's theme. The goods (jars) are different from software, which lowers the risk, but the shared theme raises it. **This is the main one for a lawyer to look at.**
- **PICKLE-IT**, Serial 98135102, filed Aug 2023, Class 25 (clothing), reported **dead** by an aggregator. Not confirmed on USPTO directly. ([markinton.com](https://markinton.com/trademark/pickle-it-98135102))
- Many live "PICKLE" marks exist in various classes. None found for exactly "PICKLE IT" in software (Class 9) or software services (Class 42). This was a web search through aggregators plus one USPTO record, not a full USPTO clearance search.

### Name check summary
Usable with care, not clear. The exact name is taken on the App Store (pickleball), the .com/.net/.app domains are taken, and a live pickling-jar trademark "PICKL-IT" sounds the same. A lawyer's opinion is worth getting before spending on branding, a domain, or store accounts.

## Sources
- WebKit storage policy: [The Register](https://www.theregister.com/2020/03/26/apple_relax_were_not_totally/), [OSNews](https://www.osnews.com/?p=131566), [WebKit bug 237350](https://bugs.webkit.org/show_bug.cgi?id=237350), [WebKit bug 232302](https://bugs.webkit.org/show_bug.cgi?id=232302)
- Store fees: [SplitMetrics](https://splitmetrics.com/blog/google-play-apple-app-store-fees/)
- Google Play testing rule: [Google Play Console Help](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en-GB), [Choicely](https://www.choicely.com/blog/google-play-12-tester-rule)
- Play wrapper: [Google codelab](https://developers.google.com/codelabs/pwa-in-play), [Thinktecture](https://www.thinktecture.com/en/pwa/twa-bubblewrap)
- Apple 4.2: [MobiLoud](https://www.mobiloud.com/blog/app-store-review-guidelines-webview-wrapper), [vp0.com](https://vp0.com/blogs/fix-app-store-rejection-4-2-minimum-functionality)
- Hosting: [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits), [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/)
- Name: App Store listings linked above, [USPTO TSDR 86746978](https://tsdr.uspto.gov/statusview/sn86746978), [markinton.com 98135102](https://markinton.com/trademark/pickle-it-98135102), RDAP via rdap.verisign.com, pubapi.registry.google and rdap.org
