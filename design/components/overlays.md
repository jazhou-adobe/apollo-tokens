# Overlays

Overlays sit above the page: a **dialog** or **sheet** that takes over until the person decides, a **menu** of actions, a **popover** that explains a term, a **tooltip** that names an icon, and a **toast** that confirms what just happened. They share one rule set: open only on the person's action, close the way people expect (Escape, Close, a click outside), never leave on a timer, and always put focus back where it came from.

**The poolside rule:** while a Swim is recording, nothing opens on its own and nothing time-critical sits behind an overlay. The wall tap, counters, undo and End Swim are always on the Tap Pad itself. Dialogs and sheets are for before and after a Swim.

## Choosing an overlay

| The person needs to… | Use | Not |
|---|---|---|
| Decide before going on: delete a Swim, discard a Draft, publish | Dialog | `window.confirm`; a dialog while recording |
| Edit one object while keeping the page in context: a Length's values, filters | Sheet | A dialog holding a long form |
| Pick one of a few actions on an object | Menu | A menu for a form value (use select or chips) |
| Read what a term means: SWOLF, DPS, breakout | Popover (toggletip) | A tooltip; touch users never see tooltips |
| Learn what an icon-only button does | Tooltip | A tooltip holding the only copy of anything |
| Know an action worked, and undo it | Toast | A toast for an error they must fix |

## Dialog — `.sb-dialog`

Native `<dialog>` opened with `showModal()`. The page behind is inert; the `scrim` covers it (solid tint, no blur; text never sits on the scrim).

- Anatomy: header (h2 title, icon-only Close with `aria-label="Close"`), body, actions row (Cancel first, primary or destructive last).
- Width: `--sb-overlay-dialog-width`; below 48rem it docks to the bottom edge as a full-width sheet.
- Tokens: `surface-card` / `surface-card-foreground`, `border`, `scrim`, `--sb-layer-*` (or the top layer).
- Variants: task dialog (focus starts in the first field); destructive confirmation (`role="alertdialog"`, title names the object, "Delete Swim 3?", description names the consequence, focus starts on Cancel, the button names the result: "Delete Swim 3").
- States: closed, open, working (`aria-busy`, "Deleting…"), failed (an alert inside says nothing changed).
- Keyboard: [APG Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) and [Alert and Message Dialogs](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/): Tab cycles inside, Escape closes (except while working), focus returns to the trigger.
- Copy: buttons are verb-first and name the result, never "OK" or "Yes".

## Sheet — `.sb-sheet`

The drawer: a modal `<dialog>` docked by `data-side` (`start`, `end`, `bottom`), with the dialog's header, focus and Close rules.

- `start`: side navigation below 64rem.
- `end`: edit one object ("Edit Length 4") at `--sb-overlay-sheet-width`.
- `bottom`: filters and short pickers on phones; the primary action says what it will show ("Show 12 Sessions").
- The Review sheet is **not** an overlay; it is a page panel ([capture-widgets.md](capture-widgets.md#review-sheet--sb-review-sheet)), so it can't be dismissed by accident.

## Menu — `.sb-menu`

[APG Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/): the trigger has `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`; the popup is `role="menu"`.

- Items: `menuitem` (an action; end with an ellipsis when it opens a dialog: "Delete Swim…"), `menuitemradio` in a labelled group (the Profile switcher), `menuitemcheckbox`.
- Destructive items go last, after a separator, with the cross icon.
- Keyboard: Enter, Space or Down opens on the first item; Up opens on the last; arrows wrap; Home/End jump; typing letters moves to a match; Escape closes and returns focus.
- Row overflow: icon-only `ghost` trigger named for its row: "More actions for Swim 3".

## Popover — `.sb-popover`

A toggletip: an icon-only help button ("More about SWOLF") that toggles a non-modal bubble at most `--sb-overlay-popover-width` wide. The text goes into a `role="status"` paragraph on open. One or two plain sentences, no links or controls. This is how jargon is explained in place on desk pages.

## Tooltip — `.sb-tooltip`

At most `--sb-overlay-tooltip-width`, on `surface-panel`. Label tooltips repeat an icon button's `aria-label` and are `aria-hidden`; description tooltips are `role="tooltip"` linked by `aria-describedby`. Meets SC 1.4.13: Escape dismisses, hoverable, persistent. Touch never opens it. [APG Tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/).

## Toast — `.sb-toast`

One `.sb-toast-region` with `role="status"`, rendered empty at first paint, fixed to the bottom edge above the action tray.

- Anatomy: tone icon, one sentence, optional action (usually Undo), icon-only Dismiss.
- Tone through `data-tone`: `success` or `warning`; no attribute is the neutral `info` tone. Tone sits on every edge plus the icon and words.
- A newer toast replaces the older; never a stack. Nothing leaves on a timer.
- Never takes focus. Never used during recording; the Tap Pad's status line reports saves.
- Blocking errors go in the page feedback slot as `role="alert"`, not a toast.
- Example: "Swim 3 deleted." with Undo.

## Accessibility summary

- Escape closes every overlay; focus returns to the trigger (tooltips and toasts never moved it).
- Icon-only triggers name what they act on.
- State is never colour alone: check icons for checked items, "Deleting…" with `aria-busy`, tone icons and words on toasts.
- Motion: `--sb-motion-standard` with `--sb-easing-enter` in, `--sb-motion-fast` out; collapses under reduced motion.
- Scale and travel come from `--sb-enter-scale` and `--sb-enter-offset`.

## Agent recipe

1. Is a Swim recording? Then no overlay. Put the control on the Tap Pad.
2. Choose from the table. Long forms go in a sheet or inline panel.
3. Name everything; set initial focus (first field, or Cancel for a destructive confirmation).
4. Confirm a finished action with one toast with Undo when it can be undone.
