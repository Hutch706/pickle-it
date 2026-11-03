# Vehicles starter library (draft for review)

Status: draft, 2026-11-03. Not yet in `data.js`. The data-file version waits until docs/specs/data-model.md is approved.

## How to read this
- **Schedule** uses the data-model's terms (docs/specs/data-model.md 2.3, 3.2-3.4):
  - `miles {every, remind}`: odometer miles. Vehicles only.
  - `time {n, unit, from}`: `from: done` restarts when done; `from: calendar` stays on fixed dates.
  - Two rules on one task mean "whichever comes first" (only miles + time or hours + time are allowed).
- **Every interval is a starting suggestion.** The app should show, once per vehicle: "These are general defaults. Your owner's manual has the right schedule for your car. Edit any task to match it." Manufacturers differ a lot (for example, many newer cars list oil changes at 7,500-10,000 miles with synthetic oil, and spark plugs at 100,000 miles).
- **(unsure)** marks a number I couldn't confirm from a reputable source. Those are proposals for the owner to accept, change or drop.
- Mileage values for items 1-8 are today's `STANDARD_SCHEDULE` (unchanged), so existing users see no surprise. Time limits are new (allowed by the "miles + time" decision).
- Season: none of these are seasonal by default. Vehicle tasks run from last done.

## Tasks (11)

### 1. Oil and filter change
- Why: old oil stops protecting the engine; this is the most common cause of avoidable engine wear.
- Schedule: `miles {every: 5000, remind: 1000}` + `time {n: 6, unit: month, from: done}`
- DIY or pro: either
- Source: owner's manual. 5,000 miles is today's `STANDARD_SCHEDULE` value. The 6-month time limit is a common manual pattern for low-mileage driving, but I didn't find a reputable cross-make source for either number **(unsure: both)**.

### 2. Tire rotation
- Why: rotating evens out wear so tires last longer and grip evenly.
- Schedule: `miles {every: 5000, remind: 1000}`
- DIY or pro: either (most shops do it with an oil change)
- Source: NHTSA, "rotate your tires every 5,000 to 8,000 miles" if the manufacturer recommends rotation: https://www.nhtsa.gov/press-releases/june-tire-safety-month. US Tire Manufacturers Association: follow the manual, else 5,000-8,000 miles: https://www.ustires.org/ntswtoolkit. 5,000 sits at the low end of that range.

### 3. Check tire pressure and tread
- Why: underinflation is the leading cause of tire failure, and all tires slowly lose air.
- Schedule: `time {n: 1, unit: month, from: done}`
- DIY or pro: DIY (gauge, tires cold; use the door-jamb label, not the number on the tire)
- Source: NHTSA tires page, check all tires including the spare at least once a month: https://www.nhtsa.gov/vehicle-safety/tires
- Note: this is the only monthly vehicle task. If the owner thinks it's too noisy for the Pantry, drop it or default it to paused.

### 4. Cabin air filter
- Why: keeps dust and pollen out of the cabin and lets the AC and defroster blow properly.
- Schedule: `miles {every: 15000, remind: 1000}` + `time {n: 1, unit: year, from: done}` **(unsure: time limit)**
- DIY or pro: DIY on most cars (often behind the glovebox)
- Source: owner's manual. Mileage is today's default; I found no single reputable figure, and some manuals don't list this filter at all **(unsure)**.

### 5. Engine air filter
- Why: a clogged filter starves the engine of air.
- Schedule: `miles {every: 30000, remind: 5000}`
- DIY or pro: DIY on most cars
- Source: owner's manual. The Car Care Council's general guidance is to inspect it at oil changes rather than give a fixed interval (as reported by Counterman: https://www.counterman.com/maintenance-minded/). 30,000 is today's default **(unsure)**; dusty or unpaved roads need it sooner.

### 6. Brake fluid
- Why: brake fluid absorbs water over time, which lowers its boiling point and can corrode parts.
- Schedule: `miles {every: 30000, remind: 5000}` + `time {n: 2, unit: year, from: done}` **(unsure: both numbers)**
- DIY or pro: pro
- Source: owner's manual. Many manuals give a time-based interval (2-3 years) for brake fluid, which is why a time limit fits here, but I didn't confirm a single figure **(unsure)**.

### 7. Transmission fluid
- Why: worn fluid can lead to rough shifting and costly transmission repairs.
- Schedule: `miles {every: 60000, remind: 5000}`
- DIY or pro: pro
- Source: owner's manual. Intervals vary widely, and some automatics are listed as "lifetime" fluid **(unsure)**.

### 8. Spark plugs
- Why: worn plugs cause misfires, rough idle and worse fuel economy.
- Schedule: `miles {every: 60000, remind: 5000}`
- DIY or pro: pro (DIY on some engines)
- Source: owner's manual. Many modern engines with iridium or platinum plugs list about 100,000 miles **(unsure)**. Not relevant for electric vehicles.

### 9. Engine coolant
- Why: old coolant stops protecting against freezing, overheating and corrosion.
- Schedule: `miles {every: 100000, remind: 5000}`
- DIY or pro: pro
- Source: owner's manual. Many manuals also give a time limit (often in years) for long-life coolant; I didn't add one because figures vary by make **(unsure)**.

### 10. Wiper blades
- Why: worn blades streak and smear, which matters most in rain and snow.
- Schedule: `time {n: 6, unit: month, from: done}`
- DIY or pro: DIY
- Source: car-care guidance commonly says about every six months, or sooner when they streak or chatter (for example, Tuffy citing Car Care Council guidance: https://www.tuffy.com/car_care_news/basic-car-care-greatly-improves-safety-and-reliability). Trade-press source, not a manufacturer **(unsure)**.

### 11. Battery check
- Why: batteries usually fail without warning; a quick test catches a weak one before it strands you.
- Schedule: `time {n: 6, unit: month, from: done}`
- DIY or pro: pro test (free at many auto parts stores and repair shops)
- Source: AAA, average battery life is 3-5 years; schedule inspections at least once every six months, and test regularly after the battery hits three years: https://www.aaa.com/autorepair/articles/when-to-replace-your-cars-battery
- Regional: heat shortens battery life; cold exposes weak batteries. A good fall reminder in cold regions.

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

Count: 12 tasks plus 1 optional. The v1-scope target is 8-12. If 12 is too many, cut item 3 (monthly tire check) or item 10 (wipers) first.

## Not included (and why)
- Brake pad inspection: important, but I found no reputable interval to cite; shops usually check it at tire rotation. Candidate for later.
- Timing belt: only some engines have one and the interval is make-specific. Too risky as a generic default.
- EV-specific tasks: v1 units are miles and gallons; EV schedules differ (no oil, plugs or most filters). Flag for later.

## Regional notes
- Climate: heat, cold, dust and short trips all count as "severe" service in many manuals, which shortens oil, filter and fluid intervals.
- Registration and inspection rules are per state (US). Outside the US, these two tasks need different names and rules.
