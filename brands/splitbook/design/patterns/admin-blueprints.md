# Admin blueprints

Admin console pages. Every Admin region sets `data-density="compact"` and uses the Light palette; the Admin console is a desk tool and never uses Deck. Shared regions: skip link, app bar marked "Admin console", side nav (Configuration areas), one `h1`, feedback slot, and the Draft/publish bar when a Draft exists ([admin-widgets.md](../components/admin-widgets.md)).

## Configuration list

- Regions: heading (area name, e.g. "Metric definitions"); toolbar (search, filters, "Add"); `.sb-config-list` table; `.sb-publish-bar`.
- States: no Draft ("No Draft. Published v12 is live." with "Start a Draft"); Draft with changes; empty area; filtered to nothing; loading (skeleton rows); error (alert; nothing changed); signed-out (redirect to the Admin password gate).

## Metric definition editor with formula preview

- Regions: breadcrumbs (Configuration › Metric definitions › Strokes per Length); editor form; for derived metrics, formula ↔ preview pair on the axis; history consequence ("Applies to") radio; save to Draft.
- States: new, editing, invalid formula (inline error naming the unknown key or operator), preview loading, preview error ("Preview couldn't run. The formula is saved to the Draft."), read-only (published Key).

## Publish with reach choice

- Regions: dialog from the publish bar: change list grouped by area; reach choice per Formula change ("All history" / "From v13 onward"); consequence summary; "Publish v13".
- States: ready, publishing (`aria-busy`), published (toast), failed (alert in dialog; Draft unchanged), conflict ("Someone published v13 while you were editing. Review their changes first.").

## Configuration version history

- Regions: table of versions; selected version view with then ↔ now pairs per changed definition; "Start a Draft from v12" action.
- States: one version only, loading, error.

## Density

`data-density="compact"` lowers `density-inset`, `density-gap`, row height and `type-body-size`; `button-min-target` stays at or above 24 CSS px. Use it only inside the Admin console.
