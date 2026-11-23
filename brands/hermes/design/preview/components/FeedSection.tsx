import { AddedIcons, AdvisorRunHistory, AdvisorStates, DetectionDetails, FeedStates, FillScaleDemo, ToastVariants } from './hermes/CommandCenterParts';
import { EndedRound, FeedIndex, FeedKeys, ForgetAgentDemo, FullRound, GifAttachment, ImageAttachment, JsonProposal, LanesView, SimpleRound } from './hermes/Feed';

// The Command Center additions (briefs/command-center-additions.md), one subsection per part, in every theme and density
// the switcher sets. Docs: components/feed-widgets.md and the sections it links. Illustrative data.
export function FeedSection() {
  return (
    <section id="command-center" className="hh-section" aria-labelledby="command-center-title">
      <div className="hh-section-head">
        <h2 id="command-center-title" className="hh-heading-lg">
          Command Center Feed
        </h2>
        <p className="hh-body hh-measure">
          The Feed&apos;s parts: the index, page-scroll Rounds with their own action bar, Lock soon, Dismiss and Redirect, the edit-then-approve Proposal, Advisor states,
          Locked Questions, per-Question policy, Supersede, markdown and image Attachments, delivery in the log, the Agents page and notification toasts. Illustrative
          data; the clock reads 14:06:20.
        </p>
      </div>

      <div id="cmd-index" className="hh-subsection">
        <h3 className="hh-heading-md">Feed index</h3>
        <p className="hh-body-sm hh-measure">
          One entry per Round in the Feed: callsign, title, time to the next Lock or the Outcome word, Lock soon, and In view (accent fill, heavier boundary, the words
          and a chevron). Chips filter by callsign and by project: AND across the two, OR inside one. Compact density.
        </p>
        <div className="hh-demo-grid">
          <FeedIndex />
        </div>
      </div>

      <div id="cmd-round" className="hh-subsection">
        <h3 className="hh-heading-md">Page-scroll Round</h3>
        <p className="hh-body-sm hh-measure">
          Every addition in one Pending Round: Lock soon, Replaces, 1 of 4 locked, a Suggestion with its markers, a diff fold, the editable Proposal, free-text Recommended
          with Use it, an own policy, and a Locked Question with its Draft and markdown and image Attachments. The action bar sticks while this Round is in view, and never
          over the Round head: the bar&apos;s containing block starts after the head. With focus in a Round (outside a text field), <kbd className="hh-kbd">J</kbd> /{' '}
          <kbd className="hh-kbd">K</kbd> move to the next or previous Round and focus its title; <kbd className="hh-kbd">D</kbd>, <kbd className="hh-kbd">E</kbd> or{' '}
          <kbd className="hh-kbd">V</kbd> open Dismiss, Redirect or Ask advisor. Send Redirect with an empty message to see the error.
        </p>
        <FeedKeys label="the page-scroll Rounds">
          <ol className="hh-feed-list">
            <FullRound />
            <SimpleRound />
          </ol>
        </FeedKeys>
      </div>

      <div id="cmd-states" className="hh-subsection">
        <h3 className="hh-heading-md">Feed states, invalid JSON, GIF</h3>
        <p className="hh-body-sm hh-measure">
          The Feed column when empty, loading, reconnecting and offline (Send stays focusable with its reason). An editable JSON Proposal whose edit does not parse: the
          field is invalid and says what blocks Send; fix the trailing comma to clear it. A GIF under reduced motion: the first frame and Play, never a loop on its own.
        </p>
        <FeedStates />
        <div className="hh-demo-grid">
          <JsonProposal />
          <GifAttachment />
        </div>
      </div>

      <div id="cmd-ended" className="hh-subsection">
        <h3 className="hh-heading-md">Rounds that end in place</h3>
        <p className="hh-body-sm hh-measure">
          Superseded and expired Rounds stay where they stood, read-only: Outcome sentence, the Draft as Not sent, Copy draft, Remove from feed. A superseded Round links
          to the one that replaced it.
        </p>
        <ol className="hh-feed-list">
          <EndedRound kind="superseded" />
          <EndedRound kind="expired" />
        </ol>
      </div>

      <div id="cmd-advisor" className="hh-subsection">
        <h3 className="hh-heading-md">Advisor states</h3>
        <p className="hh-body-sm hh-measure">
          Working with Cancel, Suggestion ready, unparsed briefing, timed out, cancelled; then the run history in Round detail. The picker is the Ask advisor panel in the
          Round above.
        </p>
        <div className="hh-demo-grid">
          <AdvisorStates />
          <AdvisorRunHistory label="Advisor runs for r_7f3a91c0" />
        </div>
      </div>

      <div id="cmd-attachments" className="hh-subsection">
        <h3 className="hh-heading-md">Image Attachment without alt text</h3>
        <p className="hh-body-sm hh-measure">The Hub never renders an image without alt text; it says so in words. Markdown, image and folded diff are in the Round above.</p>
        <div className="hh-demo-grid">
          <ImageAttachment missingAlt />
        </div>
      </div>

      <div id="cmd-toasts" className="hh-subsection">
        <h3 className="hh-heading-md">Notification toasts</h3>
        <p className="hh-body-sm hh-measure">
          New Round, Lock in 15 s, Suggestion ready: each with Open and Dismiss, until dismissed. In the Hub they stack in{' '}
          <code>.hh-toast-region[data-placement=&quot;top&quot;]</code> under the app bar, out of the flow: they never shift the Feed or cover the sticky action bar. Shown
          inline here.
        </p>
        <div className="hh-demo-grid">
          <ToastVariants />
        </div>
      </div>

      <div id="cmd-log" className="hh-subsection">
        <h3 className="hh-heading-md">Answered log: Outcomes and delivery</h3>
        <p className="hh-body-sm hh-measure">
          Outcome words (answered, dismissed, redirected, expired, cancelled), each value with who set it, Delivered HH:MM:SS, Waiting for pickup, Not picked up, and
          Replaced by: in the{' '}
          <a className="hh-link" href="#bp-log">
            Answered log blueprint
          </a>
          .
        </p>
      </div>

      <div id="cmd-agents" className="hh-subsection">
        <h3 className="hh-heading-md">Agents: Detection, Forget, Lanes</h3>
        <p className="hh-body-sm hh-measure">
          Detection details with the signal, its documentation status, resume handle and the clash suffix; Forget with its alert dialog and the forgotten-session note; Lanes
          with the non-modal Round drawer (Escape or Close returns focus to the strip).
        </p>
        <div className="hh-demo-grid">
          <DetectionDetails />
          <ForgetAgentDemo />
        </div>
        <LanesView />
      </div>

      <div id="cmd-small" className="hh-subsection">
        <h3 className="hh-heading-md">Fill scale and icons</h3>
        <p className="hh-body-sm hh-measure">
          Timer and progress fills set by <code>data-fill</code> in steps of 5, for pages whose Content-Security-Policy blocks style attributes. Icons added to{' '}
          <code>preview/hermes-icons.json</code>; the In view cue is the chevron plus words, never a glyph.
        </p>
        <div className="hh-demo-grid">
          <FillScaleDemo />
          <AddedIcons />
        </div>
      </div>
    </section>
  );
}
