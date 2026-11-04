# Vehicles starter library (draft for review)

Status: draft, updated 2026-11-03 with the owner's Phase 2 decisions (docs/decisions.md). Not yet in `data.js`. The data-file version waits until docs/specs/data-model.md is approved.

> **Sources checked 2026-11-03:** 6 cited links opened. 1 confirmed (AAA, with wording corrected), 5 replaced (2 NHTSA pages blocked automated access (HTTP 403) so couldn't be checked, 1 USTMA page didn't give the interval, Counterman blocked access (HTTP 403), Tuffy is gone (HTTP 404)). 10 numbers have no reputable source and are marked **(no source found)**: oil 5,000 mi and 6 months, cabin filter 1 year, engine air filter 30,000 mi, brake fluid 30,000 mi and 2 years, transmission fluid 60,000 mi, spark plugs 60,000 mi, coolant 100,000 mi. Decided: they stay as editable defaults, marked.

## How to read this
- **Schedule** uses the data-model's terms (docs/specs/data-model.md 2.3, 3.2-3.4):
  - `miles {every, remind}`: odometer miles. Vehicles only.
  - `time {n, unit, from}`: `from: done` restarts when done; `from: calendar` stays on fixed dates.
  - Two rules on one task mean "whichever comes first" (only miles + time or hours + time are allowed).
- **Every interval is a starting suggestion.** The app should show, once per vehicle: "These are general defaults. Your owner's manual has the right schedule for your car. Edit any task to match it." Manufacturers differ a lot (for example, many newer cars list oil changes at 7,500-10,000 miles with synthetic oil, and spark plugs at 100,000 miles).
- **(no source found)** marks a number no reputable source I could open supports. Decided: these stay as editable defaults, shown as marked.
- Mileage values for items 1-8 are today's `STANDARD_SCHEDULE` (unchanged), so existing users see no surprise. Time limits are new (allowed by the "miles + time" decision).
- Season: only the battery check is seasonal (a fixed fall date). Every other vehicle task runs from last done.

## Tasks (12)

### 1. Oil and filter change
- Why: old oil stops protecting the engine; this is the most common cause of avoidable engine wear.
- Schedule: `miles {every: 5000, remind: 1000}` + `time {n: 6, unit: month, from: done}`
- DIY or pro: either
- Source: owner's manual. 5,000 miles is today's `STANDARD_SCHEDULE` value. The 6-month time limit is a common manual pattern for low-mileage driving. Neither number has a reputable cross-make source **(no source found: both)**.

### 2. Tire rotation
- Why: rotating evens out wear so tires last longer and grip evenly.
- Schedule: `miles {every: 5000, remind: 1000}`
- DIY or pro: either (most shops do it with an oil change)
- Source: US Tire Manufacturers Association, follow the owner's manual; if it gives no period, every 5,000 to 8,000 miles: https://www.ustires.org/tire-care-essentials. Florida Highway Safety and Motor Vehicles, rotate at least every 5,000 miles: https://www.flhsmv.gov/pdf/consumer/TireSafetyRackCardENGLISH.pdf. 5,000 sits at the low end of the USTMA range.

### 3. Check tire pressure and tread
- Why: underinflated tires build up heat and stress, which causes uneven wear and internal damage, and all tires slowly lose air.
- Schedule: `time {n: 1, unit: month, from: done}`
- DIY or pro: DIY (gauge, tires cold; use the door-jamb label, not the number on the tire)
- Source: US Tire Manufacturers Association, check pressure at least once a month when tires are cold, and check the spare too: https://www.ustires.org/tire-care-essentials. Florida HSMV also says check pressure and the spare monthly (same card as task 2).
- **Starts paused** (decided). It's the only monthly vehicle task, so it stays out of the Pantry until the user turns it on.

### 4. Cabin air filter
- Why: keeps dust and pollen out of the cabin and lets the AC and defroster blow properly.
- Schedule: `miles {every: 15000, remind: 1000}` + `time {n: 1, unit: year, from: done}` **(no source found: time limit)**
- DIY or pro: DIY on most cars (often behind the glovebox)
- Source: owner's manual. Car Care Council, replace every 12,000 to 15,000 miles or per the owner's manual, more often where the air is smoky or dusty: https://www.carcare.org/2020/11/wildfires-a-serious-concern-for-vehicles-passengers/. 15,000 (today's default) sits at the top of that range. Some manuals don't list this filter at all.

### 5. Engine air filter
- Why: a clogged filter starves the engine of air.
- Schedule (decided: 30,000 mi or 1 year, whichever comes first): `miles {every: 30000, remind: 5000}` + `time {n: 1, unit: year, from: done}`
- DIY or pro: DIY on most cars
- Source: owner's manual. Car Care Council, inspect at each oil change and replace annually or when it shows contamination: https://www.carcare.org/2020/11/wildfires-a-serious-concern-for-vehicles-passengers/. That supports the 1-year limit. 30,000 miles is today's default **(no source found)**; dusty or unpaved roads need it sooner.

### 6. Brake fluid
- Why: brake fluid absorbs water over time, which lowers its boiling point and can corrode parts.
- Schedule: `miles {every: 30000, remind: 5000}` + `time {n: 2, unit: year, from: done}` **(no source found: both numbers)**
- DIY or pro: pro
- Source: owner's manual. Many manuals give a time-based interval (2-3 years) for brake fluid, which is why a time limit fits here, but I didn't find a reputable cross-make figure **(no source found)**.

### 7. Transmission fluid
- Why: worn fluid can lead to rough shifting and costly transmission repairs.
- Schedule: `miles {every: 60000, remind: 5000}`
- DIY or pro: pro
- Source: owner's manual. Intervals vary widely, and some automatics are listed as "lifetime" fluid. 60,000 is today's default **(no source found)**.

### 8. Spark plugs
- Why: worn plugs cause misfires, rough idle and worse fuel economy.
- Schedule: `miles {every: 60000, remind: 5000}`
- DIY or pro: pro (DIY on some engines)
- Source: owner's manual. Many modern engines with iridium or platinum plugs list about 100,000 miles. 60,000 is today's default **(no source found)**. Not relevant for electric vehicles.

### 9. Engine coolant
- Why: old coolant stops protecting against freezing, overheating and corrosion.
- Schedule: `miles {every: 100000, remind: 5000}`
- DIY or pro: pro
- Source: owner's manual. Many manuals also give a time limit (often in years) for long-life coolant; I didn't add one because figures vary by make. 100,000 is a product pick **(no source found)**.

### 10. Wiper blades
- Why: worn blades streak and smear, which matters most in rain and snow.
- Schedule: `time {n: 6, unit: month, from: done}`
- DIY or pro: DIY
- Source: Car Care Council, check and change wiper blades about every six months: https://www.carcare.org/2020/10/motorist-checklist-for-fall-car-care-month-in-october/. Heat, sun and winter weather wear them faster.

### 11. Battery check
- Why: batteries usually fail without warning; a quick test catches a weak one before it strands you.
- Schedule (decided: yearly in fall): `time {n: 1, unit: year, from: calendar}`, season "Fall"
- Date: **Oct 1** (October is the Car Care Council's Fall Car Care Month; the exact day is a product pick)
- DIY or pro: pro test (free at many auto parts stores and repair shops)
- Source: AAA, batteries typically last three to five years; have it checked at every oil change or tune-up, and test it yearly after three years: https://www.aaa.com/autorepair/articles/when-to-replace-your-cars-battery. Car Care Council, test the battery every fall: https://www.carcare.org/2020/10/motorist-checklist-for-fall-car-care-month-in-october/.
- Regional: heat shortens battery life; cold exposes weak batteries. Southern Hemisphere: shift 6 months (Apr 1).

### 12. Registration renewal
- Why: driving on an expired registration can mean a ticket or fine.
- Schedule: `time {n: 1, unit: year, from: calendar}`, `firstDue` = the expiry date on the user's registration. The UI should ask for that date.
- DIY or pro: DIY (online, by mail or at the DMV)
- Source: your state's DMV. Renewal periods differ by state: many are yearly, some are every two years. The user should set `n` to match.
- Regional: some states also require a safety or emissions inspection before renewal. See the optional task below.

### Optional: State inspection (only if your state requires it)
- Why: some states require a safety and/or emissions inspection on a schedule, often tied to registration.
- Schedule: `time {n: 1, unit: year, from: calendar}`, `firstDue` from the user
- DIY or pro: pro (licensed inspection station)
- Source: your state's DMV or environmental agency. Many states have no inspection; rules vary by county, vehicle age and fuel type. Offer it, unchecked by default.

Count: 12 tasks plus 1 optional (decided: keep all 12; task 3 starts paused). The v1-scope target is 8-12.

## Not included (and why)
- Brake pad inspection: important, but I found no reputable interval to cite; shops usually check it at tire rotation. Candidate for later.
- Timing belt: only some engines have one and the interval is make-specific. Too risky as a generic default.
- EV-specific tasks: v1 units are miles and gallons; EV schedules differ (no oil, plugs or most filters). Flag for later.

## Regional notes
- Climate: heat, cold, dust and short trips all count as "severe" service in many manuals, which shortens oil, filter and fluid intervals.
- Registration and inspection rules are per state (US). Outside the US, these two tasks need different names and rules.
