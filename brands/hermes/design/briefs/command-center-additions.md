# Brief: Command Center additions (from the hermes-hub prototype)

**Source:** the hermes-hub wayfinder ticket [How should the Command Center flow work?](https://github.com/jazhou-adobe/hermes-hub/issues/12), confirmed on 2026-11-20.

- **Behaviour spec:** [command-center.md](https://github.com/jazhou-adobe/hermes-hub/blob/spec/command-center/docs/specs/command-center.md).
- **Prototype** (throwaway, with every gap outlined): branch [`prototype/command-center`](https://github.com/jazhou-adobe/hermes-hub/tree/prototype/command-center/prototype/command-center). Run it from that branch with `bun prototype/command-center/index.html`; `?variant=feed` is the chosen flow.
- **Screenshots:** in `prototype/command-center/screenshots/` on that branch, especially `feed.png` and `feed-scrolled.png`.

This brief lists UI the system doesn't specify yet. Per [governance.md](../governance.md), each addition updates every layer it touches: components, blueprints, preview, agent contract and validator.

## Change to an existing blueprint

**Triage becomes a Feed.** The Human chose the Feed over the strip bay with a single open Round.

- **Layout:** every Pending Round is shown fully expanded in one scrolling column, in arrival order. A slim sticky **Feed index** on the left replaces the strip bay.
- **Action bar:** each Round has its own action bar. Only the bar of the Round in view sticks to the bottom of the viewport.
- **Leaving the Feed:**
  - **Sent, dismissed and redirected** Rounds leave the Feed.
  - **Expired, superseded and cancelled** Rounds stay in place, read-only, with Copy draft and **Remove from feed**.
- **Lanes** (one lane per Agent session) move to a view on the **Agents** page.
- **Removed from scope (Hub decisions):**
  - the phone (glance) blueprints;
  - the sign-in page;
  - Settings → Tokens and Settings → Exposure.

  The Hub is local only and has no sign-in.

## Additions

1. **Feed index:** callsign, title, time to the next Lock, "Lock soon", "▸ In view", and filter chips by callsign and project.
2. **Page-scroll Round:** full-height Attachments, diff folds ("Show N unchanged lines" for runs of 8 or more), and a sticky Answer bar while the Round is in view.
3. **Lock soon** cue (under 60 s to the next Lock) on index entries and the Round head. It is shown in words plus a visual cue, never colour alone.
4. **Dismiss** (optional note) and **Redirect** (required "do this instead" message) controls, their inline panels, and the Outcome words for each.
5. **Edit-then-approve:**
   - a Proposal block showing its format (text, command or JSON) and whether it is editable;
   - an edit mode, an "Edited" badge, and an "Approve (edited)" label;
   - Reset to the Agent's version.
6. **Advisor states:**
   - the Ask advisor picker (Advisor list plus brief);
   - "Advisor working · m:ss" with Cancel;
   - the Suggestion summary, and a per-Question "Suggested by ADVISOR" marker with the rationale;
   - "ADVISOR suggests … · Accept", and "Changed from …'s suggestion";
   - an unparsed briefing, and a run that was stopped or cancelled.
7. **Locked Question:**
   - a Locked badge with the policy sentence and time, and a read-only response;
   - a per-Question "Not sent" Draft with Copy draft;
   - on the Round head, "n of m locked · Round stays pending".
8. **Per-Question policy override** badge ("Own policy … · m:ss left").
9. **Supersede:**
   - "Replaces r_…" on the new Round;
   - the ended state "Cancelled · Replaced by r_…" with Open r_…;
   - the log wording.
10. **Markdown and image Attachments:**
    - markdown on the reading plane;
    - images with required alt text (png, jpeg, webp, gif).
11. **Delivery states** in the answered log: Delivered time, and "Not picked up".
12. **Agents page:**
    - the Forget Agent confirmation, and a note for forgotten sessions;
    - Detection details: documented vs undocumented signal, resume handle with Copy, and why a clash suffix was added (`CLAUDE·api·3f9a`);
    - the **Lanes view**: lane head (callsign, state, pending count, last seen, branch), an empty-lane slot, and a Round drawer beside the lanes.
13. **Settings → Advisors** (name, command, timeout) and **Settings → Auto-ask rules** (kind + project + optional label → Advisor, with a standing brief). Both are **read-only views** of `config.toml`, with the file path and a "reloaded HH:MM" or config-error state. Live controls in Settings: notifications, **quiet hours**, **sound** (off by default), appearance, single-key shortcuts, and Storage size.
14. **Notification toast** with Open, for: a new Round, a Lock in 15 s, and a Suggestion ready.
15. **Free-text Recommended:** shown with "Use it", never prefilled.

## Not needed any more

- The strip bay as the triage surface. Keep it as a component only if Lanes reuse the strip.
- The Focus Queue header.
- The phone blueprints.
- The sign-in page.
- Settings → Tokens and Settings → Exposure.
