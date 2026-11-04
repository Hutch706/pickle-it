# Settings layout: three options

Status: mockups for the owner to choose from (decision logged 2026-11-03: "Layout to be chosen from three mockups"). Nothing here is final.

Mockups (open in any browser):
- [settings-option-a.html](settings-option-a.html): one Assets tab, grouped by jar
- [settings-option-b.html](settings-option-b.html): a tab per jar (App, Vehicles, Home, Health, Finance)
- [settings-option-c.html](settings-option-c.html): Assets first, with search and jar filter chips *(recommended)*

Every file shows the same shared pieces, so they compare fairly: the Pantry entry point (gear button in the header), the App settings tab, a vehicle and a small-engine detail with their tasks, the task editor (combined measure), the delete-all-data steps, empty and long-list states, and the 320 px checks.

## Comparison

| | A. One Assets tab | B. Tab per jar | C. Assets first + filters |
|---|---|---|---|
| Settings tabs | 2: App settings, Assets | 5: App, Vehicles, Home, Health, Finance | 2: Assets, App settings |
| Taps from Pantry to a task | 4 (gear, Assets, asset, task) | 4 (gear, jar tab, asset, task) | 3 (gear, asset, task); opens on Assets and remembers the last tab |
| Many assets (27 in the long state) | Fair. Collapsible groups help, but Home alone can be 20+ rows with no way to search | Good per jar, but each tab is still an unsearchable list | Best. Search (asset and task names) plus jar chips narrow 27 to a handful |
| Fit at 320 px | Good. 2 tabs, about 140 px each | Poor. The 5-tab strip already overflows at 390 px; at 320 only about 3 tabs show and the rest need a sideways scroll | Good. 2 tabs; chips wrap to two rows instead of scrolling |
| Hidden jars (decided feature) | Group stays, marked hidden | Tab stays, note inside | Chip stays; group marked "(hidden jar)" |
| Accessibility | Simple tablist; groups are native `details` | Off-screen tabs are easy to miss, by sight and by screen reader; long strip means many arrow-key presses | Simple tablist; chips are toggle buttons (`aria-pressed`) with a live count ("4 of 21 Home assets match") |
| Build cost | Lowest | Low, but needs a scrolling tab strip | A plus a search box and a filter (small) |

## Recommendation: C

Settings has two jobs with very different frequencies. Appearance, backup and install are set once and rarely touched; assets and their tasks get edited whenever something changes (new car, new mower, a schedule tweak). C opens on the frequent job and keeps the rare one a tap away. It keeps A's single list (one place to look, works for someone with one car and nothing else) and gets B's narrowing without B's five-tab strip, which doesn't fit even at 390 px. Search matching task names also answers questions like "which machines need oil?" that neither A nor B can.

If the owner prefers App settings to open first, C still works: only the tab order changes, and taps-to-task goes back to 4.

## Shared details (same in all three)

- **Entry:** a 44 x 44 px gear button in the Pantry header, accessible name "Settings". No Settings tab in the bottom bar.
- **Settings screen:** a "‹ Pantry" back link, an H1, then a `role="tablist"` with `aria-label="Settings sections"`. Each tab is a `button role="tab"` with `aria-selected`, `aria-controls` and roving `tabindex`; each panel is `role="tabpanel"` with `aria-labelledby`. Arrow keys move between tabs (build note).
- **App settings:** Theme (Light / Dark / System as a radio group), color palette (7 swatches as a radio group, each with its name and a check mark on the chosen one, so it doesn't rely on color), Jars on the tab bar (switches), Backup (export, the "isn't encrypted" warning, import with preview then Merge or Replace), Storage on this device (existing copy), Install as an app (existing steps), Start over (Delete all data).
- **Task rows:** name, schedule in plain words ("Every 5,000 mi or 6 months", "Every 50 hr or 1 year", "Each spring · Apr 1"), and due text in the decided format ("1,240 mi / Dec 18", "12 hr / May 3"). Overdue rows say "Overdue" and "since Oct 20" in words, plus a tint and icon, so status isn't color alone.
- **Delete all data:** Step 1 dialog lists what will go, says when the last backup was, and makes "Export a backup first" the primary button. Step 2 asks the user to type DELETE (either case); the red button stays off until it matches. Afterwards the user lands on the empty Pantry with Set something up and Import a backup. Typing a word was chosen over press-and-hold because it works with switch access, screen readers and shaky hands.

## Checks

**Contrast (WCAG 2.2 AA), Green palette, light / dark:**

| Pair | Light | Dark | Result |
|---|---|---|---|
| ink on surface | 16.3 | 13.9 | Pass |
| muted on surface / bg | 5.7 / 5.1 | 6.8 / 7.6 | Pass |
| accent on surface (links, active text) | 6.4 | 8.1 | Pass |
| accent-ink on accent (buttons, selected tab) | 6.4 | 9.0 | Pass |
| err on surface / err-bg (Overdue, delete link) | 6.5 / 5.6 | 7.3 / 7.0 | Pass |
| wait on wait-bg (backup warning) | 4.9 | 8.4 | Pass |
| ok on ok-bg | 4.50 | 8.2 | Pass, with no margin in light |
| **white on err** (`.save.danger` in app.css) | 6.5 | **2.3** | **Fails in dark.** Proposed fix: new token `--err-ink` (white in light, `#1a0b0a` in dark, 8.4:1). Used in these mockups. |
| **--line on surface** (input and button borders) | **1.4** | **1.3** | **Fails 3:1 for control boundaries (1.4.11).** Proposed fix: new token `--line-strong` for control borders and switch tracks: `#7a867c` light (3.8 on surface, 3.4 on bg), `#6f7f72` dark (3.9 / 4.4). Keep `--line` for dividers. Used in these mockups. |
| **backup dot** (`--display-fg` on surface, today's Settings tab dot) | **1.4** | 11.9 | **Fails 3:1 in light.** The jar red dot in these mockups uses `--err` (6.5:1) with a white ring and hidden text ", has items due this week". |

Only Green was checked. The other 6 palettes need the same pass before build (qa-accessibility-tester).

**Touch targets:** every button, link, tab, chip, swatch and switch in the mockups is at least 44 x 44 px (checked by measuring the rendered page). The task rows and asset rows are 64 px tall.

**Pantry bottom bar at 320 px:** fits. Pantry ≈ 71 px wide, each jar ≈ 62 px, all above 44 px; 12 px labels fit ("Vehicles" is the longest). At the largest text sizes the labels no longer fit and are cut with "…" (frame ·320L in each file); the full jar name stays in the accessible name. If the owner wants no truncation, the fallback is icon-only jar tabs at large text sizes. Hiding a jar (decided) gives the rest more room.

## Needs a decision (new design choices in these mockups)

1. **Which layout:** A, B or C. Recommend C.
2. **Which tab opens first:** Assets (recommended, frequent job) or App settings. Either way, remember the last tab used.
3. **Jar visibility lives in App settings** as "Jars on the tab bar" switches. Alternative: a switch on each jar's group in Assets. Recommend App settings, next to the other look-and-feel choices.
4. **Does Delete all data also reset theme and palette?** Recommend yes (a true fresh start, e.g. before handing the phone on), and say so in step 1.
5. **Confirm word:** DELETE, either case. Alternatives: the app name, or a press-and-hold button (not recommended for accessibility).
6. **Appliances can name a place** ("Furnace · Main house"). This is optional in the mockups and needs a data-architect check, since the data model doesn't link one thing to another yet.
7. **Settings hides the bottom tab bar** (it's a sub-screen with a Back link). Alternative: keep the bar visible. Recommend hiding it for space; Back is one tap.
8. **Two new color tokens** (`--err-ink`, `--line-strong`) to fix the contrast failures above, across all 7 palettes.
