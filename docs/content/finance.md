# Finance starter library (draft for review)

Status: draft, 2026-11-03. Not yet a data file.

> **Sources checked 2026-11-03:** 4 citations opened. 2 confirmed (FTC credit reports, with wording corrected; HealthCare.gov open enrollment), 2 replaced (the IRS estimated-taxes and filing pages don't list the dates). No unsupported dates. The 6-month auto policy term stays **(unsure)**; it comes from the user's policy, not a default.

## Ground rules (from docs/decisions.md, 2026-11-03 Phase 1)
- **Money deadlines only, no amounts.** Tasks are names and dates. No amounts, account numbers or passwords.
- **Not financial or tax advice.** The app should show, in the Finance setup screen: "These are date reminders, not financial or tax advice. Dates shown are common US deadlines; check your own bills, policies and the IRS for yours."
- **US-specific.** Tax dates are US federal. State taxes, property taxes and enrollment periods vary.
- Vehicle registration lives in Vehicles, not here.
- Schedules use only `time` rules.
- **(unsure)** marks anything I couldn't confirm from a reputable source.

## Tasks (8)

### 1-4. Estimated tax payment (Q1, Q2, Q3, Q4)
- Why: people with self-employment or other income without withholding pay federal tax quarterly; missing a date can mean a penalty.
- Schedule: four separate tasks, each `time {n: 1, unit: year, from: calendar}`:
  - "Estimated tax: Q1", proposed **Apr 15**
  - "Estimated tax: Q2", proposed **Jun 15**
  - "Estimated tax: Q3", proposed **Sep 15**
  - "Estimated tax: Q4", proposed **Jan 15**
- DIY or pro: either (yourself or a tax preparer)
- Source: IRS, payment periods and due dates (Apr 15, Jun 15, Sep 15, Jan 15 of the next year), and the next-business-day rule: https://www.irs.gov/faqs/estimated-tax/individuals/individuals-2
- Why four tasks, not one: the gaps are uneven (2, 3, 4 and 3 months), so one repeating rule can't hit all four dates. **For data-architect:** confirm this is the intended way, or consider a "list of yearly dates" rule later.
- Caveat: when a date falls on a weekend or legal holiday, the IRS moves it to the next business day (for example Jan 15, 2028 is a Saturday). The app's fixed dates won't shift; the setup note should say so **(known gap)**.
- Offer unchecked by default; most W-2 employees don't pay estimated tax.

### 5. File tax return
- Why: the federal filing deadline; filing late can mean penalties.
- Schedule: `time {n: 1, unit: year, from: calendar}`, proposed **Apr 15**
- DIY or pro: either
- Source: IRS, calendar-year filers file by April 15; if the 15th is a Saturday, Sunday or legal holiday, the due date moves to the next business day: https://www.irs.gov/filing/individuals/when-to-file
- Regional: some states have different filing dates; disaster areas sometimes get IRS extensions.

### 6. Insurance renewal
- Why: a missed renewal can lapse coverage; renewal is also the time to compare prices.
- Schedule: `time {n: 1, unit: year, from: calendar}`, `firstDue` = the policy's renewal date. The UI should ask for it.
- DIY or pro: DIY (or an agent)
- Source: the user's policy. No general source needed; the date comes from the policy. Auto policies often renew every 6 months, so the user may set `n: 6, unit: month` **(unsure: common term lengths vary by insurer)**.
- Suggest adding one per policy, named by type: "Home insurance renewal", "Auto insurance renewal", "Renters insurance renewal".

### 7. Annual subscription renewal
- Why: yearly subscriptions renew automatically; a reminder before the date gives time to cancel or keep it.
- Schedule: `time {n: 1, unit: year, from: calendar}`, `firstDue` = a few days before the renewal date (user picks)
- DIY or pro: DIY
- Source: none needed; the date comes from the user's own subscription. Suggest naming each one ("Streaming renewal", "Warehouse club renewal").

### 8. Check credit reports
- Why: checking catches errors and signs of identity theft early.
- Schedule: `time {n: 1, unit: year, from: done}`
- Season: none
- DIY or pro: DIY
- Source: FTC, Equifax, Experian and TransUnion have permanently extended free weekly credit reports through AnnualCreditReport.com (other sites may charge or be fraudulent): https://consumer.ftc.gov/consumer-alerts/2023/10/you-now-have-permanent-access-free-weekly-credit-reports. Yearly is a minimum reminder; users can check more often.

Count: 8 tasks (counting the four quarterly tax tasks separately). The v1-scope target is 5-10.

## Optional (offer unchecked; regional)
- **Property tax due:** `time {n: 1, unit: year, from: calendar}` or `n: 6, unit: month` for areas billed twice a year. Dates are set by the county or town; no default date is safe. Source: your local tax collector. Renters skip it. Many homeowners pay through their mortgage escrow and don't need it.
- **Health insurance open enrollment:** `time {n: 1, unit: year, from: calendar}`, proposed **Nov 1**. HealthCare.gov open enrollment starts Nov 1 and ends Jan 15, with Dec 15 the deadline for coverage from Jan 1 (confirmed for 2027 coverage). Some state marketplaces set their own dates (my note; this page doesn't say): https://www.healthcare.gov/blog/mark-open-enrollment-dates-on-your-calendar. Employer plans and Medicare have their own windows **(unsure: varies by plan)**.

## Left out on purpose
- Anything with amounts (bills, budgets, balances): out of v1 per the decision.
- Retirement contribution deadlines, required minimum distributions, FAFSA: real deadlines, but closer to advice and relevant to fewer people. Users can add their own.
- Monthly bills: most are autopay or too frequent for this jar; the user can add any as a custom task.

## Regional notes
- Everything here is US federal or US-typical. Other countries have different tax years and dates (for example the UK tax year starts Apr 6).
- State income tax estimated payments often follow the federal dates but not always.
