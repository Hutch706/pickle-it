# Open questions
Each needs an owner decision. Once decided, move it to docs/decisions.md.

## Ready to decide (Phase 1 recommendations are in)
- **Health: what it tracks in v1.** A) recurring appointments and renewals per person, no medical fields; B) A plus medication schedules; C) A plus health records. Recommended: A. Details: docs/specs/v1-scope.md D1.
- **Finance: what it tracks in v1.** A) money deadlines, no amounts; B) A plus optional amounts; C) bills and budgeting. Recommended: A, with B later. Details: v1-scope.md D2.
- **Distribution.** Web app (PWA) only, web app then Google Play, or both stores. Recommended: web app only for v1, Google Play later. Details: docs/release/distribution.md.
- **Launch web address.** Custom domain, Cloudflare Pages, or github.io shared with the old app. Recommended: custom domain (or Cloudflare Pages for $0); not the shared github.io origin. Details: distribution.md.
- **Name and lawyer.** Live US trademark "PICKL-IT" (fermenting jars), two "PickleIt" pickleball apps, pickleit.com taken. Recommended: one lawyer engagement for the name, privacy policy and terms before spending on a domain or branding. Details: distribution.md.
- **Due boxes.** This week = overdue plus today to day 6 (rolling); This month = days 7-27; Later = day 28 on. Both the spec writer and the data architect recommend this.
- **Mileage tasks in the due boxes.** Recommended: an estimated date from recent driving, labeled "about", falling back to the miles-left reminder.
- **Hours-of-use tasks in the due boxes.** The agents disagree. Spec writer: estimate a date from hours per day, falling back to the reminder. Data architect: no estimate; place by hours left, and pair each with a time limit ("50 hr or 1 year"). Details: v1-scope.md D7, data-model.md.
- **Where a small engine's hour reading lives.** Recommended: each engine is its own thing in Home (e.g. "Mower"). v1-scope.md D7.
- **Combining two measures on one task.** Recommended: only miles + time and hours + time. v1-scope.md D5.
- **Settings placement.** Recommended: a gear button in the Pantry header (a sixth tab crowds small phones). v1-scope.md D3.
- **Several homes / people.** Recommended: yes. v1-scope.md D4.
- **Hiding jars a user doesn't need.** Recommended: yes, cuttable. v1-scope.md D8.
- **Units.** Recommended: miles and gallons for v1. v1-scope.md D9.
- **Season dates.** Recommended: the content curator picks per task, with fixed season starts as a fallback. data-model.md.

## Later
- **Personal version:** does the owner's personal version eventually move onto Pickle It, or stay separate?
- **Tabs inside each jar:** what screens or sections each jar has. The owner decides later.
