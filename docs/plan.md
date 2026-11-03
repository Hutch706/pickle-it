# Plan
Kept by the director. Each task: status, agent, output. Newest phase at the bottom.

## Phase 0: Setup
- [x] Agent team, brief, decision log, open questions (director)
- [x] Import the Vehicle Maintenance App code as the starting point (director)
- [x] Fill in Tech stack and Commands in CLAUDE.md, and list conflicts with docs/brief.md (director; conflicts are in docs/open-questions.md)

## Phase 1: Decide v1
- [x] v1 scope draft: docs/specs/v1-scope.md (product-spec-writer)
- [x] Storage recommendation, data model, migration plan draft: docs/specs/data-model.md (data-architect)
- [x] Distribution and name check draft: docs/release/distribution.md, checklist.md (release-manager)
- [x] Privacy review: docs/reviews/privacy-security-2026-11-03.md (privacy-security-reviewer)
- [x] Rebase onto claude/pickle-it-repo-setup-a40c79 and revise v1-scope.md and data-model.md to the logged decisions (director, product-spec-writer, data-architect)
- [x] Privacy re-review with Health and Finance in scope (privacy-security-reviewer)
- [x] Fold privacy guidance into v1-scope 4.6 (product-spec-writer); per-jar shop list and v2 import checks (data-architect)
- [x] Owner decided Phase 1 (logged 2026-11-03)
- [ ] Draft privacy policy and terms for the lawyer (release-manager)

## Phase 2: Design
- [x] Settings: three layout mockups, docs/design/settings-option-a/b/c.html (ux-designer)
- [x] Specs updated for Settings tabs, due text, delete-all, migration (product-spec-writer, data-architect)
- [x] Starter library drafts, docs/content/ (maintenance-content-curator)
- [ ] Owner decides docs/open-questions.md (Settings layout first)
- [ ] Verify every source link in docs/content/ (curator built them without opening them)
- [ ] Contrast check of the other 6 palettes and new tokens (qa-accessibility-tester)
- [ ] Privacy check of the read-only copy and delete-all scope (privacy-security-reviewer)
- [ ] Design system, Pantry home, jar screens, onboarding, empty states (ux-designer)
- [ ] Old app's final notice banner copy (release-manager)

## Phase 3: Build, test, release
Follows "How work flows" in CLAUDE.md, one screen at a time.
