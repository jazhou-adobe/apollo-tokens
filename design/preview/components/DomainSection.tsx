import { AGENTS, ANSWERED_LOG, ROUNDS, type Question, type Round } from '../fixtures';
import { AgentRoster } from './hermes/AgentRoster';
import { AnsweredLog } from './hermes/AnsweredLog';
import { Attachment } from './hermes/Attachment';
import { Callsign } from './hermes/Callsign';
import { ConnectionStatus } from './hermes/ConnectionStatus';
import { KbdHints } from './hermes/KbdHints';
import { PolicyBadge } from './hermes/PolicyTimer';
import { QuestionsDemo } from './hermes/QuestionsDemo';
import { ToggleStrip } from './hermes/Strip';
import { EmptyBay, StripBay } from './hermes/StripBay';

// One of each Question type, drawn from the illustrative Rounds.
const QUESTION_TYPES: Question[] = [ROUNDS[0].questions[0], ROUNDS[1].questions[1], ROUNDS[0].questions[2], ROUNDS[2].questions[0]].map((question, index) => ({
  ...question,
  id: `type-${index}`,
}));

const ANSWERED_STRIP: Round = { ...ROUNDS[3], id: 'R-0141', status: 'answered', outcome: 'Answered 09:30 · delivered' };

export function DomainSection() {
  return (
    <section id="domain" className="hh-section" aria-labelledby="domain-title">
      <div className="hh-section-head">
        <h2 id="domain-title" className="hh-heading-lg">
          Domain widgets
        </h2>
        <p className="hh-body hh-measure">
          The Command Center&apos;s own parts: strips in holders, Questions beside their Answer slots, attachments on opaque code planes, callsigns, the Unanswered Policy timer, the Answer
          bar, key hints, the connection lamp, and the answered log.
        </p>
      </div>

      <div id="strip-bay" className="hh-subsection">
        <h3 className="hh-heading-md">Strip bay</h3>
        <p className="hh-body-sm hh-measure">
          Working triage. The strip list is one Tab stop: <kbd className="hh-kbd">J</kbd> / <kbd className="hh-kbd">K</kbd> or the arrows move between strips and the Round beside it
          follows. In the Round, <kbd className="hh-kbd">1</kbd>–<kbd className="hh-kbd">9</kbd> choose an option in the current Question, <kbd className="hh-kbd">A</kbd> /{' '}
          <kbd className="hh-kbd">R</kbd> approve or reject, <kbd className="hh-kbd">N</kbd> opens notes, <kbd className="hh-kbd">Esc</kbd> goes back to pending, and{' '}
          <kbd className="hh-kbd">⌘↵</kbd> or <kbd className="hh-kbd">Ctrl↵</kbd> sends the whole Round. R-0144 cancels by policy about 75 seconds after load. Illustrative data.
        </p>
        <StripBay context="Domain widgets" headingLevel={4} />
      </div>

      <div id="domain-strips" className="hh-subsection">
        <h3 className="hh-heading-md">Round strips</h3>
        <p className="hh-body-sm hh-measure">Collapsed and expanded, in each holder. The holder frames the strip on every side and its tab names the status; colour never stands alone.</p>
        <ul className="hh-strip-bay-list">
          <ToggleStrip round={ROUNDS[1]} />
          <ToggleStrip round={ROUNDS[0]} initiallyExpanded />
          <ToggleStrip round={ANSWERED_STRIP} />
          <ToggleStrip round={ROUNDS[4]} initiallyExpanded />
        </ul>
      </div>

      <div id="domain-questions" className="hh-subsection">
        <h3 className="hh-heading-md">Questions</h3>
        <p className="hh-body-sm hh-measure">Single choice, multiple choice, free text, approve / reject. The recommended option carries a green marker and the word Recommended.</p>
        <QuestionsDemo questions={QUESTION_TYPES} />
      </div>

      <div id="domain-attachments" className="hh-subsection">
        <h3 className="hh-heading-md">Attachments</h3>
        <div className="hh-demo-grid">
          <Attachment attachment={ROUNDS[0].questions[1].attachments![0]} />
          <Attachment attachment={ROUNDS[1].questions[2].attachments![0]} />
          <Attachment attachment={ROUNDS[2].questions[0].attachments![0]} />
          <Attachment attachment={ROUNDS[2].questions[0].attachments![1]} />
        </div>
      </div>

      <div id="domain-agents" className="hh-subsection">
        <h3 className="hh-heading-md">Callsigns and Agent roster</h3>
        <div className="hh-row">
          {AGENTS.map((agent) => (
            <Callsign key={agent.id} agent={agent} />
          ))}
        </div>
        <AgentRoster agents={AGENTS} />
      </div>

      <div id="domain-status" className="hh-subsection">
        <h3 className="hh-heading-md">Timer, connection, log</h3>
        <div className="hh-demo-grid">
          <div className="hh-demo">
            <code className="hh-demo-label">Unanswered Policy badge</code>
            <PolicyBadge policy={{ kind: 'apply-recommended', seconds: 600 }} remaining={412} />
            <PolicyBadge policy={{ kind: 'cancel', seconds: 90 }} remaining={8} />
            <PolicyBadge policy={{ kind: 'wait' }} />
          </div>
          <div className="hh-demo">
            <code className="hh-demo-label">.hh-connection[data-state]</code>
            <ConnectionStatus state="live" detail="SSE · last event 1 s ago" />
            <ConnectionStatus state="reconnecting" detail="retry 3 of 5" />
            <ConnectionStatus state="offline" detail="since 09:41" />
          </div>
          <div className="hh-demo">
            <code className="hh-demo-label">.hh-kbd-hints</code>
            <KbdHints />
          </div>
          <div className="hh-demo">
            <code className="hh-demo-label">Empty bay</code>
            <EmptyBay />
          </div>
        </div>
        <AnsweredLog entries={ANSWERED_LOG} caption="Answered log (status widgets)" />
      </div>
    </section>
  );
}
