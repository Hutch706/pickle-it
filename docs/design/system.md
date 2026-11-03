# Pickle It design system (draft)

Status: draft, 2026-11-03. Started from app.css and the chosen Settings layout (settings-option-c.html). Anything marked **proposed** is not decided. The mockups that use it: pantry.html, jars.html, onboarding.html, settings-option-c.html.

## 1. Color tokens

Tokens live on `:root` in app.css, with a dark set per palette. Green is the default (decided). Values below are Green; the other 6 palettes set the same names.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | #f2f4f0 | #0f140f | Page background, icon tiles |
| `--surface` | #ffffff | #182019 | Cards, boxes, tab bar |
| `--ink` | #1a221c | #e5ece5 | Body text |
| `--muted` | #5d6a60 | #9aaa9c | Secondary text, inactive tabs |
| `--line` | #d8ded6 | #2a362c | Dividers only (not control borders) |
| `--accent` | #2f6b3f | #7cc48d | Primary buttons, active tab, links |
| `--accent-ink` | #ffffff | #0c140e | Text and icons on `--accent` |
| `--ok` / `--ok-bg` | #1f7a5a / #e1f1e8 | #86d6b0 / #163126 | "Done" badges, success notes |
| `--wait` / `--wait-bg` | #85600a / #f8eed3 | #f0c46a / #382b0e | Warnings, iPhone note, "pending" tags in mockups |
| `--err` / `--err-bg` | #b3261e / #fbe9e7 | #ff8a80 / #3b1714 | Overdue, red dot, errors, destructive |
| `--display-bg` / `--display-fg` | #141a15 / #c8e66a | #070a07 / #c8e66a | Pump readout only |
| `--run` | #b5562a | #ff9a6b | 2-month running MPG line |
| `--err-ink` **(proposed)** | #ffffff | #1a0b0a | Text on `--err` buttons. Fixes white on red at 2.3:1 in dark |
| `--line-strong` **(proposed)** | #7a867c | #6f7f72 | Control borders, switch tracks, outlines. Fixes `--line` at 1.4:1 |

Derived (no new token): the overdue row tint is `color-mix(in srgb, var(--err-bg) 60%, var(--surface))`.

### Contrast, Green (WCAG 2.2 AA)
| Pair | Light | Dark |
|---|---|---|
| ink on surface | 16.3 | 13.9 |
| muted on surface / bg | 5.7 / 5.1 | 6.8 / 7.6 |
| accent on surface (active tab label, links) | 6.4 | 8.1 |
| accent-ink on accent (buttons, active jar icon) | 6.4 | 9.0 |
| err on overdue tint ("Overdue", "120 mi over") | 6.0 | 7.2 |
| muted on overdue tint (thing name) | 5.2 | 6.7 |
| err on err-bg (Overdue badge) | 5.6 | 7.0 |
| wait on wait-bg | 4.9 | 8.4 |
| ok on ok-bg | 4.50 (no margin) | 8.2 |
| red dot (err) on surface, non-text | 6.5 | 7.3 |
| line-strong on surface, non-text **(proposed)** | 3.8 | 3.9 |
| display-fg on display-bg | 12.6 | high |

Only Green was checked. The other 6 palettes need the same pass before build (qa-accessibility-tester).

## 2. Type

Fonts are app.css's system stacks. No web fonts.

| Style | Font | Size / weight | Use |
|---|---|---|---|
| Eyebrow | `--font-display` | 13 / 700, letter-spacing .12em, accent | "PICKLE IT" |
| H1 | `--font-display` | 30 / 700 | Screen titles |
| Box title | `--font-display` | 19 / 700 | "This week" |
| H2 section | `--font-display` | 15 / 700, uppercase, .07em, muted | "YOUR VEHICLES" |
| Body | `--font-body` | 16 / 400, line-height 1.45 | Text |
| Row name | `--font-body` | 16 / 600 | Task name |
| Secondary | `--font-body` | 14 / 400, muted | Thing name, hints |
| Due text | `--font-num` | 14 / 600, tabular figures | "1,200 mi / Dec 12" |
| Big number | `--font-num` | 22-28 / 600 | Odometer, MPG |
| Tab label | `--font-body` | 12 / 600 (800 when active) | Bottom bar |

Text must still work at the largest system text size. Tab labels can cut off with "…", but the full name stays in the accessible name.

## 3. Spacing and shape
- 4 px base. Common steps: 4, 8, 10, 12, 14, 16, 18, 24.
- Screen padding 16 px; 18 px between sections; 10 px between due boxes.
- Radius: 8 inputs, 10 buttons, 12 cards, boxes and tiles, 18 dialogs, 999 chips.
- Touch targets at least 44 x 44 px. Row buttons are 60 px or taller, quick actions 52 px, primary buttons 48 px.

## 4. Components

**Jar tab (bottom bar).** A `nav` with links and `aria-current="page"`, not `role="tablist"`. The bar moves between screens; it doesn't switch panels on one page.
- Pantry: a raised 46 x 40 rounded square in `--accent` with a white cabinet icon, then a 1 px `--line-strong` divider. When a jar is active, the square becomes outlined (2 px accent border, accent icon, surface fill).
- Jar: a 30 px jar outline (lid plus body) with the jar icon inside at 12 px. Inactive: `--muted`. Active: jar filled `--accent`, icon `--accent-ink`, label bold in `--accent`.
- Red dot: a 12 px `--err` circle with a 2 px `--surface` ring at the jar's top right. Its non-color equivalent is the link's accessible name, "Vehicles, has items due this week". The dot itself is `aria-hidden`.
- Order is fixed: Vehicles, Home, Health, Finance. Hidden jars have no tab, and the other tabs share the width.

**Due box.** A native `<details>` with `<summary>` holding the title, range hint ("Overdue and the next 7 days", "In 1 to 4 weeks", "4 weeks or more"), a count pill (accessible name "6 tasks") and a chevron. Whether each box is open is remembered on the device. When a box is empty, it shows one line; This week shows a canning line instead. Over 50 tasks: a footer saying "Showing 50 of 57" with a chip link to each jar holding the rest.

**Due row.** `<li>` > `<button aria-expanded aria-controls>` containing:
- a 36 px jar-icon tile (thing icon for engines and people)
- the task name (600), with the thing name below it in muted text, plus hidden ", Vehicles"
- due text on the right, in `--font-num`
Tapping the row opens its quick actions: Done (primary), Skip ("Skip this time" to screen readers), and Add reading (meter tasks) or Open (other tasks). Only one row is open at a time.

**Due text.** The visible text is `aria-hidden`; a `.vh` span carries full words:

| Case | Visible | Screen reader |
|---|---|---|
| Miles with a date | `1,200 mi / Dec 12` | "1,200 miles left, estimated December 12" |
| Hours with a date | `6.5 hr / Jun 3, 2027` | "6.5 hours left, estimated June 3, 2027" |
| Time or fixed date | `Today`, `Tomorrow`, `in 2 days`, `Nov 12` | "Due today", "Due in 2 days, Thursday November 5" |
| Overdue (time) | badge "Overdue" + `since Oct 28` | "Overdue since October 28" |
| Overdue (reading) | badge "Overdue" + `120 mi over` | "Overdue, 120 miles over" |
| No estimate (D11, pending) | `63 hr` | "63 hours left. No date estimated yet." |
| Estimate passed or 0 left (D11, pending) | `Due now` | "Due now. …add a reading to update it." |
| No reading (D11, pending) | `Add a reading` (accent) | "No hour reading yet. Add a reading." |

The amount and the date are two no-wrap chunks, so a long value breaks between them, never inside one. Units: "mi", and "hr" for every amount (data-model 3.3a). The year shows only outside the current year.

**Overdue.** Never shown by color alone: tinted row, plus a badge with a warning-triangle icon and the word "Overdue", plus words in the due text.

**Card.** `--surface`, 1 px `--line`, 12 px radius, 16 px padding.

**Thing row.** The `.arow` from Settings C: a 40 px icon tile, name, a meta line ("48,210 mi · 31.4 MPG lifetime", "12 tasks") and a chevron. Engines add a line with the reading and a 44 px "Add reading" button.

**Badge.** 12 px / 700 text on a tinted pill, always with a word, often an icon: Overdue (err), Done (ok), Skipped (muted), warning (wait).

**Chips.** 44 px pills with a `--line-strong` border. Filters and multi-select use `aria-pressed`; selected chips are `--accent` with `--accent-ink`. They wrap, never scroll sideways. A count sits inside in muted text.

**Search.** A 46 px input with a search icon at the left, a hidden `<label>`, and a live result count (Settings C).

**Pick card (onboarding).** A 76 px toggle button with `aria-pressed`, a jar icon, a name and a one-line description, and a drawn check box that fills when picked (shape change, not just color).

**Dialog / sheet.** Bottom-anchored, `role="dialog" aria-modal="true"`, labelled by its H2. The primary action comes first and the secondary is an outlined button. Cancel or Escape changes nothing.

**Toast.** `role="status"`, ink on bg, with an Undo button (44 px). Shown after Done or Skip.

**Pending tag (mockups only).** A dashed `--wait` pill with a clock icon, reading "pending owner decision". Not an app component.

## 5. Icons
- 24 px grid, 2 px stroke, round caps and joins, no fill, `currentColor`. Drawn at 20-22 px in rows and buttons, 14-18 px in badges and actions, 72 px for empty states.
- Jar icons: car (Vehicles), house (Home), heart (Health), dollar (Finance). Things: car, house, small engine, person, dollar. Pantry: cabinet (decided).
- Icons are `aria-hidden`; meaning always comes from text next to the icon or from the accessible name. Icon-only buttons (gear) get `aria-label`.
- The jar tab icon is the category icon at 12 px inside a 32 px jar outline, at stroke 1.5 after scaling.
- No emoji in the UI. No brand logos.

## 6. Copy voice
- Plain first, pun second. Every label must make sense to someone who doesn't get the joke: "Done", "Skip", "Add reading", "This week". The theme lives in headers, empty states and confirmations, never in buttons or errors.
- Short sentences, second person, no exclamation marks in errors.
- Errors say what happened, whether anything was lost, and what to do next.
- Numbers: "1,200 mi", "6.5 hr", "Dec 12", "Jan 4, 2027". No "about", "~" or "est." on screen (decided). Screen readers say "estimated".
- Health and Finance copy never names a condition or an amount.

### Empty-state lines (rotate on This week when it's empty)
1. Everything's sealed tight. Nothing to pickle this week.
2. All jars sealed and on the shelf.
3. Lids on, labels straight. Nothing due this week.
4. The pantry's in order. Put your feet up.
5. Nothing's bubbling this week.
6. Quiet shelves this week. Everything's keeping nicely.
7. No jars need opening this week.
8. Not a dill thing to do this week.

Other empty states: "Empty shelves." (no things), "This jar's still empty." (an empty jar), "No deadlines this week. Your coins are in the jar." (Finance, This week). Done confirmation: "Sealed. Next oil change on 2012 Tacoma: 5,000 mi / May 3."

## 7. Open items in this system
- `--err-ink` and `--line-strong` are proposed (open question in docs/open-questions.md).
- Bottom bar semantics (nav and links, not a tablist) is a design choice for the owner to confirm.
- The 6 other palettes haven't been contrast-checked.
