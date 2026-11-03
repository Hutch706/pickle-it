# Pickle It: product brief

## Concept
A maintenance tracker for the things people own. Theme: "preserving" them, told through pickling and canning (a pantry, jars, sealed lids).

## Sections (jars)
1. Vehicles: fuel receipts, MPG per vehicle, and maintenance schedules. Maintenance may be done at a dealership, an independent shop, or DIY. Starts from the imported Vehicle Maintenance App.
2. Home: time-based recurring tasks for the home's physical upkeep, medium and large appliances, and yard work. Examples: spring AC tune-up, fall furnace tune-up, winterizing outdoor small engines.
3. Health and Finance: in v1, details not yet defined.
4. Pets: placeholder shown in mockups only. Not in v1.

The imported code is vehicle-only. It gets reworked so each category is a jar on the same task model.

## Recurring tasks
A task repeats by whatever measure fits it:
- Odometer miles (vehicle oil changes)
- Months or another time interval (furnace filters)
- Hours of use (small engine machines)
- Fixed recurring dates (prepping for winter, biweekly recycling drop-off)

## Navigation (decided)
- Bottom tab bar.
- Far left: "Pantry" home tab, styled as the main space: raised, solid green rounded square, white pantry cabinet icon, thin divider after it.
- One tab per category, drawn as a jar outline with the category icon inside. Red dot on a jar when something is due.
- Active jar: filled green jar, white icon, bold green label. When a jar is active, the Pantry tab switches to an outlined style.
- Pantry icon: cabinet (a pressure-cooker icon was mocked as an alternative and not chosen).
- The Pantry tab bar replaces the imported app's Log / Vehicles / Settings tabs. What tabs or sections each jar has inside is not decided yet.

## Pantry home
- Header: "PICKLE IT" / "Your pantry" / "N things need attention this week".
- Three collapsible due-date boxes: This week, This month (2-4 weeks), Later. Each list caps at 50 items.
- When nothing is due this week, show a witty canning line, e.g. "Everything's sealed tight. Nothing to pickle this week." or "All jars sealed and on the shelf."
- The screen scrolls above the bottom bar so the tabs stay reachable.

## Look
- Fonts and colors follow app.css from the Vehicle Maintenance App.
- Green is the default palette. All palettes stay selectable, each with light and dark mode.

## Related apps (outside this repo)
- Vehicle Maintenance App: the current shareable app on GitHub Pages (local-only, manual entry, CSV import/export, no login). It stays live and unchanged while Pickle It is built.
- The owner's personal version: separate and private, not part of this repo.

## Existing mockups
Made in the owner's planning chat: "Pickle It Navigation Options" and "Pickle It Pantry + Jar Tabs" (the chosen design). Ask the owner for screenshots or exports when needed.
