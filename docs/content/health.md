# Health starter library (draft for review)

Status: draft, 2026-11-03. Not yet a data file.

> **Sources checked 2026-11-03:** 4 citations opened. 2 confirmed (Dental Tribune / ADA, CDC tetanus), 2 replaced (the AAO clinical statement returned a server error (HTTP 500); the CDC flu vaccines page doesn't give the September/October timing). Numbers marked **(no source found)**: dental cleaning 6 months, annual check-up 1 year.

## Ground rules (from docs/decisions.md, 2026-11-03 Phase 1)
- **Reminders only.** Each task is an appointment or renewal reminder for one person ("Me", "Sam"). No medical fields: no diagnoses, medicines, doses or results.
- **Discreet names.** Task names show on the Pantry, so they say what to book, never why. Names like "Refill reminder" instead of a drug name.
- **Not medical advice.** The app should show, in the Health setup screen: "These are reminders, not medical advice. Set each one to what your doctor, dentist or pharmacist recommends for you."
- Schedules use only `time` rules (v1-scope 4.6: no miles or hours in Health).
- **(no source found)** marks a number no reputable source I could open supports. **(unsure)** marks a choice that is my proposal.

## Tasks (6)

### 1. Dental cleaning
- Why: regular visits catch problems early.
- Schedule: `time {n: 6, unit: month, from: done}`
- Season: none
- DIY or pro: pro
- Source: the American Dental Association recommends regular visits at intervals set by your dentist, not a fixed interval (ADA statement as reported by Dental Tribune: https://us.dental-tribune.com/news/ada-issues-statement-on-regular-dental-visits). Six months is the common default many dentists use, not an official ADA rule **(no source found)**.

### 2. Eye exam
- Why: many eye conditions have no early symptoms.
- Schedule: `time {n: 2, unit: year, from: done}`
- Season: none
- DIY or pro: pro
- Source: American Academy of Ophthalmology, baseline exam at 40 for adults without risk factors, then every 2-4 years (40-54), every 1-3 years (55-64) and every 1-2 years (65+); more often with risk factors: https://www.aao.org/eye-health/ask-ophthalmologist-q/adult-eye-exams-how-often. 2 years sits inside the ranges for most adults, but the right interval depends on age and risk **(unsure: one default for all ages)**. Contact lens or glasses wearers may need a yearly prescription check.

### 3. Annual check-up
- Why: a regular visit keeps screenings and vaccines on track.
- Schedule: `time {n: 1, unit: year, from: done}`
- Season: none
- DIY or pro: pro
- Source: no single reputable source sets a yearly visit for everyone; how often depends on age and health, and your doctor decides **(no source found)**. Kept because it's the most common reminder people want; the name says "check-up", not "physical", to stay neutral.

### 4. Flu shot
- Why: flu vaccine is recommended every season.
- Schedule: `time {n: 1, unit: year, from: calendar}`, season "Fall"
- Proposed date: **Sep 15**
- DIY or pro: pro (doctor or pharmacy)
- Source: CDC, everyone 6 months and older, with rare exceptions, should get a flu vaccine every season; September and October are generally good times, ideally by the end of October; most adults, especially 65+, generally shouldn't get it in July or August: https://www.cdc.gov/flu/vaccines/keyfacts.html
- Regional: Southern Hemisphere flu season is roughly opposite; shift 6 months.

### 5. Tetanus booster
- Why: tetanus protection fades; adults need a booster every 10 years.
- Schedule: `time {n: 10, unit: year, from: done}`
- Season: none
- DIY or pro: pro
- Source: CDC, Td or Tdap booster every 10 years for all adults: https://www.cdc.gov/tetanus/hcp/vaccine-recommendations/index.html
- Note: the UI should allow "not sure when" (firstDue = today), since many people don't know their last one.

### 6. Refill reminder
- Why: running out of a regular prescription is easy to avoid with a reminder.
- Schedule: `time {n: 30, unit: day, from: done}`
- Season: none
- DIY or pro: pharmacy
- Source: none needed; the user sets the length to match their supply (often 30 or 90 days). Named "Refill reminder" on purpose so it doesn't reveal the medicine. Users can add a second one named "Renewal reminder" for when a prescription needs a new authorization.

Count: 6 tasks. The v1-scope target is 5-10.

## Left out on purpose
- Age- and sex-specific screenings (for example mammograms, colonoscopy): their timing depends on personal risk and changes as guidelines change, so a default would be advice. Users can add their own with a discreet name.
- Other vaccines (shingles, pneumonia, COVID-19, etc.): same reason, and recommendations change often. Users can add them as reminders.
- Medication schedules (daily doses): out of v1 per the decision.

## Regional notes
- Vaccine recommendations here are US (CDC). Other countries have their own schedules.
- Flu season timing differs by hemisphere and in the tropics.
