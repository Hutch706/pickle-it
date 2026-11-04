# Home starter library (draft for review)

Status: draft, updated 2026-11-03 with the owner's Phase 2 decisions (docs/decisions.md). Not yet a data file; that waits until docs/specs/data-model.md is approved.

> **Sources checked 2026-11-03:** 19 citations opened. 11 confirmed, 7 replaced (the ENERGY STAR checklist page doesn't give the 3-month filter change; the CSIA FAQ and the Briggs & Stratton tune-up page are gone (HTTP 404); the NFPA smoke alarm page text couldn't be read (x2); the Toro ManualsLib page has no oil interval (x2)), 1 unsupported (Honda EU2200i: couldn't read the manual's schedule). Numbers marked **(no source found)**: riding mower 100 hours, generator 6 months / 100 hours. These stay as editable defaults, marked (decided); the generator interval itself is still awaiting the owner. Dates and `remind` values are product picks, not sourced numbers.

## How to read this
- **Schedule** uses the data-model's terms:
  - `time {n, unit, from}`: `from: done` restarts when done; `from: calendar` stays on fixed dates every year.
  - `hours {every, remind}`: hours of use, read from the machine's hour meter.
  - Two rules mean "whichever comes first". Only hours + time is used here.
- **Things** (decided): the house is one thing ("Home"). **Tasks 1-12 sit on Home by default**, including the appliance ones (water heater, dryer vent, fridge coils); users can make an appliance its own thing and move its tasks there. **Each small engine is its own thing** ("Mower", "Snow blower", "String trimmer", "Generator") with its own hour reading. Tasks below are grouped by the thing they belong to.
- **Seasons and dates** (decided: fixed calendar dates): Northern Hemisphere, temperate US climate. Each seasonal task has a date (`firstDue` month and day for a calendar-yearly rule); the user can edit it. Southern Hemisphere: shift 6 months.
- Seasonal dates at a glance: AC tune-up Apr 1; mower oil (time-only option) Apr 1; store snow blower Apr 1; gutters May 1 and Nov 1; chimney Aug 15; furnace tune-up Sep 15; outdoor faucets Oct 15; snow blower oil Oct 15; store mower Nov 1; store string trimmer Nov 1.
- **Machines without an hour meter:** every hours + time task also lists a **time-only option**. The add-task screen should offer it when the user says the machine has no hour meter.
- **(no source found)** marks a number no reputable source I could open supports; it stays as an editable default. **(unsure)** marks a source or choice I couldn't fully confirm.
- Intervals are starting suggestions. Owner's manuals for each appliance and engine come first.

## Home (the house)

### 1. Check or change HVAC filter
- Why: a dirty filter slows airflow, wastes energy and can damage the system.
- Schedule: `time {n: 3, unit: month, from: done}`
- Season: none (all year)
- DIY or pro: DIY
- Source: ENERGY STAR, check the filter every month (especially in winter and summer) and, at a minimum, change it every 3 months: https://www.energystar.gov/saveathome/heating-cooling
- Note: pets, allergies or heavy use mean more often. Users can set 1 or 2 months.

### 2. AC tune-up (spring)
- Why: a pro check before hot weather catches problems before you need cooling, and before contractors get busy.
- Schedule: `time {n: 1, unit: year, from: calendar}`, season "Spring"
- Date: **Apr 1**
- DIY or pro: pro
- Source: ENERGY STAR, check the cooling system in spring and heating in fall: https://www.energystar.gov/saveathome/heating-cooling/maintenance-checklist
- Regional: hot southern climates (Gulf Coast, Southwest) need cooling earlier; Mar 1 may suit them better. Homes with a heat pump can do one visit per season covering both.

### 3. Furnace or heating tune-up (fall)
- Why: a pro check before cold weather lowers the chance of a no-heat breakdown and checks for safety problems in fuel-burning systems.
- Schedule: `time {n: 1, unit: year, from: calendar}`, season "Fall"
- Date: **Sep 15**
- DIY or pro: pro
- Source: ENERGY STAR (same page as above).
- Regional: northern and mountain areas may want Sep 1; mild climates can go to Oct 1.

### 4. Chimney and fireplace inspection (if you have one)
- Why: creosote buildup and cracks can cause chimney fires or let combustion gases into the house.
- Schedule: `time {n: 1, unit: year, from: calendar}`, season "Late summer"
- Date: **Aug 15** (before heating season; sweeps book up in fall; the day is a product pick)
- DIY or pro: pro (certified chimney sweep)
- Source: NFPA 211, chimneys, fireplaces and vents inspected at least once a year; CSIA follows NFPA 211 and quotes it: https://www.csia.org/homeowner-resources
- Offer unchecked by default; many homes don't have one.

### 5. Test smoke and CO alarms
- Why: alarms fail quietly; a monthly test is the only way to know they work.
- Schedule: `time {n: 1, unit: month, from: done}`
- Season: none
- DIY or pro: DIY (press the test button)
- Source: US Fire Administration, test smoke alarms every month: https://www.usfa.fema.gov/prevention/home-fires/prepare-for-fire/smoke-alarms/. CPSC, test smoke and CO alarms monthly: https://www.cpsc.gov/Safety-Education/Safety-Education-Centers/Carbon-Monoxide-Information-Center/CO-Alarms

### 6. Replace smoke alarms
- Why: sensors wear out; alarms should be replaced by age, even if they still beep on test.
- Schedule: `time {n: 10, unit: year, from: done}`. The UI should ask for the **manufacture date** printed on the back and set `firstDue` = that date + 10 years.
- DIY or pro: DIY (pro or electrician for hard-wired units, if unsure)
- Source: US Fire Administration, replace smoke alarms 10 years from the manufacture date (alarms with sealed 10-year batteries: follow the manufacturer): https://www.usfa.fema.gov/prevention/home-fires/prepare-for-fire/smoke-alarms/

### 7. Replace CO alarms
- Why: CO sensors have a set life; an expired one may not warn you.
- Schedule (decided): ask for the **replace-by date** printed on the alarm and use it as `firstDue`. Fallback when there's no printed date: `time {n: 7, unit: year, from: done}`, counted from the install date.
- DIY or pro: DIY
- Source: Kidde, replace CO alarms every 7 to 10 years depending on model (10 years for its alarms made since 2013, 7 before that), or when the end-of-life signal sounds: https://kidde.com/home-safety/en/us/support/replace-and-upgrade. CPSC said replace CO alarms every five years, but that release is from 2007: https://www.cpsc.gov/Newsroom/News-Releases/2008/When-Changing-Clocks-Back-to-Standard-Time-Check-Batteries-and-Age-of-Alarms-CPSC-Recommends-Replacing-Older-Alarms. 7 years is the low end of Kidde's range, so the fallback errs safe.

### 8. Flush water heater
- Why: sediment builds up in the tank, which shortens its life and wastes energy.
- Schedule: `time {n: 1, unit: year, from: done}`
- Season: none
- DIY or pro: either (follow the manual: power or gas off first, hot water)
- Source: Energy Trust of Oregon, plumbers recommend draining and flushing at least once a year: https://www.energytrust.org/tips/drain-flush-and-save-water-heater-maintenance-101/. Also the water heater's owner's manual.
- Regional: hard-water areas may need it more often. Tankless heaters have a different task (descaling); not covered.

### 9. Clean gutters (spring and fall)
- Why: clogged gutters overflow, which can damage the roof, siding and foundation, and in winter cause ice dams.
- Schedule: `time {n: 6, unit: month, from: calendar}`, season "Spring and fall"
- Dates: **May 1 and Nov 1** (`firstDue` on whichever comes next). Nov 1 is after most leaves fall in the north.
- DIY or pro: either (ladder work; pro if it's two stories)
- Source: AAA Northeast magazine, clean gutters at least twice a year, in spring and fall: https://magazine.northeast.aaa.com/?p=51202. Connecticut Insurance Dept. lists gutter cleaning in fall maintenance, since debris freezes in gutters after the first frost: https://portal.ct.gov/cid/consumer-information-center/consumer-alerts/2023-consumer-alerts/october-11. Not a primary trade or government standard **(unsure: source strength)**.
- Regional: heavy tree cover means more often; dry climates may need once a year. Pines drop needles year-round.

### 10. Winterize outdoor faucets (winter prep)
- Why: water left in outdoor faucets and hoses can freeze, expand and crack pipes inside the wall.
- Schedule: `time {n: 1, unit: year, from: calendar}`, season "Fall"
- Date: **Oct 15** (the fixed-date "winter prep" task the spec asks for)
- DIY or pro: DIY (disconnect hoses, shut the indoor valve, drain the line)
- Source: Connecticut Insurance Dept., detach outdoor hoses and shut off the water valve to prevent freezing: https://portal.ct.gov/cid/consumer-information-center/consumer-alerts/2023-consumer-alerts/october-11
- Regional: the date should be before the first hard freeze. Northern states and mountains: Oct 1 or earlier. Frost-free areas (much of FL, southern CA, HI): skip this task.

### 11. Clean dryer vent duct
- Why: lint buildup in the vent is a leading cause of dryer fires.
- Schedule: `time {n: 1, unit: year, from: done}`
- Season: none
- DIY or pro: either (pro for long or rooftop runs)
- Source: US Fire Administration clothes dryer fire safety flyer (not cleaning dryer vents raises fire risk; check the vent isn't damaged, crushed or restricted): https://www.usfa.fema.gov/downloads/pdf/publications/clothes_dryer_fire_safety_flyer.pdf. The yearly interval: Floyd County (IN) Fire, clean the vent pipe once a year, or more often if clothes take longer to dry: https://floydcofirein.gov/safety/clothes-dryer-fire-safety/. A local fire service, not a national standard **(unsure: source strength)**.
- Note: cleaning the lint screen after every load is a habit, not a scheduled task, so it's not in the library.

### 12. Clean refrigerator coils
- Why: dusty condenser coils make the fridge work harder and use more energy.
- Schedule: `time {n: 1, unit: year, from: done}`
- Season: none
- DIY or pro: DIY (unplug first; vacuum or coil brush)
- Source: PNNL Building America Solution Center (DOE), clean every 6-12 months: https://basc.pnnl.gov/diy-guides/clean-refrigerator-condenser-coils. Some newer fridges have no exposed coils; check the manual.

## Mower (its own thing)

### 13. Mower oil change
- Why: small engines run hot and dirty; old oil wears them out.
- Schedule: `hours {every: 50, remind: 5}` + `time {n: 1, unit: year, from: done}`
- **Time-only option (no hour meter):** `time {n: 1, unit: year, from: calendar}`, season "Spring", **Apr 1** (before the first mow).
- DIY or pro: DIY
- Source: Briggs & Stratton, change oil every 50 hours of operation or every season; new engines after the first 5 hours; more often in tough conditions (wet grass, dust, heat, hills): https://www.briggsandstratton.com/en-gb/support/faqs/lawn-mower-oil-change. Their EXi engines need no oil changes, only top-ups.
- Notes: the earlier draft said riding mowers can use `every: 100`. That page doesn't say so, and I couldn't open the Briggs store page said to list it **(no source found: 100 hours)**. Riding mower users should check their manual. The 5-hour break-in change isn't in the default; a one-off custom task covers it. `remind: 5` is my product pick, not a sourced number.

### 14. Store mower for winter
- Why: untreated gas goes stale over the off-season and gums up the carburetor.
- Schedule: `time {n: 1, unit: year, from: calendar}`, season "Fall"
- Date: **Nov 1** (after the last mow)
- DIY or pro: DIY (add fuel stabilizer and run it, or run the tank dry, per the manual)
- Source: Briggs & Stratton, gas can begin to degrade in as little as 30 days; add fuel stabilizer and run the engine a few minutes, or (without stabilizer, or with alcohol-blend fuel) empty the tank and run the engine until it stops: https://www.briggsandstratton.com/en-us/support/maintenance-how-to/storing-your-equipment. Owner's manual for the method.
- Regional: in the South, mowing can run into December or year-round; users can pause this task.

## Snow blower (its own thing)

### 15. Snow blower oil change
- Why: same as the mower; and oil left dirty over the summer can cause sludge and corrosion.
- Schedule: `time {n: 1, unit: year, from: calendar}`, season "Fall", **Oct 15** (before the first snow). Optional `hours {every: <from manual>}`.
- **Time-only is the default here** because I found no reputable hours figure that applies across brands **(unsure: hours)**. The owner's manual hour figure can be added as an hours rule.
- DIY or pro: DIY
- Source: Toro SnowMaster 724/824 QXE operator's manual (on Toro's site), change the engine oil after the first 2 hours, then yearly: https://manuals.toro.com/257356/. One model; other brands and models may differ.

### 16. Store snow blower for summer
- Why: stale fuel over summer is the most common reason a snow blower won't start in the first storm.
- Schedule: `time {n: 1, unit: year, from: calendar}`, season "Spring"
- Date: **Apr 1**
- DIY or pro: DIY (stabilize or drain fuel per the manual)
- Source: Toro SnowMaster manual (same as 15), add fuel stabilizer on the last refueling of the season and run the engine 10 minutes, then siphon the tank or run it until it stops; don't store fuel over the off-season without stabilizer.
- Regional: snow belt and mountain areas may want May 1. Areas without snow won't own one.

## String trimmer (its own thing)

### 17. Store string trimmer for winter
- Why: two-stroke trimmers have no oil to change, so fuel is the main storage risk; stale mixed fuel clogs the carburetor.
- Schedule: `time {n: 1, unit: year, from: calendar}`, season "Fall", **Nov 1**
- DIY or pro: DIY (drain or stabilize fuel, clean the air filter, per the manual)
- Source: owner's manual. I didn't find a reputable cross-brand source for trimmer storage **(unsure: source)**. Four-stroke trimmers also need an oil change; the user can add one.

## Generator (its own thing)

### 18. Generator oil change
- Why: a generator only matters during an outage; old oil or a neglected engine is how it fails then.
- Schedule: `hours {every: 100, remind: 10}` + `time {n: 6, unit: month, from: done}` **(no source found: both numbers)**. **Still open, awaiting the owner** (docs/open-questions.md); ships as an editable default until decided.
- **Time-only option (no hour meter):** `time {n: 6, unit: month, from: done}`
- DIY or pro: DIY (portable); pro for standby (whole-house) generators
- Source: Honda EU2200i owner's manual, maintenance schedule on page 60 of this copy: https://www.manualslib.com/manual/2273617/Honda-Eu2200i.html?page=60. I couldn't read the schedule table cleanly; one extraction suggested every 3 months or 50 hours, which conflicts with the 6 months / 100 hours in this draft. I couldn't read Honda's own PDF either **(no source found: 6 months and 100 hours)**. Other brands differ. `remind: 10` is my product pick.
- Regional: hurricane areas may want it before June 1 (start of the Atlantic hurricane season); cold areas before winter storms.

Count: 18 tasks (12 house, 6 small engine). The v1-scope target is 15-25.

## Candidates left out (to keep the pantry small)
- Fire extinguisher monthly check, sump pump test, roof inspection, dishwasher filter, range hood filter, mower blade sharpening, spark plug and air filter for small engines, deck or fence sealing. All useful, but I either couldn't find a reputable interval or they apply to fewer homes. Easy to add later.

## Regional notes (summary)
- All dates assume a temperate Northern Hemisphere US climate. The user can edit any date.
- Freeze-related tasks (10, 14-16) depend on first and last frost, which varies by months across the US.
- Hot climates shift cooling earlier and stretch mowing season; snow-free areas drop snow blower tasks.
- Southern Hemisphere: shift all seasonal dates 6 months (data-model already handles hemisphere for new items).
