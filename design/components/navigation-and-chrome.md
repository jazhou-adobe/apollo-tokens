# Navigation and chrome

The frame around every Splitbook page: app bar, side navigation (desk), bottom navigation (phone), breadcrumbs, links, skip link, tabs and the Profile switcher. Chrome is quiet ink on `background`; it never uses the four hand colours.

## Page chrome at a glance

| Context | Chrome |
|---|---|
| Desk pages (Light), ≥ 64rem | Skip link → app bar → side nav + main |
| Desk pages, < 64rem | Skip link → app bar (with menu button opening the side nav in a sheet) → main → bottom nav |
| Capture screens (Deck) | Skip link → slim app bar (Swim title, Profile, End Swim) → main. **No bottom nav and no side nav while a Swim is recording**, so nothing can be hit by accident |
| Admin console (compact) | Skip link → app bar marked "Admin console" → side nav listing Configuration areas → main |

## App bar — `.sb-app-bar`

- Anatomy: Splitbook wordmark (text, links home), current Swimmer via the Profile switcher, page actions, account menu.
- Tokens: `background`, `foreground`, `border` (bottom rule), `--sb-layer-*` for stickiness.
- Sticky by default (`data-static="true"` for examples inside a page). A page under the sticky bar sets `scroll-padding-block-start` to the bar's height (`--sb-control-size-lg` plus `--sb-space-6`), so a focused control or a scrolled-to target never lands underneath it.
- Landmark: `<header>` with the nav inside `<nav aria-label="Main">`.
- The wordmark is "Splitbook" in words. No other brand marks.

## Side nav — `.sb-side-nav`

- Desk: Home, Sessions, Trends, Swimmers, Account defaults. Admin console: Configuration, Metric definitions, Capture templates, Versions.
- Current page: `aria-current="page"`, bold label and a `muted` fill across the whole item (never a side stripe).
- Below 64rem it moves into a `start` sheet ([overlays.md](overlays.md#sheet--sb-sheet)).

## Bottom nav — `.sb-bottom-nav`

Phone desk pages only: up to four destinations with icon and word (Home, Sessions, Trends, Swimmers). Hidden during Capture. Targets at `button-min-target`. `aria-current="page"` on the current item.

## Breadcrumbs — `.sb-breadcrumbs`

`<nav aria-label="Breadcrumb">` with an ordered list; the last item has `aria-current="page"` ([APG Breadcrumb](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)). Use on Swim detail ("Sessions › 14 Nov › Swim 3") and Admin editors. Below 48rem show only a back link to the parent.

## Link — `.sb-link`

Underlined text in `foreground` (not `metric`; blue is a hand, not a link colour). Hover thickens the underline. External links say so in words. Use `.sb-button[data-variant="link"]` for in-place actions.

## Skip link — `.sb-skip-link`

First focusable element on every page: "Skip to main content". Visually hidden until focused, then shown on `surface-card` above everything (`--sb-layer-*`).

## Tabs — `.sb-tabs`

Switch views of one object: Swim detail (Lengths · Technique · Faults · Context), Trends (Metric trends · Technique trend).

- Anatomy: `role="tablist"` with `role="tab"` buttons and `role="tabpanel"` regions.
- Selected: `aria-selected="true"`, bold label and a heavy underline in `foreground`.
- Keyboard ([APG Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)): Left/Right move and select, Home/End jump, Tab moves into the panel.
- Never inside the live Tap Pad.

## Profile switcher — `.sb-profile-switcher`

Chooses the active Swimmer. An Account holds one or more Profiles; everything on the page belongs to the selected one.

- Anatomy: a menu button showing the avatar (initials) and the Swimmer's name; a menu of Swimmers as `menuitemradio`, then "Add a Swimmer" and "Manage Swimmers".
- Keyboard: [APG Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/). Enter, Space or Down opens on the checked item; arrows move; Enter selects and returns focus.
- The checked Swimmer shows a check icon and bold name, not colour alone.
- States: one Swimmer (still a menu, so "Add a Swimmer" is reachable), several, none (renders "Add a Swimmer" as a button).
- While a Swim is recording the switcher is read-only: the Swimmer's name shows, the menu does not open. Switching mid-Swim would lose the watcher's place.

## Accessibility summary

- Landmarks: `header`, `nav` (labelled), `main`, optional `aside`, `footer`.
- One `h1` per page: the page title, not the wordmark.
- Every navigation target meets the current `button-min-target`.

## Agent recipe

1. Pick the context row in the table above.
2. Desk: app bar + side nav (≥ 64rem) or bottom nav (< 64rem). Capture: slim app bar only.
3. Put the Profile switcher in the app bar on every watcher page.
4. Mark the current page with `aria-current="page"`.
