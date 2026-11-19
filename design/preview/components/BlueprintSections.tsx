import type { ReactNode } from 'react';
import { AGENTS, ANSWERED_LOG, ROUNDS } from '../fixtures';
import { CoreSettingsNav } from './BlueprintParts';
import { Icon } from './Icon';
import { AgentRoster } from './hermes/AgentRoster';
import { AnsweredLog } from './hermes/AnsweredLog';
import { Attachment } from './hermes/Attachment';
import { Callsign } from './hermes/Callsign';
import { ConnectionStatus } from './hermes/ConnectionStatus';
import { PhoneApprove, PhonePendingList } from './hermes/PhoneDemos';
import { PolicyBadge } from './hermes/PolicyTimer';
import { QuestionsDemo } from './hermes/QuestionsDemo';
import { StripBay } from './hermes/StripBay';
import { ReconnectingDemo, SignInDemo } from './SystemDemos';

function AppBar({ title }: { title: string }) {
  return (
    <header className="hh-app-bar" style={{ position: 'static' }}>
      <span className="hh-app-bar-brand">
        <Icon name="bay" /> {title}
      </span>
      <span className="hh-app-bar-spacer" />
      <span className="hh-live-value" data-live="true">
        4 pending
      </span>
      <ConnectionStatus state="live" detail="SSE" />
    </header>
  );
}

function Blueprint({ id, title, note, children }: { id: string; title: string; note: string; children: ReactNode }) {
  return (
    <div id={id} className="hh-subsection">
      <h3 className="hh-heading-md">{title}</h3>
      <p className="hh-body-sm hh-measure">{note}</p>
      <div className="hh-blueprint">{children}</div>
    </div>
  );
}

const agent = AGENTS[0];

export function CommandCenterBlueprints() {
  return (
    <section id="blueprints-command" className="hh-section" aria-labelledby="blueprints-command-title">
      <div className="hh-section-head">
        <h2 id="blueprints-command-title" className="hh-heading-lg">
          Command Center blueprints
        </h2>
        <p className="hh-body hh-measure">Desktop first: dense, keyboard-driven triage beside the terminals. Each blueprint is composed only from the components above. Illustrative data.</p>
      </div>

      <Blueprint id="bp-triage" title="Triage" note="Strip bay (compact) beside the open Round. The Answer bar stays pinned; the answered log sits one key away.">
        <AppBar title="Command Center" />
        <div className="hh-blueprint-body">
          <StripBay controls={false} showLog={false} heading="Pending Rounds" />
        </div>
      </Blueprint>

      <Blueprint id="bp-round" title="Round detail" note="One Round on its own page, reached from a notification or a shared link. Same Questions, same Answer bar.">
        <AppBar title="Round R-0142" />
        <div className="hh-blueprint-body">
          <nav className="hh-breadcrumbs" aria-label="Breadcrumb (Round detail)">
            <ol>
              <li>
                <a className="hh-link" href="#bp-triage">
                  Triage
                </a>
              </li>
              <li>
                <span aria-current="page">R-0142</span>
              </li>
            </ol>
          </nav>
          <div className="hh-row">
            <span className="hh-badge" data-tone="pending">
              Pending
            </span>
            <Callsign agent={agent} />
            <PolicyBadge policy={ROUNDS[0].policy} remaining={ROUNDS[0].remaining} />
          </div>
          <QuestionsDemo questions={ROUNDS[0].questions.map((question) => ({ ...question, id: `detail-${question.id}` }))} />
        </div>
      </Blueprint>

      <Blueprint id="bp-log" title="Answered log" note="Every Round that left the bay: answered, expired, or cancelled. Compact rows, status words on holder colours.">
        <AppBar title="Answered log" />
        <div className="hh-blueprint-body">
          <div className="hh-row" role="group" aria-label="Filter the log (sample)">
            <button type="button" className="hh-chip" aria-pressed="true">
              Today
            </button>
            <button type="button" className="hh-chip" aria-pressed="false">
              Expired only
            </button>
          </div>
          <AnsweredLog entries={ANSWERED_LOG} caption="Answered log (blueprint)" />
        </div>
      </Blueprint>

      <Blueprint id="bp-roster" title="Agent roster" note="Every Agent the Hub has seen, with how it was identified.">
        <AppBar title="Agents" />
        <div className="hh-blueprint-body">
          <AgentRoster agents={AGENTS} detail={false} />
        </div>
      </Blueprint>

      <Blueprint id="bp-agent" title="Agent detail" note="One Agent: detection details, its Rounds, and the resume command for its session.">
        <AppBar title="CLAUDE·api-refactor" />
        <div className="hh-blueprint-body">
          <AgentRoster agents={[agent]} />
          <Attachment attachment={{ kind: 'code', title: 'Resume this session', meta: 'shell', code: 'claude --resume 7f3c9e21-48d0-4b6a-9c1e-2a7d5f0b1c33' }} />
          <AnsweredLog entries={ANSWERED_LOG.filter((entry) => entry.agentId === agent.id)} caption="Rounds from CLAUDE·api-refactor" />
        </div>
      </Blueprint>

      <Blueprint id="bp-settings" title="Settings" note="Agent tokens, exposure (this machine or tailnet), and notifications.">
        <AppBar title="Settings" />
        <div className="hh-blueprint-body">
          <CoreSettingsNav />
        </div>
      </Blueprint>
    </section>
  );
}

export function PhoneBlueprints() {
  return (
    <section id="blueprints-phone" className="hh-section" aria-labelledby="blueprints-phone-title">
      <div className="hh-section-head">
        <h2 id="blueprints-phone-title" className="hh-heading-lg">
          Phone blueprints
        </h2>
        <p className="hh-body hh-measure">Phone second: quick approve / reject over the tailnet. Both frames run in glance density: thumb-sized targets, roomier rows, larger body text.</p>
      </div>
      <div className="hh-phone-row">
        <div className="hh-phone-frame" data-density="glance" aria-label="Phone: pending list" role="group">
          <AppBar title="Hermes" />
          <PhonePendingList />
          <nav className="hh-bottom-nav" aria-label="Phone sections (pending list)">
            <a href="#blueprints-phone" aria-current="page">
              <Icon name="bay" /> Pending
            </a>
            <a href="#blueprints-phone">
              <Icon name="check" /> Log
            </a>
          </nav>
        </div>
        <div className="hh-phone-frame" data-density="glance" aria-label="Phone: one Round" role="group">
          <AppBar title="Hermes" />
          <PhoneApprove />
          <nav className="hh-bottom-nav" aria-label="Phone sections (one Round)">
            <a href="#blueprints-phone" aria-current="page">
              <Icon name="bay" /> Pending
            </a>
            <a href="#blueprints-phone">
              <Icon name="check" /> Log
            </a>
          </nav>
        </div>
      </div>
    </section>
  );
}

export function SystemBlueprints() {
  return (
    <section id="blueprints-system" className="hh-section" aria-labelledby="blueprints-system-title">
      <div className="hh-section-head">
        <h2 id="blueprints-system-title" className="hh-heading-lg">
          System blueprints
        </h2>
        <p className="hh-body hh-measure">Sign-in, the Hub not reachable, reconnecting, empty, and error. Each names its state in words and says what happens next.</p>
      </div>
      <div className="hh-system-grid">
        <div className="hh-demo">
          <code className="hh-demo-label">Sign in</code>
          <SignInDemo />
        </div>
        <div className="hh-demo">
          <code className="hh-demo-label">Not reachable</code>
          <div className="hh-card hh-stack">
            <ConnectionStatus state="offline" detail="since 09:41" />
            <h3 className="hh-heading-md">The Hub is not reachable</h3>
            <p className="hh-body-sm">
              Nothing answers on <code>127.0.0.1:7341</code>. Start it with <code>hermes up</code>, or check the tailnet if you are away from the machine.
            </p>
            <a className="hh-button" href="#blueprints-system">
              <Icon name="refresh" /> Try again
            </a>
          </div>
        </div>
        <div className="hh-demo">
          <code className="hh-demo-label">Reconnecting</code>
          <ReconnectingDemo />
        </div>
        <div className="hh-demo">
          <code className="hh-demo-label">Empty</code>
          <div className="hh-empty-state">
            <Icon name="bay" />
            <p className="hh-heading-md">Bay clear</p>
            <p className="hh-body-sm">No Rounds pending. Agents learn to send them from the Hub Skill.</p>
          </div>
        </div>
        <div className="hh-demo">
          <code className="hh-demo-label">Error</code>
          <div className="hh-alert" data-tone="destructive" role="alert">
            <span className="hh-badge" data-tone="destructive">
              Error
            </span>
            <p className="hh-label">Answer not saved</p>
            <p className="hh-body-sm">The Hub returned 500 for R-0142. Your choices are still on screen. Send again, or copy them for the Agent.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
