import type { CSSProperties, ReactNode } from 'react';
import { AGENTS } from '../fixtures';
import { FieldDemo, MenuDemo, OverlayDemo, SwitchDemo, TabsDemo, ToastDemo } from './CoreDemos';
import { Icon } from './Icon';
import { Callsign } from './hermes/Callsign';
import { ConnectionStatus } from './hermes/ConnectionStatus';

function Demo({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="hh-demo">
      <code className="hh-demo-label">{name}</code>
      {children}
    </div>
  );
}

function Group({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <div id={id} className="hh-subsection">
      <h3 className="hh-heading-md">{title}</h3>
      <div className="hh-demo-grid">{children}</div>
    </div>
  );
}

export function CoreSection() {
  return (
    <section id="core" className="hh-section" aria-labelledby="core-title">
      <div className="hh-section-head">
        <h2 id="core-title" className="hh-heading-lg">
          Core components
        </h2>
        <p className="hh-body hh-measure">
          The shared inventory every Hermes screen builds from. Classes are <code>.hh-&lt;component&gt;</code>; variants use <code>data-variant</code>, sizes <code>data-size</code>, state ARIA
          or <code>data-state</code>.
        </p>
      </div>

      <Group id="core-chrome" title="Chrome and navigation">
        <Demo name=".hh-app-bar">
          <header className="hh-app-bar" style={{ position: 'static' }}>
            <span className="hh-app-bar-brand">
              <Icon name="bay" /> Command Center
            </span>
            <span className="hh-app-bar-spacer" />
            <ConnectionStatus state="live" detail="SSE" />
            <span className="hh-avatar" data-size="sm" aria-label="Human">
              JZ
            </span>
          </header>
        </Demo>
        <Demo name=".hh-side-nav">
          <nav className="hh-side-nav" aria-label="Command Center sections (sample)">
            <a href="#core-chrome" aria-current="page">
              <Icon name="bay" /> Triage <span className="hh-side-nav-count">4</span>
            </a>
            <a href="#core-chrome">
              <Icon name="check" /> Answered log <span className="hh-side-nav-count">19</span>
            </a>
            <a href="#core-chrome">
              <Icon name="user" /> Agents <span className="hh-side-nav-count">6</span>
            </a>
            <a href="#core-chrome">
              <Icon name="settings" /> Settings
            </a>
          </nav>
        </Demo>
        <Demo name=".hh-bottom-nav (phone)">
          <nav className="hh-bottom-nav" aria-label="Phone sections (sample)">
            <a href="#core-chrome" aria-current="page">
              <Icon name="bay" /> Pending
            </a>
            <a href="#core-chrome">
              <Icon name="check" /> Log
            </a>
            <a href="#core-chrome">
              <Icon name="user" /> Agents
            </a>
          </nav>
        </Demo>
        <Demo name=".hh-breadcrumbs · .hh-link · .hh-skip-link">
          <nav className="hh-breadcrumbs" aria-label="Breadcrumb (sample)">
            <ol>
              <li>
                <a className="hh-link" href="#core-chrome">
                  Agents
                </a>
              </li>
              <li>
                <a className="hh-link" href="#core-chrome" aria-current="page">
                  CLAUDE·api-refactor
                </a>
              </li>
            </ol>
          </nav>
          <p className="hh-body-sm">
            The skip link sits first on every page: press Tab on load to see <a className="hh-link" href="#top">Skip to main content</a>.
          </p>
        </Demo>
      </Group>

      <Group id="core-actions" title="Actions">
        <Demo name=".hh-button[data-variant]">
          <div className="hh-row">
            <button type="button" className="hh-button" data-variant="primary">
              <Icon name="send" /> Send Answer
            </button>
            <button type="button" className="hh-button">
              Skip for now
            </button>
            <button type="button" className="hh-button" data-variant="ghost">
              Copy id
            </button>
            <button type="button" className="hh-button" data-variant="destructive">
              <Icon name="x" /> Reject
            </button>
            <button type="button" className="hh-button" disabled>
              Send Answer
            </button>
          </div>
          <p className="hh-hint">Disabled buttons always sit beside the reason: “2 Questions need an Answer.”</p>
        </Demo>
        <Demo name=".hh-button[data-size] · .hh-icon-button">
          <div className="hh-row">
            <button type="button" className="hh-button" data-size="sm">
              Small
            </button>
            <button type="button" className="hh-button">
              Default
            </button>
            <button type="button" className="hh-button" data-variant="primary" data-size="lg">
              <Icon name="check" /> Approve
            </button>
            <button type="button" className="hh-icon-button">
              <Icon name="more" label="More actions" />
            </button>
            <button type="button" className="hh-icon-button" data-size="sm" data-variant="ghost">
              <Icon name="x" label="Dismiss" />
            </button>
          </div>
        </Demo>
        <Demo name=".hh-chip[aria-pressed]">
          <div className="hh-row" role="group" aria-label="Filter by Agent (sample)">
            <button type="button" className="hh-chip" aria-pressed="true">
              All Agents
            </button>
            <button type="button" className="hh-chip" aria-pressed="false">
              Claude Code
            </button>
            <button type="button" className="hh-chip" aria-pressed="false">
              Over tailnet
            </button>
          </div>
        </Demo>
        <Demo name=".hh-menu">
          <MenuDemo />
        </Demo>
      </Group>

      <Group id="core-inputs" title="Inputs and fields">
        <Demo name=".hh-field · .hh-input · .hh-error">
          <FieldDemo />
        </Demo>
        <Demo name=".hh-select · .hh-textarea">
          <div className="hh-field">
            <label className="hh-label" htmlFor="core-policy">
              Default Unanswered Policy
            </label>
            <select id="core-policy" className="hh-select" defaultValue="wait">
              <option value="wait">Keep waiting</option>
              <option value="apply">Apply recommended</option>
              <option value="cancel">Cancel</option>
            </select>
          </div>
          <div className="hh-field">
            <label className="hh-label" htmlFor="core-notes">
              Notes
            </label>
            <textarea id="core-notes" className="hh-textarea" defaultValue="Keep the 1 Nov snapshot." />
          </div>
        </Demo>
        <Demo name=".hh-checkbox · .hh-radio · .hh-switch">
          <fieldset className="hh-field">
            <legend className="hh-label">Notify me for</legend>
            <label className="hh-checkbox">
              <input type="checkbox" defaultChecked /> New Rounds
            </label>
            <label className="hh-checkbox">
              <input type="checkbox" /> Policies about to fire
            </label>
          </fieldset>
          <fieldset className="hh-field">
            <legend className="hh-label">Exposure</legend>
            <label className="hh-radio">
              <input type="radio" name="core-exposure" defaultChecked /> This machine only
            </label>
            <label className="hh-radio">
              <input type="radio" name="core-exposure" /> Tailnet
            </label>
          </fieldset>
          <SwitchDemo label="Single-key shortcuts" initial />
        </Demo>
        <Demo name=".hh-tabs">
          <TabsDemo />
        </Demo>
      </Group>

      <Group id="core-containers" title="Containers">
        <Demo name=".hh-card">
          <div className="hh-card hh-stack">
            <Callsign agent={AGENTS[1]} />
            <p className="hh-body-sm">Codex CLI · ~/src/billing · chore/pg17</p>
          </div>
        </Demo>
        <Demo name=".hh-panel">
          <div className="hh-panel hh-stack">
            <p className="hh-heading-md">Agent detail</p>
            <p className="hh-body-sm hh-muted">Side and detail regions.</p>
          </div>
        </Demo>
        <Demo name=".hh-shelf">
          <div className="hh-shelf hh-stack">
            <p className="hh-label">Filter row</p>
            <p className="hh-body-sm hh-muted">Grouping band inside a panel.</p>
          </div>
        </Demo>
        <Demo name=".hh-tray · .hh-divider">
          <div className="hh-tray hh-row">
            <span className="hh-body-sm">Pinned actions</span>
            <span className="hh-app-bar-spacer" />
            <button type="button" className="hh-button" data-variant="primary" data-size="sm">
              Send
            </button>
          </div>
          <hr className="hh-divider" />
        </Demo>
      </Group>

      <Group id="core-feedback" title="Feedback">
        <Demo name=".hh-alert[data-tone]">
          <div className="hh-alert" data-tone="warning" role="note">
            <span className="hh-badge" data-tone="warning">
              Warning
            </span>
            <p className="hh-label">Token expires in 3 days</p>
            <p className="hh-body-sm">Agents on the tailnet lose access when it does. Rotate it in Settings.</p>
          </div>
          <div className="hh-alert" data-tone="destructive" role="note">
            <span className="hh-badge" data-tone="destructive">
              Error
            </span>
            <p className="hh-label">Answer not delivered</p>
            <p className="hh-body-sm">CODEX·billing-migration left before the Answer arrived. It is kept in the log.</p>
          </div>
        </Demo>
        <Demo name=".hh-toast">
          <ToastDemo />
        </Demo>
        <Demo name=".hh-badge[data-tone] · .hh-kbd">
          <div className="hh-row">
            <span className="hh-badge" data-tone="pending">
              Pending
            </span>
            <span className="hh-badge" data-tone="answered">
              Answered
            </span>
            <span className="hh-badge" data-tone="expired">
              Expired
            </span>
            <span className="hh-badge" data-tone="success">
              Delivered
            </span>
            <span className="hh-badge" data-tone="info">
              Tailnet
            </span>
          </div>
          <p className="hh-row hh-body-sm">
            <kbd className="hh-kbd">J</kbd>
            <kbd className="hh-kbd">K</kbd>
            <kbd className="hh-kbd">⌘↵</kbd> keys render as caps with a heavier base.
          </p>
        </Demo>
        <Demo name=".hh-progress · .hh-spinner · .hh-skeleton">
          <div className="hh-progress">
            <div className="hh-progress-head">
              <span className="hh-label" id="core-progress">
                Questions answered
              </span>
              <span className="hh-mono-sm">2 of 3</span>
            </div>
            <div className="hh-progress-track" role="progressbar" aria-labelledby="core-progress" aria-valuemin={0} aria-valuemax={3} aria-valuenow={2}>
              <div className="hh-progress-fill" style={{ '--progress-value': 2 / 3 } as CSSProperties} />
            </div>
          </div>
          <p className="hh-row hh-body-sm" role="status">
            <span className="hh-spinner" aria-hidden="true" /> Loading the answered log
          </p>
          <div className="hh-stack" aria-hidden="true">
            <span className="hh-skeleton" />
            <span className="hh-skeleton" />
          </div>
        </Demo>
        <Demo name=".hh-empty-state">
          <div className="hh-empty-state">
            <Icon name="user" />
            <p className="hh-heading-md">No Agents yet</p>
            <p className="hh-body-sm">Hand the Hub Skill to an Agent; it appears here on its first Round.</p>
          </div>
        </Demo>
      </Group>

      <Group id="core-overlays" title="Overlays">
        <Demo name=".hh-dialog · .hh-sheet · .hh-popover · .hh-tooltip">
          <OverlayDemo />
          <p className="hh-hint">Dialog and sheet are native &lt;dialog&gt; with the scrim backdrop; the popover uses the Popover API; the tooltip shows on hover and focus.</p>
        </Demo>
      </Group>

      <Group id="core-data" title="Data display">
        <Demo name=".hh-table">
          <div className="hh-table-wrap" tabIndex={0} role="region" aria-label="Agents table (sample)">
            <table className="hh-table">
              <thead>
                <tr>
                  <th scope="col">Agent</th>
                  <th scope="col">Pending</th>
                  <th scope="col">Last seen</th>
                </tr>
              </thead>
              <tbody>
                {AGENTS.slice(0, 3).map((agent, index) => (
                  <tr key={agent.id}>
                    <td>
                      <Callsign agent={agent} />
                    </td>
                    <td data-numeric>{[1, 1, 0][index]}</td>
                    <td data-numeric>{agent.lastSeen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Demo>
        <Demo name=".hh-list-row · .hh-avatar">
          <ul className="hh-list">
            {AGENTS.slice(3, 6).map((agent) => (
              <li key={agent.id} className="hh-list-row">
                <span className="hh-avatar" aria-hidden="true">
                  {agent.kind.slice(0, 2).toUpperCase()}
                </span>
                <span className="hh-list-row-main">
                  <Callsign agent={agent} />
                  <span className="hh-body-sm hh-muted"> {agent.host}</span>
                </span>
                <span className="hh-mono-sm">{agent.lastSeen}</span>
              </li>
            ))}
          </ul>
        </Demo>
      </Group>
    </section>
  );
}
