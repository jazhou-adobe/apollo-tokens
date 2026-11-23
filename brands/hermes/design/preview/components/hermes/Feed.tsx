'use client';

import { createContext, useContext, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { withBase } from '../../paths';
import { CLAUDE, CLASH_AGENT, CODEX, CURSOR, FEED, FOLDED_DIFF, PROPOSAL, RECOMMENDED_NOTE, ADVISORS, type FeedEntry } from '../../feed-fixtures';
import type { Agent, DiffLine } from '../../fixtures';
import { Icon } from '../Icon';
import { Callsign } from './Callsign';

// Command Center Feed specimens: the Feed index, page-scroll Rounds with their own action bars, ended-in-place Rounds,
// Lanes with the non-modal drawer, and the Forget Agent confirmation. Illustrative data; the clock reads 14:06:20.

/** Anchor prefix for Round ids and index links, so the same Rounds can appear twice on /design with unique ids. */
const FeedAnchor = createContext('cmd');

/** A second copy (a blueprint) also names its landmarks apart from the first: "…, Feed blueprint". */
const contextLabel = (anchor: string) => (anchor === 'cmd' ? '' : ` ${anchor}-context`);

export function FeedAnchors({ prefix, label, children }: { prefix: string; label: string; children: ReactNode }) {
  return (
    <FeedAnchor.Provider value={prefix}>
      <span id={`${prefix}-context`} hidden>
        {label}
      </span>
      {children}
    </FeedAnchor.Provider>
  );
}

/* ---------- Feed index ---------- */

const PROJECTS = ['ledger-api', 'billing', 'web-shell'];
const CALLSIGN_FILTERS: Agent[] = [CLAUDE, CLASH_AGENT, CODEX, CURSOR];

/** The slim sticky index: one entry per Round in the Feed, filter chips by callsign and by project. */
export function FeedIndex({ current = 'r_7f3a91c0', headingLevel = 3 }: { current?: string; headingLevel?: 3 | 4 }) {
  const [agents, setAgents] = useState<string[]>([]);
  const [projects, setProjects] = useState<string[]>([]);
  const toggle = (list: string[], set: (next: string[]) => void, value: string) => set(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  // AND across the two kinds, OR inside one.
  const shown = FEED.filter((entry) => (!agents.length || agents.includes(entry.agent.id)) && (!projects.length || projects.includes(entry.project)));
  const headingId = useId();
  const anchor = useContext(FeedAnchor);
  const Heading = headingLevel === 3 ? 'h3' : 'h4';
  return (
    <nav className="hh-feed-index" aria-labelledby={`${headingId}${contextLabel(anchor)}`} data-density="compact">
      <div className="hh-feed-index-head">
        <Heading id={headingId} className="hh-heading-md">
          Feed
        </Heading>
        <span className="hh-live-value" data-live="true">
          Pending · 2
        </span>
      </div>
      <fieldset className="hh-feed-index-filters">
        <legend className="hh-visually-hidden">Filter by callsign</legend>
        {CALLSIGN_FILTERS.map((agent) => (
          <button key={agent.id} type="button" className="hh-chip" aria-pressed={agents.includes(agent.id)} onClick={() => toggle(agents, setAgents, agent.id)}>
            <Callsign agent={agent} />
          </button>
        ))}
      </fieldset>
      <fieldset className="hh-feed-index-filters">
        <legend className="hh-visually-hidden">Filter by project</legend>
        {PROJECTS.map((project) => (
          <button key={project} type="button" className="hh-chip" aria-pressed={projects.includes(project)} onClick={() => toggle(projects, setProjects, project)}>
            <span className="hh-mono-sm">{project}</span>
          </button>
        ))}
      </fieldset>
      {agents.length || projects.length ? (
        <p className="hh-body-sm hh-row">
          Showing {shown.length} of {FEED.length} ·
          <button
            type="button"
            className="hh-button"
            data-variant="ghost"
            data-size="sm"
            onClick={() => {
              setAgents([]);
              setProjects([]);
            }}
          >
            Clear filters
          </button>
        </p>
      ) : null}
      {shown.length ? (
        <ol className="hh-feed-index-list">
          {shown.map((entry) => (
            <IndexEntry key={entry.id} entry={entry} current={entry.id === current} />
          ))}
        </ol>
      ) : (
        <p className="hh-body-sm">No Rounds match these filters.</p>
      )}
    </nav>
  );
}

function IndexEntry({ entry, current }: { entry: FeedEntry; current: boolean }) {
  const anchor = useContext(FeedAnchor);
  return (
    <li className="hh-feed-index-item">
      <a className="hh-feed-index-link" href={`#${anchor}-${entry.id}`} aria-current={current ? 'location' : undefined} data-lock-soon={entry.lockSoon ? 'true' : undefined}>
        <span className="hh-feed-index-meta">
          <Callsign agent={entry.agent} />
          {entry.ended ? (
            <span className="hh-badge" data-tone="expired">
              {entry.ended}
            </span>
          ) : (
            <span className="hh-mono-sm">Lock in {entry.next}</span>
          )}
        </span>
        <span className="hh-feed-index-title">{entry.title}</span>
        {entry.lockSoon || current ? (
          <span className="hh-feed-index-meta">
            {entry.lockSoon ? (
              <span className="hh-badge" data-tone="warning">
                <Icon name="clock" /> Lock soon
              </span>
            ) : null}
            <span className="hh-feed-index-inview">
              <Icon name="chevron-right" /> In view
            </span>
          </span>
        ) : null}
      </a>
    </li>
  );
}

/* ---------- Shared Round parts ---------- */

/** The holder around a Round in the Feed: status tab, paper, and the policy timer (data-fill, no style attribute). */
function FeedStrip({ id, status, tab, fill, children }: { id: string; status: 'pending' | 'expired'; tab: string; fill?: number; children: ReactNode }) {
  const anchor = useContext(FeedAnchor);
  return (
    <li className="hh-strip hh-feed-item" id={`${anchor}-${id}`} data-status={status}>
      <div className="hh-strip-tab">
        <span>{tab}</span>
        <span className="hh-mono-sm">{id} · received 13:52</span>
      </div>
      <div className="hh-strip-paper">{children}</div>
      {fill !== undefined ? (
        <span className="hh-policy-timer" aria-hidden="true">
          <span className="hh-policy-timer-fill" data-fill={String(fill)} />
        </span>
      ) : null}
    </li>
  );
}

function DiffRows({ lines }: { lines: DiffLine[] }) {
  return (
    <>
      {lines.map((line, index) => (
        <li key={index} className="hh-diff-line" data-kind={line.kind === 'context' ? undefined : line.kind}>
          <span className="hh-diff-sign" aria-hidden="true">
            {line.kind === 'add' ? '+' : line.kind === 'remove' ? '−' : ' '}
          </span>
          <span>
            {line.kind !== 'context' ? <span className="hh-visually-hidden">{line.kind === 'add' ? 'Added: ' : 'Removed: '}</span> : null}
            {line.text}
          </span>
        </li>
      ))}
    </>
  );
}

/** A diff Attachment with one fold: runs of 8 or more unchanged lines collapse behind a disclosure. */
export function FoldedDiff() {
  return (
    <figure className="hh-attachment">
      <figcaption className="hh-attachment-head">
        <span className="hh-badge">
          <Icon name="diff" /> Diff
        </span>
        <span className="hh-attachment-title hh-mono">src/routes/index.ts</span>
        <span className="hh-mono-sm">+2 −1</span>
      </figcaption>
      <div className="hh-attachment-body" tabIndex={0} aria-label="Diff of src/routes/index.ts">
        <ol className="hh-diff">
          <DiffRows lines={FOLDED_DIFF.before} />
          <li className="hh-diff-fold">
            <details>
              <summary className="hh-diff-fold-summary">
                <Icon name="chevron-right" /> Show {FOLDED_DIFF.folded.length} unchanged lines
              </summary>
              <ol className="hh-diff">
                <DiffRows lines={FOLDED_DIFF.folded} />
              </ol>
            </details>
          </li>
          <DiffRows lines={FOLDED_DIFF.after} />
        </ol>
      </div>
    </figure>
  );
}

/** Markdown on the reading plane: strip paper, measure-capped, inline code on the code plane. */
export function MarkdownAttachment() {
  return (
    <figure className="hh-attachment">
      <figcaption className="hh-attachment-head">
        <span className="hh-badge">
          <Icon name="markdown" /> Markdown
        </span>
        <span className="hh-attachment-title hh-mono">docs/runbooks/invoices-v2.md</span>
        <span className="hh-mono-sm">18 lines</span>
      </figcaption>
      <div className="hh-attachment-prose hh-prose">
        <h4>Roll-out</h4>
        <ol>
          <li>
            Deploy behind <code>INVOICES_V2</code>, off.
          </li>
          <li>Turn it on for the internal tenant, watch p95 for 30 minutes.</li>
          <li>Turn it on for everyone in the chosen window.</li>
        </ol>
        <p>Rollback: switch the flag off. No data migrates back.</p>
        <pre tabIndex={0} aria-label="Code block in docs/runbooks/invoices-v2.md">
          <code>hub flags set INVOICES_V2=on --tenant internal</code>
        </pre>
      </div>
    </figure>
  );
}

/** An image Attachment: alt text is required; capped like a code plane, Expand shows it full size. */
export function ImageAttachment({ missingAlt = false }: { missingAlt?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <figure className="hh-attachment">
      <figcaption className="hh-attachment-head">
        <span className="hh-badge">
          <Icon name="image" /> Image
        </span>
        <span className="hh-attachment-title hh-mono">p95-latency.png</span>
        <span className="hh-mono-sm">PNG · 640 × 360</span>
        {missingAlt ? null : (
          <button type="button" className="hh-button" data-variant="ghost" data-size="sm" aria-pressed={expanded} onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Fit' : 'Expand'}
          </button>
        )}
      </figcaption>
      {missingAlt ? (
        <div className="hh-attachment-row">
          <Icon name="alert" />
          <span className="hh-body-sm">Image not shown · the Agent sent no alt text. Ask it to describe the image.</span>
        </div>
      ) : (
        <div className="hh-attachment-image" data-state={expanded ? 'expanded' : undefined}>
          <img
            src={withBase('/fixtures/latency-chart.png')}
            width={640}
            height={360}
            alt="Bar chart of p95 latency on /v2/invoices by hour: about 120 ms most of the day, rising to about 240 ms between 10:00 and 16:00 during the deploy."
          />
        </div>
      )}
    </figure>
  );
}

function Option({
  name,
  value,
  label,
  detail,
  hint,
  type = 'radio',
  checked,
  onChange,
  recommended,
  recommendedWords = 'Recommended',
  choice,
}: {
  name: string;
  value: string;
  label: string;
  detail?: string;
  hint?: string;
  type?: 'radio' | 'checkbox';
  checked: boolean;
  onChange?: () => void;
  recommended?: boolean;
  recommendedWords?: string;
  choice?: 'approve' | 'reject';
}) {
  return (
    <label className="hh-option" data-recommended={recommended ? 'true' : undefined} data-choice={choice} data-checked={checked ? 'true' : undefined}>
      {hint ? (
        <span className="hh-kbd" aria-hidden="true">
          {hint}
        </span>
      ) : (
        <span aria-hidden="true" />
      )}
      <input type={type} name={name} value={value} checked={checked} onChange={onChange ?? (() => undefined)} aria-keyshortcuts={hint} />
      <span className="hh-option-text">
        {recommended ? (
          <span className="hh-recommended">
            <Icon name="check" /> {recommendedWords}
          </span>
        ) : null}
        <span className="hh-option-label">{label}</span>
        {detail ? <span className="hh-option-detail">{detail}</span> : null}
      </span>
    </label>
  );
}

function RoundHead({ entry, children }: { entry: FeedEntry; children?: ReactNode }) {
  const anchor = useContext(FeedAnchor);
  return (
    <div className="hh-round-head">
      <div className="hh-row">
        <Callsign agent={entry.agent} />
        <span className="hh-mono-sm">{entry.project}</span>
        {children}
      </div>
      <h3 className="hh-strip-header hh-round-title" id={`${anchor}-${entry.id}-h`} tabIndex={-1}>
        {entry.title}
      </h3>
    </div>
  );
}

type Panel = 'dismiss' | 'redirect' | 'advisor';

/**
 * The Round's own action bar (Send Answer, Dismiss, Redirect, Ask advisor) and its inline panels. One panel is open at a
 * time; d, e and v open them while focus is in the Round but not in a text field.
 */
function ActionBar({ scope, callsign, progress, sticky, onPanel, panel }: { scope: string; callsign: string; progress: string; sticky: boolean; onPanel: (panel: Panel | null) => void; panel: Panel | null }) {
  const buttons: { id: Panel; label: string; key: string }[] = [
    { id: 'dismiss', label: 'Dismiss', key: 'd' },
    { id: 'redirect', label: 'Redirect', key: 'e' },
    { id: 'advisor', label: 'Ask advisor', key: 'v' },
  ];
  return (
    <div className="hh-answer-bar" data-sticky={sticky ? 'true' : undefined}>
      <div className="hh-answer-bar-row">
        <span className="hh-answer-progress">
          <span className="hh-mono-sm">{progress}</span>
        </span>
        <span className="hh-row">
          {buttons.map((button) => (
            <button
              key={button.id}
              type="button"
              className="hh-button"
              data-variant={button.id === 'dismiss' ? 'destructive' : undefined}
              aria-expanded={panel === button.id}
              aria-controls={`${scope}-${button.id}`}
              aria-keyshortcuts={button.key}
              onClick={() => onPanel(panel === button.id ? null : button.id)}
            >
              {button.label}{' '}
              <kbd className="hh-kbd" aria-hidden="true">
                {button.key}
              </kbd>
            </button>
          ))}
          <button type="submit" className="hh-button" data-variant="primary" aria-keyshortcuts="Meta+Enter Control+Enter" aria-label={`Send Answer to ${callsign}, Command Enter`}>
            <Icon name="send" /> Send Answer{' '}
            <kbd className="hh-kbd" aria-hidden="true">
              ⌘↵
            </kbd>
          </button>
        </span>
      </div>
    </div>
  );
}

function InlinePanels({ scope, callsign, panel, onClose }: { scope: string; callsign: string; panel: Panel | null; onClose: () => void }) {
  const [message, setMessage] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [advisor, setAdvisor] = useState(ADVISORS[0].name);
  if (sent) {
    return (
      <p className="hh-round-error hh-alert" data-tone="success" role="status">
        <span className="hh-badge" data-tone="success">
          {sent}
        </span>
        <span className="hh-body-sm">Specimen only: in the Hub the Round now leaves the Feed for the log, and the Feed scrolls to the next Pending Round.</span>
      </p>
    );
  }
  if (panel === 'dismiss') {
    return (
      <section className="hh-panel hh-inline-panel hh-stack" id={`${scope}-dismiss`} aria-labelledby={`${scope}-dismiss-h`}>
        <h4 className="hh-heading-md" id={`${scope}-dismiss-h`}>
          Dismiss this Round
        </h4>
        <p className="hh-body-sm hh-measure">{callsign} gets Outcome dismissed, with your note if you add one. Nothing else is sent.</p>
        <div className="hh-field">
          <label className="hh-label" htmlFor={`${scope}-dismiss-note`}>
            Note for {callsign} (optional)
          </label>
          <textarea id={`${scope}-dismiss-note`} className="hh-textarea" rows={2} />
        </div>
        <div className="hh-row">
          <button type="button" className="hh-button" data-variant="destructive" onClick={() => setSent('Dismissed')}>
            Dismiss Round
          </button>
          <button type="button" className="hh-button" data-variant="ghost" onClick={onClose}>
            Keep answering
          </button>
        </div>
      </section>
    );
  }
  if (panel === 'redirect') {
    return (
      <section className="hh-panel hh-inline-panel hh-stack" id={`${scope}-redirect`} aria-labelledby={`${scope}-redirect-h`}>
        <h4 className="hh-heading-md" id={`${scope}-redirect-h`}>
          Redirect {callsign}
        </h4>
        <p className="hh-body-sm hh-measure">{callsign} gets Outcome redirected and your message instead of Answers.</p>
        <div className="hh-field">
          <label className="hh-label" htmlFor={`${scope}-redirect-msg`}>
            Do this instead (required)
          </label>
          <textarea
            id={`${scope}-redirect-msg`}
            className="hh-textarea"
            rows={3}
            value={message}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? `${scope}-redirect-err` : undefined}
            onChange={(event) => {
              setMessage(event.target.value);
              if (event.target.value.trim()) setInvalid(false);
            }}
          />
          {invalid ? (
            <p className="hh-error" id={`${scope}-redirect-err`} role="alert">
              <span className="hh-badge" data-tone="destructive">
                Error
              </span>{' '}
              Write what {callsign} should do instead.
            </p>
          ) : null}
        </div>
        <div className="hh-row">
          <button type="button" className="hh-button" data-variant="primary" onClick={() => (message.trim() ? setSent('Redirected') : setInvalid(true))}>
            Send redirect
          </button>
          <button type="button" className="hh-button" data-variant="ghost" onClick={onClose}>
            Keep answering
          </button>
        </div>
      </section>
    );
  }
  if (panel === 'advisor') {
    return (
      <section className="hh-panel hh-inline-panel hh-stack" id={`${scope}-advisor`} aria-labelledby={`${scope}-advisor-h`}>
        <h4 className="hh-heading-md" id={`${scope}-advisor-h`}>
          Ask an Advisor
        </h4>
        <p className="hh-body-sm hh-measure">An Advisor reads this Round and suggests Answers. It never sends: you do. Deadlines keep running while it works.</p>
        <fieldset className="hh-field hh-advisor-picker">
          <legend className="hh-label">Advisor</legend>
          {ADVISORS.map((item) => (
            <label key={item.name} className="hh-radio">
              <input type="radio" name={`${scope}-advisor-pick`} checked={advisor === item.name} onChange={() => setAdvisor(item.name)} /> <span className="hh-mono">{item.name}</span>{' '}
              <span className="hh-body-sm">· {item.timeout} timeout</span>
            </label>
          ))}
        </fieldset>
        <div className="hh-field">
          <label className="hh-label" htmlFor={`${scope}-brief`}>
            Brief (optional)
          </label>
          <textarea id={`${scope}-brief`} className="hh-textarea" rows={2} aria-describedby={`${scope}-brief-hint`} />
          <p className="hh-hint" id={`${scope}-brief-hint`}>
            Sent with the Round. Auto-ask rules add their standing brief first.
          </p>
        </div>
        <div className="hh-row">
          <button type="button" className="hh-button" data-variant="primary" onClick={() => setSent('Advisor working')}>
            Start advisor run
          </button>
          <button type="button" className="hh-button" data-variant="ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </section>
    );
  }
  return null;
}

/** Scoped single keys for one Round: d, e, v open the panels; never inside a text field. */
function usePanelKeys() {
  const [panel, setPanel] = useState<Panel | null>(null);
  const onKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    const target = event.target as HTMLElement;
    if (event.metaKey || event.ctrlKey || event.altKey || target.closest('textarea, input[type="text"], input[type="search"]')) return;
    const next = ({ d: 'dismiss', e: 'redirect', v: 'advisor' } as const)[event.key as 'd' | 'e' | 'v'];
    if (next) {
      event.preventDefault();
      setPanel(next);
    }
  };
  return { panel, setPanel, onKeyDown };
}

/* ---------- The full Round: every addition in one page-scroll Round ---------- */

/**
 * One Pending Round, fully expanded in the Feed: Lock soon, Replaces, n of m locked, an Advisor Suggestion, diff folds,
 * an editable Proposal, free-text Recommended with Use it, a per-Question policy, a Locked Question with its Draft, and
 * markdown and image Attachments. Its action bar sticks while the Round is in view.
 */
export function FullRound({ sticky = true }: { sticky?: boolean }) {
  const scope = useId();
  const entry = FEED[0];
  const anchor = useContext(FeedAnchor);
  const [q1, setQ1] = useState('expand');
  const [q2, setQ2] = useState<'approve' | 'reject' | ''>('approve');
  const [proposal, setProposal] = useState(PROPOSAL);
  const [editing, setEditing] = useState(false);
  const [q3, setQ3] = useState('');
  const q3Ref = useRef<HTMLTextAreaElement>(null);
  const { panel, setPanel, onKeyDown } = usePanelKeys();
  const edited = proposal !== PROPOSAL;
  const callsign = entry.agent.callsign;
  return (
    <FeedStrip id={entry.id} status="pending" tab="Pending" fill={10}>
      <form className="hh-round" data-layout="page" aria-labelledby={`${anchor}-${entry.id}-h${contextLabel(anchor)}`} onSubmit={(event) => event.preventDefault()} onKeyDown={onKeyDown}>
        <RoundHead entry={entry}>
          <span className="hh-badge" data-tone="warning">
            <Icon name="clock" /> Lock soon · 00:47 to next Lock
          </span>
          <span className="hh-badge" data-tone="warning">
            <Icon name="lock" /> 1 of 4 locked · Round stays pending
          </span>
          <span className="hh-badge" data-tone="info">
            <Icon name="refresh" /> Replaces r_5b2f90cd
          </span>
          <span className="hh-badge">
            <Icon name="check" /> Draft carried over
          </span>
        </RoundHead>
        <div className="hh-round-flow">
        <div className="hh-round-head">
          <div className="hh-policy-badge">
            <span className="hh-badge">
              <Icon name="clock" /> Policy
            </span>
            <span className="hh-body-sm">waits 15 min, then applies recommended</span>
            <span className="hh-mono-sm">Next Lock in 00:47</span>
          </div>
        </div>
        <ol className="hh-round-questions">
          <li className="hh-advisor-row">
            <div className="hh-alert hh-advisor-status" data-tone="info" data-state="succeeded" role="status">
              <span className="hh-badge" data-tone="info">
                Suggestion
              </span>
              <strong>
                Suggestion ready · <span className="hh-mono">codex-review</span> · 38 s
              </strong>
              <p className="hh-body-sm">Empty Questions are filled and marked; Answers you already set show what the Advisor would change.</p>
            </div>
          </li>

          <li className="hh-question" data-current="true">
            <div className="hh-question-call">
              <div className="hh-question-meta">
                <span className="hh-mono-sm">Q1 of 4</span>
                <span className="hh-badge">Choose one</span>
              </div>
              <p className="hh-question-prompt" id={`${scope}-q1`}>
                Which migration path for the invoices route?
              </p>
              <FoldedDiff />
            </div>
            <fieldset className="hh-question-response" aria-labelledby={`${scope}-q1`}>
              <Option
                name={`${scope}-q1`}
                value="expand"
                label="Expand and contract"
                detail="Two deploys, no downtime"
                hint="1"
                checked={q1 === 'expand'}
                onChange={() => setQ1('expand')}
                recommended
                recommendedWords="Recommended · applied if unanswered"
              />
              <Option name={`${scope}-q1`} value="cutover" label="Hard cut-over" detail="One deploy, 2 min read-only" hint="2" checked={q1 === 'cutover'} onChange={() => setQ1('cutover')} />
            </fieldset>
            {q1 === 'expand' ? (
              <div className="hh-advisor-suggestion">
                <span className="hh-badge" data-tone="info">
                  Suggested by codex-review
                </span>
                <p className="hh-body-sm hh-advisor-rationale">Rationale: the route has live mobile clients; two deploys keep them working.</p>
              </div>
            ) : (
              <div className="hh-advisor-changed">
                <span className="hh-badge">Changed from codex-review&apos;s suggestion</span>
                <button type="button" className="hh-button" data-size="sm" onClick={() => setQ1('expand')}>
                  Restore suggestion
                </button>
              </div>
            )}
          </li>

          <li className="hh-question">
            <div className="hh-question-call">
              <div className="hh-question-meta">
                <span className="hh-mono-sm">Q2 of 4</span>
                <span className="hh-badge">Approve or reject</span>
              </div>
              <p className="hh-question-prompt" id={`${scope}-q2`}>
                Run the migration now?
              </p>
              <figure className="hh-attachment hh-proposal" data-state={editing ? 'edit' : edited ? 'edited' : 'read'}>
                <figcaption className="hh-attachment-head">
                  <span className="hh-badge">
                    <Icon name="code" /> Command
                  </span>
                  <span className="hh-badge" data-tone="info">
                    Editable
                  </span>
                  {edited ? (
                    <span className="hh-badge" data-tone="warning">
                      <Icon name="check" /> Edited
                    </span>
                  ) : null}
                  <span className="hh-attachment-title hh-mono">Proposal · command</span>
                  <button type="button" className="hh-button" data-variant="ghost" data-size="sm" aria-expanded={editing} onClick={() => setEditing(!editing)}>
                    {editing ? 'Done' : 'Edit'}
                  </button>
                </figcaption>
                {editing ? (
                  <div className="hh-proposal-edit">
                    <div className="hh-field">
                      <label className="hh-label" htmlFor={`${scope}-edit`}>
                        Edit the command before approving
                      </label>
                      <textarea
                        id={`${scope}-edit`}
                        className="hh-textarea hh-proposal-input"
                        spellCheck={false}
                        rows={2}
                        value={proposal}
                        aria-describedby={`${scope}-edit-hint`}
                        onChange={(event) => setProposal(event.target.value)}
                      />
                      <p className="hh-hint" id={`${scope}-edit-hint`}>
                        Plain text, run as typed. Approving sends your version and marks it edited.
                      </p>
                    </div>
                  </div>
                ) : (
                  <pre className="hh-attachment-body" tabIndex={0} aria-label="Proposal: command">
                    <code>{proposal}</code>
                  </pre>
                )}
                {edited ? (
                  <details className="hh-proposal-original">
                    <summary>{callsign}&apos;s version</summary>
                    <pre className="hh-attachment-body">
                      <code>{PROPOSAL}</code>
                    </pre>
                    <button type="button" className="hh-button" data-size="sm" onClick={() => setProposal(PROPOSAL)}>
                      <Icon name="refresh" /> Reset to {callsign}&apos;s version
                    </button>
                  </details>
                ) : null}
              </figure>
            </div>
            <fieldset className="hh-question-response" aria-labelledby={`${scope}-q2`}>
              <div className="hh-approve-pair">
                <Option name={`${scope}-q2`} value="approve" label={edited ? 'Approve (edited)' : 'Approve'} hint="A" choice="approve" checked={q2 === 'approve'} onChange={() => setQ2('approve')} />
                <Option name={`${scope}-q2`} value="reject" label="Reject" hint="R" choice="reject" checked={q2 === 'reject'} onChange={() => setQ2('reject')} />
              </div>
            </fieldset>
            {q2 === 'approve' ? (
              <div className="hh-advisor-offer">
                <span className="hh-body-sm">
                  <span className="hh-mono">codex-review</span> suggests Reject · run it after the 16:00 freeze lifts
                </span>
                <button type="button" className="hh-button" data-size="sm" onClick={() => setQ2('reject')}>
                  Accept
                </button>
              </div>
            ) : null}
          </li>

          <li className="hh-question">
            <div className="hh-question-call">
              <div className="hh-question-meta">
                <span className="hh-mono-sm">Q3 of 4</span>
                <span className="hh-badge">Free text</span>
                <span className="hh-policy-badge">
                  <span className="hh-badge" data-tone="info">
                    <Icon name="clock" /> Own policy
                  </span>
                  <span className="hh-mono-sm">cancels at 14:12:07 · 05:47 left</span>
                </span>
              </div>
              <p className="hh-question-prompt" id={`${scope}-q3`}>
                Release note for the changelog
              </p>
            </div>
            <div className="hh-question-response">
              <div className="hh-recommended-text">
                <span className="hh-recommended">
                  <Icon name="check" /> Recommended
                </span>
                <p className="hh-body hh-recommended-text-quote" id={`${scope}-q3-rec`}>
                  &ldquo;{RECOMMENDED_NOTE}&rdquo;
                </p>
                <button
                  type="button"
                  className="hh-button"
                  data-size="sm"
                  aria-describedby={`${scope}-q3-rec`}
                  onClick={() => {
                    setQ3(RECOMMENDED_NOTE);
                    q3Ref.current?.focus();
                  }}
                >
                  Use it
                </button>
              </div>
              <div className="hh-field">
                <label className="hh-label" htmlFor={`${scope}-q3-t`}>
                  Answer
                </label>
                <textarea ref={q3Ref} id={`${scope}-q3-t`} className="hh-textarea" rows={3} value={q3} placeholder="Write your own, or use the recommended text." onChange={(event) => setQ3(event.target.value)} />
              </div>
            </div>
          </li>

          <li className="hh-question" data-state="locked">
            <div className="hh-question-call">
              <div className="hh-question-meta">
                <span className="hh-mono-sm">Q4 of 4</span>
                <span className="hh-badge">Choose one</span>
                <span className="hh-badge" data-tone="expired">
                  <Icon name="lock" /> Locked
                </span>
                <span className="hh-body-sm">Policy applied recommended · 13:59</span>
              </div>
              <p className="hh-question-prompt" id={`${scope}-q4`}>
                Roll out in which window?
              </p>
              <MarkdownAttachment />
              <ImageAttachment />
            </div>
            <fieldset className="hh-question-response" aria-labelledby={`${scope}-q4`} disabled>
              <Option name={`${scope}-q4`} value="tonight" label="Tonight, 22:00" checked recommended recommendedWords="Recommended · applied" />
              <Option name={`${scope}-q4`} value="weekend" label="Saturday, 09:00" checked={false} />
            </fieldset>
            <div className="hh-alert hh-question-draft" data-tone="warning">
              <span className="hh-badge" data-tone="expired">
                Not sent
              </span>
              <strong>Draft kept</strong>
              <p className="hh-body-sm">
                You had chosen <span className="hh-mono">Saturday, 09:00</span> when the Lock fired. A policy never sends a Draft.
              </p>
              <div className="hh-row">
                <button type="button" className="hh-button" data-size="sm">
                  <Icon name="copy" /> Copy draft
                </button>
              </div>
            </div>
          </li>
        </ol>
        <InlinePanels scope={scope} callsign={callsign} panel={panel} onClose={() => setPanel(null)} />
        <ActionBar scope={scope} callsign={callsign} progress="2 of 3 open Questions answered" sticky={sticky} panel={panel} onPanel={setPanel} />
        </div>
      </form>
    </FeedStrip>
  );
}

/** A plain Pending Round in the Feed: one Question and its action bar. */
export function SimpleRound({ sticky = true }: { sticky?: boolean }) {
  const scope = useId();
  const entry = FEED[1];
  const anchor = useContext(FeedAnchor);
  const [value, setValue] = useState('');
  const { panel, setPanel, onKeyDown } = usePanelKeys();
  return (
    <FeedStrip id={entry.id} status="pending" tab="Pending" fill={55}>
      <form className="hh-round" data-layout="page" aria-labelledby={`${anchor}-${entry.id}-h${contextLabel(anchor)}`} onSubmit={(event) => event.preventDefault()} onKeyDown={onKeyDown}>
        <RoundHead entry={entry}>
          <span className="hh-mono-sm">Next Lock in 08:12 · then cancels</span>
        </RoundHead>
        <div className="hh-round-flow">
        <ol className="hh-round-questions">
          <li className="hh-question">
            <div className="hh-question-call">
              <div className="hh-question-meta">
                <span className="hh-mono-sm">Q1 of 1</span>
                <span className="hh-badge">Choose one</span>
              </div>
              <p className="hh-question-prompt" id={`${scope}-q`}>
                When should billing cut over to Postgres 17?
              </p>
            </div>
            <fieldset className="hh-question-response" aria-labelledby={`${scope}-q`}>
              {[
                { id: 'now', label: 'Now, during low traffic', detail: 'Replica lag is 0.4 s' },
                { id: 'friday', label: 'Friday after the invoice run' },
                { id: 'hold', label: 'Hold until the replica is re-seeded' },
              ].map((option, index) => (
                <Option key={option.id} name={`${scope}-q`} value={option.id} label={option.label} detail={option.detail} hint={String(index + 1)} checked={value === option.id} onChange={() => setValue(option.id)} />
              ))}
            </fieldset>
          </li>
        </ol>
        <InlinePanels scope={scope} callsign={entry.agent.callsign} panel={panel} onClose={() => setPanel(null)} />
        <ActionBar scope={scope} callsign={entry.agent.callsign} progress={value ? '1 of 1 required answered' : '0 of 1 required answered'} sticky={sticky} panel={panel} onPanel={setPanel} />
        </div>
      </form>
    </FeedStrip>
  );
}

/* ---------- Rounds that end in place ---------- */

/** Expired, superseded or cancelled: read-only where it stood, with its Outcome sentence, the Draft as Not sent, Copy draft and Remove from feed. */
export function EndedRound({ kind }: { kind: 'superseded' | 'expired' }) {
  const scope = useId();
  const entry = kind === 'superseded' ? FEED[2] : FEED[3];
  const anchor = useContext(FeedAnchor);
  const [removed, setRemoved] = useState(false);
  if (removed) {
    return (
      <li className="hh-feed-item">
        <p className="hh-body-sm" role="status">
          {entry.id} removed from the Feed · it stays in the answered log.
        </p>
      </li>
    );
  }
  const tab = kind === 'superseded' ? 'Cancelled' : 'Expired';
  return (
    <FeedStrip id={entry.id} status="expired" tab={tab}>
      <form className="hh-round" data-layout="page" data-state="ended" aria-labelledby={`${anchor}-${entry.id}-h${contextLabel(anchor)}`} onSubmit={(event) => event.preventDefault()}>
        <RoundHead entry={entry}>
          <span className="hh-badge" data-tone="expired">
            {tab}
          </span>
        </RoundHead>
        <ol className="hh-round-questions">
          <li className="hh-question" data-state="locked">
            <div className="hh-question-call">
              <div className="hh-question-meta">
                <span className="hh-mono-sm">Q1 of 1</span>
                <span className="hh-badge">Choose one</span>
                <span className="hh-badge" data-tone="expired">
                  <Icon name="lock" /> Locked
                </span>
                <span className="hh-body-sm">{kind === 'superseded' ? 'Cancelled by supersede · 14:04' : 'Policy cancelled · 14:01'}</span>
              </div>
              <p className="hh-question-prompt" id={`${scope}-q`}>
                {kind === 'superseded' ? 'Round half-cents up or to even?' : 'Rename /shell/* to /app/*?'}
              </p>
            </div>
            <fieldset className="hh-question-response" aria-labelledby={`${scope}-q`} disabled>
              <Option name={`${scope}-q`} value="a" label={kind === 'superseded' ? 'Round half up' : 'Rename now'} checked />
              <Option name={`${scope}-q`} value="b" label={kind === 'superseded' ? 'Round half to even' : 'Keep both for one release'} checked={false} />
            </fieldset>
          </li>
        </ol>
        <div className="hh-answer-bar">
          <div className="hh-alert" data-tone="warning" role="status">
            <span className="hh-badge" data-tone="expired">
              Not sent
            </span>
            {kind === 'superseded' ? (
              <p className="hh-body-sm">
                Cancelled · Replaced by r_7f3a91c0 at 14:04. Your Draft was carried over to it.{' '}
                <a className="hh-link" href={`#${anchor}-r_7f3a91c0`}>
                  Open r_7f3a91c0
                </a>
              </p>
            ) : (
              <p className="hh-body-sm">Expired 14:01 · the last Question locked and the policy cancelled it. {entry.agent.callsign} got Outcome cancelled. Your Draft was not sent.</p>
            )}
          </div>
          <div className="hh-answer-bar-row">
            <span className="hh-row">
              <button type="button" className="hh-button">
                <Icon name="copy" /> Copy draft
              </button>
            </span>
            <button type="button" className="hh-button" data-variant="ghost" aria-label={`Remove from feed ${entry.id}`} onClick={() => setRemoved(true)}>
              <Icon name="trash" /> Remove from feed
            </button>
          </div>
        </div>
      </form>
    </FeedStrip>
  );
}

/* ---------- Agents: Lanes with the non-modal Round drawer ---------- */

type Lane = { agent: Agent; state: 'Live' | 'Idle' | 'Gone'; lastSeen: string; rounds: { id: string; title: string; policy: string }[] };

const LANES: Lane[] = [
  { agent: CLAUDE, state: 'Live', lastSeen: '2 s ago', rounds: [{ id: 'r_7f3a91c0', title: 'Ship the v2 invoices route', policy: '00:47 · then applies recommended' }] },
  { agent: CODEX, state: 'Live', lastSeen: '9 s ago', rounds: [{ id: 'r_e41a6b02', title: 'Pick the Postgres 17 cut-over', policy: '08:12 · then cancels' }] },
  { agent: CURSOR, state: 'Idle', lastSeen: '13:12', rounds: [] },
];

/** Lanes: one lane per Agent session with its Pending Rounds; selecting a strip opens the Round in a drawer beside them. */
export function LanesView() {
  const anchor = useContext(FeedAnchor);
  const [open, setOpen] = useState<string | null>('r_7f3a91c0');
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const drawerId = useId();
  const selected = LANES.flatMap((lane) => lane.rounds.map((round) => ({ ...round, agent: lane.agent }))).find((round) => round.id === open);
  const close = () => {
    const trigger = open ? triggers.current.get(open) : undefined;
    setOpen(null);
    trigger?.focus();
  };
  return (
    <div className="hh-lanes-layout" onKeyDown={(event) => event.key === 'Escape' && open && close()}>
      <ul className="hh-lanes" aria-label="Lanes · 3 Agent sessions">
        {LANES.map((lane) => (
          <li key={lane.agent.id} className="hh-shelf hh-lane">
            <div className="hh-lane-head">
              <Callsign agent={lane.agent} />
              <span className="hh-agent-state">
                <Icon name={lane.state === 'Live' ? 'signal' : 'clock'} /> {lane.state}
              </span>
              <span className="hh-mono-sm">
                {lane.rounds.length} pending · last seen {lane.lastSeen} · {lane.agent.branch}
              </span>
            </div>
            <ul className="hh-strip-bay-list hh-lane-list">
              {lane.rounds.length ? (
                lane.rounds.map((round) => (
                  <li key={round.id} className="hh-strip" data-status="pending" data-selected={open === round.id ? 'true' : undefined} data-mode="button">
                    <div className="hh-strip-tab">
                      <span>Pending</span>
                      <span className="hh-mono-sm">{round.id}</span>
                    </div>
                    <div className="hh-strip-paper">
                      <button
                        type="button"
                        className="hh-strip-head"
                        aria-expanded={open === round.id}
                        aria-controls={drawerId}
                        ref={(node) => {
                          if (node) triggers.current.set(round.id, node);
                        }}
                        onClick={() => setOpen(open === round.id ? null : round.id)}
                      >
                        <span className="hh-strip-cell" data-cell="callsign">
                          <Callsign agent={lane.agent} />
                        </span>
                        <span className="hh-strip-cell" data-cell="meta">
                          <span className="hh-mono-sm">{open === round.id ? 'Open' : '1 Question'}</span>
                        </span>
                        <span className="hh-strip-cell" data-cell="title">
                          <span className="hh-strip-title hh-strip-header hh-round-title">{round.title}</span>
                          <span className="hh-strip-policy">{round.policy}</span>
                        </span>
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <li className="hh-strip-bay-slot hh-lane-slot">
                  <p className="hh-body-sm">No pending Rounds · idle since {lane.lastSeen}</p>
                </li>
              )}
            </ul>
          </li>
        ))}
      </ul>
      {selected ? (
        <aside id={drawerId} className="hh-drawer" aria-labelledby={`${drawerId}-h${contextLabel(anchor)}`}>
          <div className="hh-overlay-head">
            <h4 className="hh-heading-md" id={`${drawerId}-h`}>
              {selected.title}
            </h4>
            <button type="button" className="hh-icon-button" data-variant="ghost" aria-label="Close Round drawer" onClick={close}>
              <Icon name="x" />
            </button>
          </div>
          <div className="hh-overlay-body hh-stack">
            <div className="hh-row">
              <span className="hh-badge" data-tone="pending">
                Pending
              </span>
              <Callsign agent={selected.agent} />
              <span className="hh-mono-sm">{selected.id}</span>
            </div>
            <p className="hh-body-sm">{selected.policy}</p>
            <p className="hh-body-sm">The drawer is not modal: the lanes stay usable beside it. Answer here, or open the Round in the Feed.</p>
          </div>
          <div className="hh-overlay-foot">
            <a className="hh-button" href={`#${anchor}-${selected.id}`}>
              Open in Feed
            </a>
            <a className="hh-button" data-variant="primary" href="#bp-round">
              Open Round detail
            </a>
          </div>
        </aside>
      ) : null}
    </div>
  );
}

/* ---------- Agents: Forget Agent ---------- */

/** Forget Agent: an alert dialog naming the object and the consequence; the safe action takes focus. */
export function ForgetAgentDemo() {
  const dialog = useRef<HTMLDialogElement>(null);
  const safe = useRef<HTMLButtonElement>(null);
  const [forgotten, setForgotten] = useState(false);
  const id = useId();
  const callsign = CURSOR.callsign;
  return (
    <div className="hh-stack">
      {forgotten ? (
        <div className="hh-alert" data-tone="info" role="status">
          <span className="hh-badge" data-tone="info">
            Forgotten
          </span>
          <p className="hh-label">{callsign} is forgotten · 14:06</p>
          <p className="hh-body-sm">Its 0 pending Rounds were cancelled and stay in the log. If the session sends again, it returns as a new Agent with a new callsign.</p>
        </div>
      ) : (
        <div className="hh-row">
          <button
            type="button"
            className="hh-button"
            data-variant="destructive"
            onClick={() => {
              dialog.current?.showModal();
              safe.current?.focus();
            }}
          >
            <Icon name="trash" /> Forget {callsign}…
          </button>
        </div>
      )}
      <dialog ref={dialog} className="hh-dialog" role="alertdialog" aria-labelledby={`${id}-t`} aria-describedby={`${id}-d`}>
        <div className="hh-overlay-head">
          <h2 className="hh-heading-md" id={`${id}-t`}>
            Forget {callsign}?
          </h2>
        </div>
        <div className="hh-overlay-body">
          <p className="hh-body-sm" id={`${id}-d`}>
            Its pending Rounds are cancelled and stay in the log as cancelled. Its detection details and resume handle are removed from this Hub.
          </p>
        </div>
        <div className="hh-overlay-foot">
          <button ref={safe} type="button" className="hh-button" onClick={() => dialog.current?.close()}>
            Keep {callsign}
          </button>
          <button
            type="button"
            className="hh-button"
            data-variant="destructive"
            onClick={() => {
              dialog.current?.close();
              setForgotten(true);
            }}
          >
            Forget Agent
          </button>
        </div>
      </dialog>
    </div>
  );
}

/** A toggletip in flow: the button opens a non-modal popover below it; Escape closes it and focus stays on the button. */
export function Toggletip({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="hh-popover-anchor" onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}>
      <button type="button" className="hh-button" data-variant="ghost" data-size="sm" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        {label}
      </button>
      {open ? (
        <div id={id} className="hh-popover" role="group" aria-label={label}>
          <p className="hh-body-sm">{children}</p>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- Feed keys: j / k between Rounds ---------- */

/**
 * Scoped single keys for a Feed list: j / k move to the next / previous Round, scroll it below the app bar and focus its
 * title. They listen on the list only (never the document) and never fire inside a text field or with a modifier.
 */
export function FeedKeys({ label, children }: { label: string; children: ReactNode }) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if ((event.key !== 'j' && event.key !== 'k') || event.metaKey || event.ctrlKey || event.altKey) return;
    if (target.closest('textarea, input:not([type="radio"]):not([type="checkbox"]), select, [contenteditable="true"]')) return;
    const items = [...event.currentTarget.querySelectorAll<HTMLElement>('.hh-feed-item')].filter((item) => item.querySelector('.hh-round-title'));
    if (!items.length) return;
    const index = items.findIndex((item) => item.contains(target));
    const next = event.key === 'j' ? Math.min(items.length - 1, index + 1) : Math.max(0, index < 0 ? 0 : index - 1);
    event.preventDefault();
    const title = items[next].querySelector<HTMLElement>('.hh-round-title');
    items[next].scrollIntoView({ block: 'start' });
    title?.focus({ preventScroll: true });
  };
  return (
    <div className="hh-stack" onKeyDown={onKeyDown}>
      <ul className="hh-kbd-hints" aria-label={`Keys for ${label}`}>
        <li>
          <kbd className="hh-kbd">j</kbd>
          <kbd className="hh-kbd">k</kbd> next / previous Round
        </li>
        <li>
          <kbd className="hh-kbd">1</kbd>–<kbd className="hh-kbd">9</kbd> choose
        </li>
        <li>
          <kbd className="hh-kbd">d</kbd> Dismiss
        </li>
        <li>
          <kbd className="hh-kbd">e</kbd> Redirect
        </li>
        <li>
          <kbd className="hh-kbd">v</kbd> Ask advisor
        </li>
        <li>
          <kbd className="hh-kbd">⌘↵</kbd> Send
        </li>
      </ul>
      {children}
    </div>
  );
}

/* ---------- Proposal with JSON that does not parse ---------- */

const JSON_PROPOSAL = '{\n  "replicas": 3,\n  "window": "22:00"\n}';

/** An editable JSON Proposal: while the edit does not parse, the field is invalid and the Round cannot be sent. */
export function JsonProposal() {
  const scope = useId();
  const [text, setText] = useState('{\n  "replicas": 3,\n  "window": "22:00",\n}');
  let invalid = false;
  try {
    JSON.parse(text);
  } catch {
    invalid = true;
  }
  const edited = text !== JSON_PROPOSAL;
  return (
    <figure className="hh-attachment hh-proposal" data-state={invalid ? 'invalid' : edited ? 'edited' : 'read'}>
      <figcaption className="hh-attachment-head">
        <span className="hh-badge">
          <Icon name="code" /> JSON
        </span>
        <span className="hh-badge" data-tone="info">
          Editable
        </span>
        {edited ? (
          <span className="hh-badge" data-tone="warning">
            <Icon name="check" /> Edited
          </span>
        ) : null}
        <span className="hh-attachment-title hh-mono">Proposal · json</span>
      </figcaption>
      <div className="hh-proposal-edit">
        <div className="hh-field">
          <label className="hh-label" htmlFor={`${scope}-json`}>
            Edit the proposal before approving
          </label>
          <textarea
            id={`${scope}-json`}
            className="hh-textarea hh-proposal-input"
            spellCheck={false}
            rows={5}
            value={text}
            aria-invalid={invalid || undefined}
            aria-describedby={`${scope}-hint${invalid ? ` ${scope}-err` : ''}`}
            onChange={(event) => setText(event.target.value)}
          />
          <p className="hh-hint" id={`${scope}-hint`}>
            JSON. Approving sends your version and marks it edited.
          </p>
          {invalid ? (
            <p className="hh-error" id={`${scope}-err`} role="alert">
              <span className="hh-badge" data-tone="destructive">
                Error
              </span>{' '}
              The edited JSON does not parse. Send reports &ldquo;Fix the JSON in Q2 to send&rdquo;.
            </p>
          ) : null}
        </div>
        <div className="hh-row">
          <button type="button" className="hh-button" data-size="sm" onClick={() => setText(JSON_PROPOSAL)}>
            <Icon name="refresh" /> Reset to CLAUDE·api-refactor&apos;s version
          </button>
        </div>
      </div>
    </figure>
  );
}

/* ---------- GIF under reduced motion ---------- */

/**
 * A GIF Attachment as the Human sees it with reduced motion: a still first frame and Play. The still here is the
 * illustrative PNG standing in for the GIF's first frame; in the Hub the frame is drawn once to a canvas.
 */
export function GifAttachment() {
  const [playing, setPlaying] = useState(false);
  return (
    <figure className="hh-attachment">
      <figcaption className="hh-attachment-head">
        <span className="hh-badge">
          <Icon name="image" /> Image
        </span>
        <span className="hh-attachment-title hh-mono">latency-replay.gif</span>
        <span className="hh-mono-sm">GIF · 640 × 360 · 12 frames</span>
        <button type="button" className="hh-button" data-size="sm" aria-pressed={playing} onClick={() => setPlaying(!playing)}>
          {playing ? 'Pause' : 'Play'}
        </button>
      </figcaption>
      <div className="hh-attachment-image">
        <img
          src={withBase('/fixtures/latency-chart.png')}
          width={640}
          height={360}
          alt="First frame of an animation of p95 latency on /v2/invoices by hour, rising to about 240 ms during the 10:00 to 16:00 deploy."
        />
      </div>
      <div className="hh-attachment-row">
        <span className="hh-body-sm" role="status">
          {playing ? 'Playing · the animation runs until you press Pause.' : 'Paused on the first frame · reduced motion is on. Press Play to run it.'}
        </span>
      </div>
    </figure>
  );
}
