import type { ReactNode } from 'react';
import { ADVISORS, CLAUDE, CLASH_AGENT, CODEX, CURSOR } from '../../feed-fixtures';
import { SwitchDemo } from '../CoreDemos';
import { Icon, type IconName } from '../Icon';
import { Callsign } from './Callsign';
import { ConnectionStatus } from './ConnectionStatus';
import { Toggletip } from './Feed';

// Static Command Center specimens: Advisor states, toasts with Open, the answered log with delivery, Detection details,
// Settings, the CSP fill scale and the new icons. Illustrative data; the clock reads 14:06:20 on 2026-11-20.

/** The app bar every Command Center page shares. Static here (the preview page scrolls under its own chrome). */
export function CommandAppBar({ pending = 2 }: { pending?: number }) {
  return (
    <header className="hh-app-bar" style={{ position: 'static' }}>
      <span className="hh-app-bar-brand">
        <Icon name="bay" /> Hub · studio-mac
      </span>
      <span className="hh-live-value" data-live="true">
        Pending · {pending}
      </span>
      <span className="hh-app-bar-spacer" />
      <ConnectionStatus state="live" detail="since 13:58" />
    </header>
  );
}

const NAV: { label: string; icon: IconName; count?: number }[] = [
  { label: 'Feed', icon: 'bay', count: 2 },
  { label: 'Answered log', icon: 'check' },
  { label: 'Agents', icon: 'user', count: 4 },
  { label: 'Settings', icon: 'settings' },
];

/** The shell: side nav beside one page, full width. */
export function CommandShell({ current, label, children }: { current: string; label: string; children: ReactNode }) {
  return (
    <div className="hh-app-shell">
      <nav className="hh-side-nav hh-app-shell-nav" aria-label={`Command Center (${label})`}>
        {NAV.map((item) => (
          <a key={item.label} href="#blueprints-command" aria-current={item.label === current ? 'page' : undefined}>
            <Icon name={item.icon} /> {item.label}
            {item.count !== undefined ? <span className="hh-side-nav-count">{item.count}</span> : null}
          </a>
        ))}
      </nav>
      <div className="hh-app-shell-main">{children}</div>
    </div>
  );
}

/* ---------- Advisor states ---------- */

/** Every Advisor run state as it appears in a Round: working, ready, unparsed, timed out, cancelled. */
export function AdvisorStates() {
  return (
    <ul className="hh-round-questions hh-round" aria-label="Advisor run states">
      <li className="hh-advisor-row">
        <div className="hh-alert hh-advisor-status" data-tone="info" data-state="running" role="status">
          <span className="hh-badge" data-tone="info">
            Advisor
          </span>
          <strong>
            <span className="hh-spinner" aria-hidden="true" /> Advisor working · <span className="hh-mono">0:42</span>
          </strong>
          <p className="hh-body-sm">
            <span className="hh-mono">codex-review</span> was asked by you at 14:05:38. Deadlines keep running. It fills empty Questions when it returns.
          </p>
          <div className="hh-row">
            <button type="button" className="hh-button" data-size="sm">
              <Icon name="x" /> Cancel run
            </button>
          </div>
        </div>
      </li>
      <li className="hh-advisor-row">
        <div className="hh-alert hh-advisor-status" data-tone="info" data-state="succeeded" role="status">
          <span className="hh-badge" data-tone="info">
            Suggestion
          </span>
          <strong>
            Suggestion ready · <span className="hh-mono">codex-review</span> · 38 s
          </strong>
          <p className="hh-body-sm">Filled 2 empty Questions; 1 Answer you set has an offer to change. Summary: ship behind the flag, run the migration after the freeze.</p>
        </div>
      </li>
      <li className="hh-advisor-row">
        <div className="hh-alert hh-advisor-status" data-tone="warning" data-state="unparsed" role="status">
          <span className="hh-badge" data-tone="warning">
            <Icon name="alert" /> Unparsed
          </span>
          <strong>
            Advisor reply could not be read · <span className="hh-mono">claude-second-look</span>
          </strong>
          <p className="hh-body-sm">The reply had no hermes.suggestion/v1 JSON object, so no Answers were filled. It is shown as a plain briefing.</p>
          <figure className="hh-attachment hh-advisor-briefing">
            <figcaption className="hh-attachment-head">
              <span className="hh-badge">
                <Icon name="file" /> Briefing
              </span>
              <span className="hh-attachment-title hh-mono">claude-second-look · unparsed output</span>
              <span className="hh-mono-sm">3 lines · 51 s</span>
            </figcaption>
            <pre className="hh-attachment-body" tabIndex={0} aria-label="Unparsed briefing from claude-second-look">
              <code>{'I would expand and contract: two deploys.\nDo not run the migration before 16:00.\nThe release note reads well as written.'}</code>
            </pre>
          </figure>
        </div>
      </li>
      <li className="hh-advisor-row">
        <div className="hh-alert hh-advisor-status" data-tone="warning" data-state="timed-out" role="status">
          <span className="hh-badge" data-tone="warning">
            <Icon name="clock" /> Timed out
          </span>
          <strong>
            <span className="hh-mono">codex-review</span> timed out after 120 s
          </strong>
          <p className="hh-body-sm">No Suggestion. Deadlines kept running. Ask again, or answer yourself.</p>
        </div>
      </li>
      <li className="hh-advisor-row">
        <div className="hh-alert hh-advisor-status" data-state="cancelled" role="status">
          <span className="hh-badge">
            <Icon name="x" /> Cancelled
          </span>
          <strong>
            Advisor run cancelled · <span className="hh-mono">codex-review</span> · 14:05:51
          </strong>
          <p className="hh-body-sm">Stopped by you after 13 s. Nothing was filled.</p>
        </div>
      </li>
    </ul>
  );
}

/** Round detail: every Advisor run with its status word. */
export function AdvisorRunHistory({ label }: { label: string }) {
  const runs = [
    { at: '14:05:38', advisor: 'codex-review', by: 'You', status: 'Succeeded', tone: 'success', took: '38 s' },
    { at: '13:58:02', advisor: 'claude-second-look', by: 'Auto-ask rule', status: 'Unparsed', tone: 'warning', took: '51 s' },
    { at: '13:55:10', advisor: 'codex-review', by: 'Auto-ask rule', status: 'Timed out', tone: 'warning', took: '120 s' },
    { at: '13:54:31', advisor: 'codex-review', by: 'You', status: 'Cancelled', tone: undefined, took: '13 s' },
  ];
  return (
    <div className="hh-table-wrap" tabIndex={0} role="region" aria-label={label}>
      <table className="hh-table" data-density="compact">
        <caption className="hh-visually-hidden">{label}</caption>
        <thead>
          <tr>
            <th scope="col">Started</th>
            <th scope="col">Advisor</th>
            <th scope="col">Asked by</th>
            <th scope="col">Status</th>
            <th scope="col">Took</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr key={run.at}>
              <td data-numeric>{run.at}</td>
              <td className="hh-mono">{run.advisor}</td>
              <td>{run.by}</td>
              <td>
                <span className="hh-badge" data-tone={run.tone}>
                  {run.status}
                </span>
              </td>
              <td data-numeric>{run.took}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Feed states: empty, loading, reconnecting, offline ---------- */

/** A small pending strip for the state specimens: holder, status word, callsign, title and policy sentence. */
function StateStrip({ stale = false }: { stale?: boolean }) {
  return (
    <li className="hh-strip hh-feed-item" data-status="pending">
      <div className="hh-strip-tab">
        <span>Pending</span>
        <span className="hh-mono-sm">r_e41a6b02</span>
      </div>
      <div className="hh-strip-paper">
        <div className="hh-round-head">
          <div className="hh-row">
            <Callsign agent={CODEX} />
            <span className="hh-mono-sm">billing</span>
            {stale ? <span className="hh-badge">Stale · last update 14:02</span> : null}
          </div>
          <p className="hh-strip-header hh-round-title">Pick the Postgres 17 cut-over</p>
          <p className="hh-body-sm">08:12 · then cancels</p>
        </div>
      </div>
    </li>
  );
}

/** The Feed's non-happy states, each as the Feed column shows it. */
export function FeedStates() {
  return (
    <div className="hh-demo-grid">
      <div className="hh-demo">
        <code className="hh-demo-label">Empty Feed</code>
        <div className="hh-feed-column">
          <div className="hh-empty-state">
            <Icon name="bay" />
            <p className="hh-heading-md">No pending Rounds.</p>
            <p className="hh-body-sm">Agents ask through the Hub Skill.</p>
            <a className="hh-link" href="#bp-log">
              Open the answered log
            </a>
          </div>
        </div>
      </div>
      <div className="hh-demo">
        <code className="hh-demo-label">Loading</code>
        <div className="hh-feed-column" aria-busy="true">
          <p className="hh-body-sm">
            <span className="hh-spinner" aria-hidden="true" /> Loading Rounds…
          </p>
          <ol className="hh-feed-list" aria-label="Pending Rounds (loading)">
            {[0, 1, 2].map((index) => (
              <li key={index}>
                <span className="hh-skeleton" data-shape="strip" />
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="hh-demo">
        <code className="hh-demo-label">Reconnecting</code>
        <div className="hh-feed-column">
          <div className="hh-alert" data-tone="warning" role="status">
            <span className="hh-badge" data-tone="warning">
              <Icon name="refresh" /> Reconnecting
            </span>
            <p className="hh-label">Reconnecting · retry in 4 s</p>
            <p className="hh-body-sm">The Feed may be out of date. Send still tries; your Drafts stay on this page.</p>
          </div>
          <ol className="hh-feed-list" aria-label="Pending Rounds (reconnecting)">
            <StateStrip />
          </ol>
        </div>
      </div>
      <div className="hh-demo">
        <code className="hh-demo-label">Offline</code>
        <div className="hh-feed-column">
          <div className="hh-alert" data-tone="destructive" role="alert">
            <span className="hh-badge" data-tone="destructive">
              <Icon name="alert" /> Offline
            </span>
            <p className="hh-label">Offline · last update 14:02 · Answers cannot be sent</p>
            <p className="hh-body-sm">Drafts stay on this page. The Feed refreshes in place when the Hub is back.</p>
          </div>
          <ol className="hh-feed-list" aria-label="Pending Rounds (offline)">
            <StateStrip stale />
          </ol>
          <div className="hh-answer-bar">
            <div className="hh-answer-bar-row">
              <span className="hh-mono-sm" id="cmd-offline-reason">
                Offline · Cannot send until the Hub is reachable.
              </span>
              <button type="button" className="hh-button" data-variant="primary" aria-disabled="true" aria-describedby="cmd-offline-reason">
                <Icon name="send" /> Send Answer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Toasts with Open ---------- */

/** The three notification toasts. Each stays until dismissed and carries Open; in the Hub they stack under the app bar. */
export function ToastVariants() {
  const toasts = [
    { tone: undefined, badge: 'New Round', body: <><Callsign agent={CODEX} /> Pick the Postgres 17 cut-over · 1 Question</> },
    { tone: 'warning', badge: 'Lock in 15 s', body: <><Callsign agent={CLAUDE} /> Q1 · then applies recommended: Expand and contract</> },
    { tone: 'info', badge: 'Suggestion ready', body: <><Callsign agent={CLAUDE} /> <span className="hh-mono">codex-review</span> · Ship the v2 invoices route</> },
  ] as const;
  return (
    <div className="hh-stack">
      {toasts.map((toast) => (
        <div key={toast.badge} className="hh-toast" data-placement="inline" data-tone={toast.tone}>
          <span className="hh-badge" data-tone={toast.tone}>
            {toast.badge === 'Lock in 15 s' ? <Icon name="clock" /> : null} {toast.badge}
          </span>
          <span className="hh-body-sm hh-row">{toast.body}</span>
          <span className="hh-row">
            <a className="hh-button" data-size="sm" href="#cmd-r_7f3a91c0">
              Open
            </a>
            <button type="button" className="hh-icon-button" data-variant="ghost" data-size="sm" aria-label={`Dismiss: ${toast.badge}`}>
              <Icon name="x" />
            </button>
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Answered log: Outcome words, values and who set them, delivery ---------- */

type LogRow = { id: string; title: string; agent: typeof CLAUDE; outcome: string; tone?: 'answered' | 'expired'; values: { q: string; value: ReactNode; setter: string }[]; delivery: ReactNode; at: string };

const LOG: { day: string; rows: LogRow[] }[] = [
  {
    day: 'Today · 20 Nov',
    rows: [
      {
        id: 'r_a0c4e811',
        title: 'Retry the flaky invoice test?',
        agent: CLAUDE,
        outcome: 'Answered',
        tone: 'answered',
        values: [
          { q: 'Q1', value: 'Approve (edited)', setter: 'You' },
          { q: 'Q2', value: 'Three retries', setter: 'suggested by codex-review' },
        ],
        delivery: <span className="hh-mono-sm">Delivered 13:34:09</span>,
        at: '13:34',
      },
      {
        id: 'r_5b2f90cd',
        title: 'Round half-cents on refunds',
        agent: CLASH_AGENT,
        outcome: 'Cancelled',
        tone: 'expired',
        values: [{ q: 'Q1', value: 'Round half up (Not sent)', setter: 'Draft' }],
        delivery: <span className="hh-body-sm">Replaced by r_7f3a91c0</span>,
        at: '14:04',
      },
      {
        id: 'r_77d1b0e5',
        title: 'Delete the stale preview deploys?',
        agent: CURSOR,
        outcome: 'Dismissed',
        tone: 'expired',
        values: [{ q: 'Note', value: 'Not now; ask after the release.', setter: 'You' }],
        delivery: (
          <span className="hh-badge" data-tone="warning">
            <Icon name="alert" /> Not picked up · Agent gone
          </span>
        ),
        at: '12:51',
      },
      {
        id: 'r_1e92ac3f',
        title: 'Which docs section owns webhooks?',
        agent: CODEX,
        outcome: 'Redirected',
        tone: 'expired',
        values: [{ q: 'Message', value: 'Put it under Integrations, not API.', setter: 'You' }],
        delivery: <span className="hh-mono-sm">Delivered 12:20:44</span>,
        at: '12:20',
      },
      {
        id: 'r_0f4dd2a9',
        title: 'Bump the Node base image?',
        agent: CODEX,
        outcome: 'Expired',
        tone: 'expired',
        values: [{ q: 'Q1', value: 'Approve', setter: 'Policy: applied recommended' }],
        delivery: <span className="hh-mono-sm">Waiting for pickup · since 11:02</span>,
        at: '11:02',
      },
    ],
  },
];

/** The answered log with the Feed's Outcome words, who set each value, delivery, a search match and a day group. */
export function FeedAnsweredLog() {
  return (
    <section className="hh-answered-log hh-stack" aria-labelledby="cmd-log-h">
      <div className="hh-page-head">
        <h3 className="hh-heading-lg" id="cmd-log-h">
          Answered log
        </h3>
        <span className="hh-mono-sm">5 Rounds today</span>
      </div>
      <div className="hh-filter-tray" role="search" aria-label="Filter the answered log">
        <div className="hh-field">
          <label className="hh-label" htmlFor="cmd-log-search">
            Search titles and values
          </label>
          <input id="cmd-log-search" type="search" className="hh-input" defaultValue="invoice" />
        </div>
        <div className="hh-row" role="group" aria-label="Outcome">
          {['Answered', 'Dismissed', 'Redirected', 'Expired', 'Cancelled'].map((word, index) => (
            <button key={word} type="button" className="hh-chip" aria-pressed={index === 0}>
              {word}
            </button>
          ))}
        </div>
        <div className="hh-row" role="group" aria-label="Callsign and project">
          {[CLAUDE, CODEX, CURSOR].map((agent) => (
            <button key={agent.id} type="button" className="hh-chip" aria-pressed={false}>
              <Callsign agent={agent} />
            </button>
          ))}
          {['ledger-api', 'billing', 'web-shell'].map((project) => (
            <button key={project} type="button" className="hh-chip" aria-pressed={false}>
              <span className="hh-mono-sm">{project}</span>
            </button>
          ))}
        </div>
        <div className="hh-row" role="group" aria-label="Date">
          {['Today', 'Yesterday', 'Last 7 days'].map((day, index) => (
            <button key={day} type="button" className="hh-chip" aria-pressed={index === 0}>
              {day}
            </button>
          ))}
        </div>
        <div className="hh-filter-tray-actions">
          <button type="button" className="hh-button" data-size="sm">
            <Icon name="copy" /> Copy as Markdown
          </button>
          <button type="button" className="hh-button" data-size="sm">
            <Icon name="file" /> Export JSON
          </button>
          <span className="hh-body-sm">Showing 5 of 41 · 1 match for &ldquo;invoice&rdquo;</span>
        </div>
      </div>
      <div className="hh-table-wrap" tabIndex={0} role="region" aria-label="Answered log (Command Center)">
        <table className="hh-table" data-density="compact">
          <caption className="hh-visually-hidden">Answered log, newest first, grouped by day</caption>
          <thead>
            <tr>
              <th scope="col">Outcome</th>
              <th scope="col">Round</th>
              <th scope="col">Values and who set them</th>
              <th scope="col">Delivery</th>
              <th scope="col">Ended</th>
            </tr>
          </thead>
          {LOG.map((group) => (
            <tbody key={group.day}>
              <tr className="hh-answered-log-day">
                <th scope="colgroup" colSpan={5}>
                  {group.day}
                </th>
              </tr>
              {group.rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span className="hh-badge" data-tone={row.tone}>
                      {row.outcome}
                    </span>
                  </td>
                  <td>
                    <div className="hh-stack">
                      <span>
                        {row.id === 'r_a0c4e811' ? (
                          <>
                            Retry the flaky <mark className="hh-match">invoice</mark> test?
                          </>
                        ) : (
                          row.title
                        )}
                      </span>
                      <span className="hh-row">
                        <Callsign agent={row.agent} /> <span className="hh-mono-sm">{row.id}</span>
                      </span>
                    </div>
                  </td>
                  <td>
                    <ul className="hh-log-values">
                      {row.values.map((value) => (
                        <li key={value.q}>
                          <span className="hh-mono-sm">{value.q}</span> {value.value} <span className="hh-body-sm hh-log-setter">· {value.setter}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>{row.delivery}</td>
                  <td data-numeric>{row.at}</td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </section>
  );
}

/* ---------- Agents: Detection details ---------- */

/** Detection details for one session: signal and its documentation status, resume handle with Copy, the clash suffix. */
export function DetectionDetails({ open = true }: { open?: boolean }) {
  const agent = CLASH_AGENT;
  return (
    <article className="hh-agent-card">
      <div className="hh-agent-card-head">
        <Callsign agent={agent} />
        <span className="hh-agent-state">
          <Icon name="signal" /> Live
        </span>
      </div>
      <details className="hh-detection" open={open}>
        <summary className="hh-detection-summary">
          <Icon name="chevron-down" /> Detection details
        </summary>
        <dl className="hh-dl">
          <dt>Client</dt>
          <dd>
            Claude Code · from <span className="hh-mono-sm">CLAUDE_CODE_SESSION_ID</span>{' '}
            <span className="hh-badge" data-tone="success">
              Documented signal
            </span>
          </dd>
          <dt>Callsign</dt>
          <dd>
            <span className="hh-mono-sm">{agent.callsign}</span> · suffix <span className="hh-mono-sm">3f9a</span> added because{' '}
            <span className="hh-mono-sm">CLAUDE·api-refactor</span> is already on this Hub; it is the first 4 of the session id.
          </dd>
          <dt>Session</dt>
          <dd className="hh-row">
            <span className="hh-mono-sm">{agent.sessionId}</span>
            <button type="button" className="hh-button" data-size="sm" data-variant="ghost">
              <Icon name="copy" /> Copy
            </button>
          </dd>
          <dt>Resume</dt>
          <dd className="hh-row">
            <code className="hh-mono-sm">{agent.resume}</code>
            <button type="button" className="hh-button" data-size="sm" data-variant="ghost">
              <Icon name="copy" /> Copy
            </button>
          </dd>
          <dt>Where</dt>
          <dd className="hh-mono-sm">
            {agent.host} · {agent.cwd} · {agent.branch}
          </dd>
        </dl>
      </details>
      <details className="hh-detection">
        <summary className="hh-detection-summary">
          <Icon name="chevron-down" /> {CODEX.callsign}: undocumented signal
        </summary>
        <dl className="hh-dl">
          <dt>Client</dt>
          <dd>
            Codex CLI · from <span className="hh-mono-sm">_meta.threadId</span>{' '}
            <span className="hh-badge" data-tone="warning">
              <Icon name="alert" /> Undocumented signal
            </span>
          </dd>
        </dl>
        <Toggletip label="Why may this be wrong?">
          Codex does not document <span className="hh-mono-sm">_meta.threadId</span>. Another MCP client may send the same field, so the kind is a best guess. The session id and
          working directory are still exact.
        </Toggletip>
      </details>
    </article>
  );
}

/* ---------- Settings ---------- */

function ConfigSource({ reloaded = '14:02', error = false }: { reloaded?: string; error?: boolean }) {
  return (
    <div className="hh-stack">
      <p className="hh-config-source">
        <span className="hh-badge">
          <Icon name="lock" /> Read-only · config.toml
        </span>
        <code className="hh-mono-sm">~/.config/hermes/config.toml</code>
        <button type="button" className="hh-button" data-size="sm" data-variant="ghost">
          <Icon name="copy" /> Copy path
        </button>
        <span className="hh-mono-sm">{error ? 'last good load 13:40' : `reloaded ${reloaded}`}</span>
      </p>
      {error ? (
        <div className="hh-alert" data-tone="destructive" role="alert">
          <span className="hh-badge" data-tone="destructive">
            Config error
          </span>
          <p className="hh-label">config.toml line 14 · auto_ask.advisor names &ldquo;codex-reviw&rdquo;, which is not an Advisor</p>
          <p className="hh-body-sm">The Hub keeps the last good config from 13:40. Fix the file; it reloads on save.</p>
        </div>
      ) : null}
    </div>
  );
}

/** Settings: live controls first, then read-only views of config.toml, then Storage. */
export function SettingsPanels() {
  return (
    <div className="hh-settings">
      <nav className="hh-side-nav hh-panel" aria-label="Settings sections">
        <a href="#cmd-set-notify" aria-current="page">
          <Icon name="alert" /> Notifications
        </a>
        <a href="#cmd-set-appearance">
          <Icon name="settings" /> Appearance
        </a>
        <a href="#cmd-set-keys">
          <Icon name="keyboard" /> Keys
        </a>
        <a href="#cmd-set-advisors">
          <Icon name="lock" /> Advisors
        </a>
        <a href="#cmd-set-rules">
          <Icon name="lock" /> Auto-ask rules
        </a>
        <a href="#cmd-set-storage">
          <Icon name="file" /> Storage
        </a>
      </nav>
      <div className="hh-settings-panels">
        <section id="cmd-set-notify" className="hh-card hh-stack" aria-labelledby="cmd-set-notify-h">
          <h4 className="hh-heading-md" id="cmd-set-notify-h">
            Notifications
          </h4>
          <p className="hh-body-sm">
            Browser permission: <strong>Allowed</strong>. Suppressed while this tab is visible and focused; the in-page toast still shows.
          </p>
          <SwitchDemo label="Notify on new Rounds, Locks in 15 s and Suggestions" initial />
          <SwitchDemo label="Quiet hours" initial />
          <div className="hh-field-pair">
            <div className="hh-field">
              <label className="hh-label" htmlFor="cmd-quiet-from">
                Quiet from
              </label>
              <input id="cmd-quiet-from" className="hh-input" type="time" defaultValue="22:00" />
            </div>
            <div className="hh-field">
              <label className="hh-label" htmlFor="cmd-quiet-to">
                Quiet until
              </label>
              <input id="cmd-quiet-to" className="hh-input" type="time" defaultValue="07:30" />
            </div>
          </div>
          <p className="hh-hint">During quiet hours the Hub shows toasts but sends no browser notification and plays no sound.</p>
          <SwitchDemo label="Sound" />
        </section>
        <section id="cmd-set-appearance" className="hh-card hh-stack" aria-labelledby="cmd-set-appearance-h">
          <h4 className="hh-heading-md" id="cmd-set-appearance-h">
            Appearance
          </h4>
          <div className="hh-field-pair">
            <div className="hh-field">
              <label className="hh-label" htmlFor="cmd-theme">
                Theme
              </label>
              <select id="cmd-theme" className="hh-select" defaultValue="hermes-flight-director">
                <option value="hermes-flight-director">Flight Director 2169</option>
                <option value="hermes-dark">Dark</option>
                <option value="hermes-light">Light</option>
              </select>
            </div>
            <div className="hh-field">
              <label className="hh-label" htmlFor="cmd-palette">
                Colour option
              </label>
              <select id="cmd-palette" className="hh-select" defaultValue="">
                <option value="">Console slate</option>
                <option value="night-watch">Night watch</option>
                <option value="day-shift">Day shift</option>
                <option value="original">Original</option>
              </select>
            </div>
          </div>
        </section>
        <section id="cmd-set-keys" className="hh-card hh-stack" aria-labelledby="cmd-set-keys-h">
          <h4 className="hh-heading-md" id="cmd-set-keys-h">
            Keys
          </h4>
          <SwitchDemo label="Single-key shortcuts" initial />
          <ul className="hh-kbd-hints">
            <li>
              <kbd className="hh-kbd">j</kbd>
              <kbd className="hh-kbd">k</kbd> next / previous Round
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
        </section>
        <section id="cmd-set-advisors" className="hh-card hh-stack" aria-labelledby="cmd-set-advisors-h">
          <h4 className="hh-heading-md" id="cmd-set-advisors-h">
            Advisors
          </h4>
          <ConfigSource />
          <div className="hh-table-wrap" tabIndex={0} role="region" aria-label="Advisors from config.toml">
            <table className="hh-table" data-density="compact">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Command</th>
                  <th scope="col">Timeout</th>
                </tr>
              </thead>
              <tbody>
                {ADVISORS.map((advisor) => (
                  <tr key={advisor.name}>
                    <td className="hh-mono">{advisor.name}</td>
                    <td>
                      <code className="hh-mono-sm">{advisor.command}</code>
                    </td>
                    <td data-numeric>{advisor.timeout}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section id="cmd-set-rules" className="hh-card hh-stack" aria-labelledby="cmd-set-rules-h">
          <h4 className="hh-heading-md" id="cmd-set-rules-h">
            Auto-ask rules
          </h4>
          <ConfigSource error />
          <div className="hh-table-wrap" tabIndex={0} role="region" aria-label="Auto-ask rules from config.toml">
            <table className="hh-table" data-density="compact">
              <thead>
                <tr>
                  <th scope="col">When</th>
                  <th scope="col">Advisor</th>
                  <th scope="col">Standing brief</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    Claude Code · <span className="hh-mono-sm">ledger-api</span> · label <span className="hh-mono-sm">deploy</span>
                  </td>
                  <td className="hh-mono">codex-review</td>
                  <td>Check migrations against the freeze calendar.</td>
                </tr>
                <tr>
                  <td>
                    Any kind · <span className="hh-mono-sm">billing</span>
                  </td>
                  <td className="hh-mono">claude-second-look</td>
                  <td>Flag anything that touches invoices.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="cmd-set-storage" className="hh-card hh-stack" aria-labelledby="cmd-set-storage-h">
          <h4 className="hh-heading-md" id="cmd-set-storage-h">
            Storage
          </h4>
          <div className="hh-progress">
            <div className="hh-progress-head">
              <span className="hh-label">hub.db · 184 MB of 1 GB limit</span>
              <span className="hh-mono-sm">18%</span>
            </div>
            <div className="hh-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={18} aria-label="Storage used">
              <div className="hh-progress-fill" data-fill="20" />
            </div>
          </div>
          <p className="hh-body-sm">Attachments are 71% of it. Ended Rounds older than 30 days are pruned (config.toml).</p>
        </section>
      </div>
    </div>
  );
}

/* ---------- Strict-CSP fill scale and the added icons ---------- */

/** Timer and progress fills from data-fill steps, with no style attribute. */
export function FillScaleDemo() {
  return (
    <div className="hh-stack">
      {[100, 55, 10].map((step) => (
        <div key={step} className="hh-strip" data-status="pending">
          <div className="hh-strip-tab">
            <span>Pending</span>
            <span className="hh-mono-sm">data-fill=&quot;{step}&quot;</span>
          </div>
          <span className="hh-policy-timer" aria-hidden="true">
            <span className="hh-policy-timer-fill" data-fill={String(step)} />
          </span>
        </div>
      ))}
    </div>
  );
}

const ADDED_ICONS: IconName[] = ['copy', 'image', 'markdown', 'trash', 'lock-open', 'chevron-right'];

export function AddedIcons() {
  return (
    <ul className="hh-kbd-hints" aria-label="Icons added for the Command Center">
      {ADDED_ICONS.map((name) => (
        <li key={name}>
          <Icon name={name} /> <code className="hh-mono-sm">{name}</code>
        </li>
      ))}
    </ul>
  );
}
