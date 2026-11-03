# Open questions
Each needs an owner decision. Once decided, move it to docs/decisions.md.

- **Distribution:** installable web app (PWA), app stores, or both? Recommendation from: release-manager.
- **Name check:** is "Pickle It" available (app stores, domain, obvious trademark conflicts)? Research by: release-manager.
- **Personal version:** does the owner's personal version eventually move onto Pickle It, or stay separate?
- **Tabs inside each jar:** what screens or sections each jar (Vehicles, Home, Health, Finance) has. The owner decides later.
- **Health and Finance:** what these jars track in v1. Spec from: product-spec-writer.
- **Storage names on a shared web address:** the app still saves data under the Vehicle Maintenance App's names (database `vehicle-maintenance-app`, `vma:` settings keys). If both apps are hosted on the same address, such as one github.io account, they would share and could overwrite each other's data. Option A: give Pickle It its own names now, while it has no users (recommended). Option B: keep the old names so data carries over automatically on a shared address. Review by: data-architect.
