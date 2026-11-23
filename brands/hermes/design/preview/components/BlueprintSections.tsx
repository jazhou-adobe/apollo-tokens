import type { ReactNode } from 'react';
import { AGENTS, ANSWERED_LOG, ROUNDS } from '../fixtures';
import { Icon } from './Icon';
import { AgentRoster } from './hermes/AgentRoster';
import { AnsweredLog } from './hermes/AnsweredLog';
import { Attachment } from './hermes/Attachment';
import { Callsign } from './hermes/Callsign';
import { AdvisorRunHistory, CommandAppBar, CommandShell, DetectionDetails, FeedAnsweredLog, SettingsPanels } from './hermes/CommandCenterParts';
import { ConnectionStatus } from './hermes/ConnectionStatus';
import { EndedRound, FeedAnchors, FeedIndex, FeedKeys, ForgetAgentDemo, FullRound, LanesView, SimpleRound } from './hermes/Feed';
import { StripBay } from './hermes/StripBay';
import { PolicyBadge } from './hermes/PolicyTimer';
import { QuestionsDemo } from './hermes/QuestionsDemo';
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
        <p className="hh-body hh-measure">
          Desktop first: dense, keyboard-driven work beside the terminals, full width beside the side nav. Each blueprint is composed only from the components above.
          Illustrative data.
        </p>
      </div>

      <FeedAnchors prefix="bp" label="(blueprint)">
        <Blueprint
          id="bp-feed"
          title="Feed"
          note="Every Pending Round fully expanded in one scrolling column, in arrival order, beside the sticky Feed index. Only the action bar of the Round in view sticks. Superseded and expired Rounds stay in place, read-only, until removed."
        >
          <CommandAppBar />
          <CommandShell current="Feed" label="Feed blueprint">
            <div className="hh-feed">
              <FeedIndex headingLevel={4} />
              <div className="hh-feed-column">
                <div className="hh-bay-status" role="status" />
                <FeedKeys label="the Feed blueprint">
                  <ol className="hh-feed-list" aria-label="Pending Rounds">
                    <FullRound />
                    <SimpleRound />
                    <EndedRound kind="superseded" />
                    <EndedRound kind="expired" />
                  </ol>
                </FeedKeys>
              </div>
            </div>
          </CommandShell>
        </Blueprint>

        <Blueprint id="bp-round" title="Round detail" note="One Round at its own URL, opened from a notification, the log or a terminal link. Same Questions and action bar; the Advisor run history below.">
          <CommandAppBar />
          <div className="hh-blueprint-body">
            <nav className="hh-breadcrumbs" aria-label="Breadcrumb (Round detail)">
              <ol>
                <li>
                  <a className="hh-link" href="#bp-feed">
                    Feed
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
            <h4 className="hh-heading-md">Advisor runs</h4>
            <AdvisorRunHistory label="Advisor runs for R-0142 (Round detail blueprint)" />
          </div>
        </Blueprint>

        <Blueprint id="bp-log" title="Answered log" note="Every Round that left the Feed or ended in it: Outcome words, each value and who set it, delivery, search with the match marked, Copy as Markdown and Export JSON.">
          <CommandAppBar />
          <CommandShell current="Answered log" label="Answered log blueprint">
            <FeedAnsweredLog />
          </CommandShell>
        </Blueprint>

        <Blueprint id="bp-roster" title="Agents" note="The session roster, then the Lanes view: one lane per Agent session with its Pending Rounds, and the Round drawer beside the lanes.">
          <CommandAppBar />
          <CommandShell current="Agents" label="Agents blueprint">
            <div className="hh-page-head">
              <h4 className="hh-heading-lg">Agents · 4</h4>
            </div>
            <AgentRoster agents={AGENTS.slice(0, 4)} detail={false} />
            <h4 className="hh-heading-md">Lanes</h4>
            <LanesView />
          </CommandShell>
        </Blueprint>

        <Blueprint id="bp-agent" title="Agent detail" note="One Agent: Detection details with the signal and clash suffix, the resume handle with Copy, its Rounds, and Forget.">
          <CommandAppBar />
          <div className="hh-blueprint-body">
            <DetectionDetails open={false} />
            <Attachment attachment={{ kind: 'code', title: 'Resume this session', meta: 'shell', code: 'claude --resume 7f3c9e21-48d0-4b6a-9c1e-2a7d5f0b1c33' }} />
            <AnsweredLog entries={ANSWERED_LOG.filter((entry) => entry.agentId === agent.id)} caption="Rounds from CLAUDE·api-refactor" />
            <ForgetAgentDemo />
          </div>
        </Blueprint>

        <Blueprint
          id="bp-settings"
          title="Settings"
          note="Live controls (notifications, quiet hours, sound off by default, appearance, single-key shortcuts) and read-only views of config.toml (Advisors, Auto-ask rules) with the file path, reload time or config error; then Storage."
        >
          <CommandAppBar />
          <CommandShell current="Settings" label="Settings blueprint">
            <SettingsPanels />
          </CommandShell>
        </Blueprint>

        <Blueprint
          id="bp-triage"
          title="Strip-bay triage (reference)"
          note="Not the Hub's Phase 1 triage, which is the Feed. Kept as the reference for the strip bay beside a single open Round, which fits its sheet so its head and Answer bar stay in view."
        >
          <AppBar title="Command Center" />
          <div className="hh-blueprint-body">
            <StripBay controls={false} showLog={false} heading="Pending Rounds" headingLevel={4} context="Triage blueprint" />
          </div>
        </Blueprint>
      </FeedAnchors>
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
        <p className="hh-body hh-measure">
          Phone second: quick approve / reject over the tailnet, in glance density. Not in the Hub&apos;s Phase 1 (it is local only); kept as the reference for glance
          density. Pending list, then the Round as a full-width sheet with a sticky Answer bar and Back to pending. The second frame opens on a Round.
        </p>
      </div>
      <div className="hh-phone-row">
        <div className="hh-phone-frame" data-density="glance" aria-label="Phone: pending list" role="group">
          <AppBar title="Hermes" />
          <StripBay controls={false} showLog={false} heading="Pending" headingLevel={3} context="Phone pending list" />
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
          <StripBay controls={false} showLog={false} heading="Pending" headingLevel={3} context="Phone Round sheet" initialView="round" initialOpenId="R-0144" />
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
        <p className="hh-body hh-measure">
          The Hub not reachable, reconnecting, empty, and error; sign-in stays as a reference (the Hub is local only and has no sign-in). Each names its state in words and
          says what happens next.
        </p>
      </div>
      <div className="hh-system-grid">
        <div className="hh-demo">
          <code className="hh-demo-label">Sign in (reference, not in the Hub)</code>
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
