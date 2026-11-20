# System blueprints

Sign-in and the system states every page can fall into. All use Light unless the state appears inside a Capture screen, where it keeps Deck and stays inline on the Tap Pad or Review sheet.

## Sign-in

- Regions: centred panel with the "Splitbook" wordmark in words, one lead sentence ("See what a stopwatch can't."), and the Clerk sign-in card localised so every string says Splitbook. No other product names, logos or endorsements.
- The Clerk card is themed through its appearance variables mapped to `--sb-` roles: `surface-card`, `foreground`, `primary`, `input`, `ring`, `destructive`.
- States: signed out, signing in (`aria-busy`), error (Clerk's error inside the card), signed in (redirect to Swimmer home).
- Admin console uses its own password gate with the same panel and an "Admin console" heading.

## Empty

What is missing, why it matters, one action ([data-display.md](../components/data-display.md#empty-state--sb-empty-state)). Never blame: "No Sessions yet for Maya." not "You haven't recorded anything."

## Loading

Skeleton in the final layout with a text label; `aria-busy` on the region. No spinners on whole pages. The pulse runs three times and stops under reduced motion.

## Offline

- Desk: a status line under the app bar: "You're offline. Showing what's saved on this device." Actions that need the server are disabled with that reason.
- Capture: everything works. The Tap Pad and Review sheet save to the device; the status line says "Saved on this phone. Will sync when you're back online." Nothing blocks or opens a dialog.
- Back online: "Synced 3 Swims." as a toast on desk pages; a status line on Capture.

## Error

- Recoverable: alert in the feedback slot with what happened, what still worked, and "Try again".
- During Capture: never a dialog. The status line keeps the taps safe and offers "Try again" after the Swim.
- Copy: "We couldn't load Maya's trends. Your Sessions are safe. Try again." No codes in the headline; an optional detail line can hold a reference.

## Not found

- Regions: heading "We can't find that page", one sentence, links to Swimmer home and Sessions.
- A Swim or Session that was deleted: "This Swim was deleted." with "Back to Session".

## Accessibility

Every system state moves focus to its heading when it replaces page content, and announces through `role="status"` (or `role="alert"` for blocking errors).
