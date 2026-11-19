import { CONFIG_VERSIONS, DISTANCES, KICK_TREND, LENGTHS, REVIEW_SWIM, SESSIONS, STROKE_TREND, STROKES, SWIMS, TRAINING_TYPES } from '../fixtures';
import { ReviewSheet } from './capture';
import { SessionRow, SetGroup, SwimRow, TrendDial, TrendLine } from './charts';
import { ConfigList } from './DomainWidgetsSection';
import { Icon } from './Icon';
import { Alert, Field, Figure, Frame, Illustrative, Section } from './primitives';
import { ChipPicker, LengthStrip, SplitReadout } from './readouts';
import { ProfileSwitcher, PublishBar } from './widgets';

// The brief's pages, composed from the components above. Watcher pages are Light (Capture opts into Deck), Admin pages
// are compact, system states cover sign-in, empty, loading, offline, error, and not found.

function WatcherBar({ title }: { title: string }) {
  return (
    <header className="sb-app-bar" data-static="true">
      <a className="sb-wordmark" href="#watcher-blueprints">
        <Icon name="clock" /> Splitbook
      </a>
      <span className="sb-label">{title}</span>
      <ProfileSwitcher />
    </header>
  );
}

function AdminBar({ title }: { title: string }) {
  return (
    <header className="sb-app-bar" data-static="true">
      <a className="sb-wordmark" href="#admin-blueprints">
        <Icon name="lock" /> Admin console
      </a>
      <nav className="sb-breadcrumbs" aria-label={`Breadcrumb: ${title}`}>
        <ol>
          <li>
            <a href="#bp-config-list">Swimming</a>
          </li>
          <li>
            <span aria-current="page">{title}</span>
          </li>
        </ol>
      </nav>
    </header>
  );
}

export function WatcherBlueprintsSection() {
  return (
    <Section
      id="watcher-blueprints"
      kicker="Blueprints"
      title="Watcher blueprints"
      lead="The pages a parent or coach uses: Light on the desk, Deck at the pool. Each frame is a composition of the components above, with illustrative data."
    >
      <Illustrative />
      <Frame id="bp-home" title="Swimmer home" note="Light · start here" flush>
        <WatcherBar title="Home" />
        <div className="sb-frame-body">
          <div className="sb-row" data-justify="between">
            <div className="sb-row">
              <span className="sb-avatar" data-size="lg" aria-hidden="true">
                MI
              </span>
              <div>
                <h4 className="sb-heading-lg">Mia</h4>
                <p className="sb-body-sm sb-muted">12 · freestyle and backstroke · 25 m pool</p>
              </div>
            </div>
            <a className="sb-button" data-size="lg" href="#bp-setup">
              <Icon name="play" /> New Session
            </a>
          </div>
          <Alert tone="improvement" title="Better than before">
            3 more kicks off every wall than in July, and about 3 fewer strokes per Length.
          </Alert>
          <div className="sb-pair">
            <div className="sb-card">
              <TrendLine title="Underwater kicks off each wall" unit="Average per wall" points={KICK_TREND} better="higher" summary="Up from 3.0 in July to 6.0 now." />
            </div>
            <div className="sb-pair-axis" aria-hidden="true" />
            <div className="sb-stack">
              <h4 className="sb-heading-md">Recent Sessions</h4>
              <ul className="sb-list">
                {SESSIONS.slice(0, 2).map((session) => (
                  <li key={session.id}>
                    <SessionRow session={session} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Frame>

      <Frame id="bp-setup" title="Pre-Swim setup" note="Light or Deck · one screen, then Start">
        <div className="sb-phone sb-stack">
          <div className="sb-card">
            <ChipPicker legend="Stroke" name="bp-stroke" options={STROKES} defaultValue="Freestyle" />
            <ChipPicker legend="Distance" name="bp-distance" options={DISTANCES} defaultValue="100 m" />
            <ChipPicker legend="Training type" name="bp-type" options={TRAINING_TYPES} defaultValue="Swim" />
            <ChipPicker legend="Focus metrics for the Tap Pad (pick up to two)" name="bp-focus" options={['Underwater kicks', 'Strokes', 'Breaths', 'Split only']} defaultValue="Underwater kicks" multiple />
          </div>
          <div className="sb-tray">
            <span className="sb-body-sm">Capture template: Freestyle technique</span>
            <a className="sb-button" data-size="lg" href="#bp-capture">
              <Icon name="play" /> Start Swim
            </a>
          </div>
        </div>
      </Frame>

      <Frame id="bp-capture" title="Live Capture (Tap Pad, Deck)" note="Pace Clock Deck · live /specimen frame" flush>
        <iframe className="sb-frame-iframe" src="/specimen?theme=splitbook-deck&demo=midswim" title="Live Capture in the Deck theme, mid-Swim example" loading="lazy" />
      </Frame>

      <Frame id="bp-review" title="Review sheet" note="Deck at the pool, Light when finished later">
        <div className="sb-phone">
          <ReviewSheet swim={REVIEW_SWIM} headingLevel={4} label="Review sheet blueprint, illustrative 100 m freestyle" compact />
        </div>
      </Frame>

      <Frame id="bp-history" title="Session history" note="Light" flush>
        <WatcherBar title="Sessions" />
        <div className="sb-frame-body">
          <div className="sb-row" data-justify="between">
            <h4 className="sb-heading-lg">Sessions</h4>
            <ChipPicker legend="Show" name="bp-history-filter" options={['All', 'Freestyle', 'Kick sets']} defaultValue="All" />
          </div>
          <ul className="sb-list">
            {SESSIONS.map((session) => (
              <li key={session.id}>
                <SessionRow session={session} />
              </li>
            ))}
          </ul>
        </div>
      </Frame>

      <Frame id="bp-swim" title="Swim detail" note="Light · counts first, time as the result" flush>
        <WatcherBar title="Swim detail" />
        <div className="sb-frame-body">
          <nav className="sb-breadcrumbs" aria-label="Breadcrumb: Swim detail">
            <ol>
              <li>
                <a href="#bp-history">Sessions</a>
              </li>
              <li>
                <a href="#bp-history">Tuesday squad</a>
              </li>
              <li>
                <span aria-current="page">100 m freestyle</span>
              </li>
            </ol>
          </nav>
          <div className="sb-row">
            <Figure value="5.0" label="kicks per wall" tone="metric" />
            <Figure value="17.0" label="strokes per Length" />
            <Figure value="4 of 5" label="head position" />
            <Figure value="1:18.42" label="time" />
          </div>
          <LengthStrip label="Splits by Length" unit="seconds" cells={LENGTHS.map((length) => ({ number: length.number, value: length.split, state: 'done' }))} />
          <SetGroup title="3 × 100 m freestyle on 1:45" summary="This Swim is the first of three" swims={SWIMS.slice(0, 1)} />
        </div>
      </Frame>

      <Frame id="bp-metric-trends" title="Metric trends" note="Light · plain lines, one sentence each" flush>
        <WatcherBar title="Trends" />
        <div className="sb-frame-body sb-grid" data-min="wide">
          <TrendLine title="Underwater kicks off each wall" unit="Average per wall" points={KICK_TREND} better="higher" summary="3 more kicks off every wall than in July." />
          <TrendLine title="Strokes per Length" unit="Average per 25 m" points={STROKE_TREND} better="lower" summary="About 3 fewer strokes per Length than in July." />
        </div>
      </Frame>

      <Frame id="bp-technique-trend" title="Technique trend" note="Light · then ↔ now on one axis">
        <div className="sb-pair">
          <TrendDial label="Head position" then={2.8} now={4.1} thenLabel="August" nowLabel="November" />
          <div className="sb-pair-axis" aria-hidden="true" />
          <TrendDial label="Streamline off the wall" then={3.2} now={3.6} thenLabel="August" nowLabel="November" />
        </div>
        <p className="sb-measure">Head position is up 1.3 and streamline 0.4 since August. Both are rated on the Review sheet after each Swim.</p>
      </Frame>

      <Frame id="bp-defaults" title="Profile and Account defaults" note="Light · Profile defaults override Account defaults">
        <div className="sb-grid" data-min="wide">
          <form className="sb-card" aria-label="Profile defaults for Mia">
            <h4 className="sb-heading-md">Mia&apos;s Profile defaults</h4>
            <Field id="bp-pool" label="Usual pool length">
              <select id="bp-pool" className="sb-select" defaultValue="25 m">
                <option>25 m</option>
                <option>50 m</option>
              </select>
            </Field>
            <Field id="bp-stroke-main" label="Main stroke">
              <select id="bp-stroke-main" className="sb-select" defaultValue="Freestyle">
                {STROKES.map((stroke) => (
                  <option key={stroke}>{stroke}</option>
                ))}
              </select>
            </Field>
            <Field id="bp-target-kicks" label="Target underwater kicks per wall" hint="Shown as a reference line on the trend.">
              <input id="bp-target-kicks" className="sb-input" data-numeric="true" inputMode="numeric" defaultValue="6" aria-describedby="bp-target-kicks-hint" />
            </Field>
            <button type="button" className="sb-button">
              Save Profile defaults
            </button>
          </form>
          <form className="sb-card" aria-label="Account defaults">
            <h4 className="sb-heading-md">Account defaults</h4>
            <fieldset className="sb-fieldset">
              <legend className="sb-label">Units</legend>
              <label className="sb-radio">
                <input type="radio" name="bp-units" defaultChecked /> Metres
              </label>
              <label className="sb-radio">
                <input type="radio" name="bp-units" /> Yards
              </label>
            </fieldset>
            <Field id="bp-template" label="Default Capture template">
              <select id="bp-template" className="sb-select" defaultValue="Freestyle technique">
                <option>Freestyle technique</option>
                <option>Kick set</option>
                <option>My template: race pace</option>
              </select>
            </Field>
            <button type="button" className="sb-button">
              Save Account defaults
            </button>
          </form>
        </div>
      </Frame>
    </Section>
  );
}

export function AdminBlueprintsSection() {
  return (
    <Section
      id="admin-blueprints"
      kicker="Blueprints"
      title="Admin blueprints"
      lead="The password-protected Admin console, in compact density. Configuration is versioned; publishing never rewrites recorded Swims."
    >
      <div className="sb-stack" data-density="compact">
        <Frame id="bp-config-list" title="Configuration list" note="Compact" flush>
          <AdminBar title="Metric definitions" />
          <div className="sb-frame-body">
            <div className="sb-admin-shell">
              <nav className="sb-side-nav" aria-label="Configuration areas">
                <a href="#bp-config-list" aria-current="page">
                  Metric definitions
                </a>
                <a href="#bp-config-list">Events</a>
                <a href="#bp-config-list">Training types</a>
                <a href="#bp-config-list">Capture templates</a>
                <a href="#bp-versions">Versions</a>
              </nav>
              <div className="sb-stack">
                <ConfigList label="Metric definitions table (Configuration list blueprint)" />
                <PublishBar label="Draft and publish (Configuration list blueprint)" />
              </div>
            </div>
          </div>
        </Frame>

        <Frame id="bp-metric-editor" title="Metric definition editor with formula preview" note="Compact" flush>
          <AdminBar title="SWOLF" />
          <div className="sb-frame-body sb-grid" data-min="wide">
            <form className="sb-card" aria-label="Edit SWOLF">
              <Field id="bp-key" label="Key" hint="Stable. Recorded Values keep pointing at it.">
                <input id="bp-key" className="sb-input sb-code" defaultValue="swolf" readOnly aria-describedby="bp-key-hint" />
              </Field>
              <Field id="bp-name" label="Display name">
                <input id="bp-name" className="sb-input" defaultValue="SWOLF" />
              </Field>
              <Field id="bp-help" label="Plain-words explanation" hint="Shown wherever SWOLF appears.">
                <textarea id="bp-help" className="sb-textarea" defaultValue="Strokes plus seconds for one Length. Lower means more distance for less effort." aria-describedby="bp-help-hint" />
              </Field>
              <Field id="bp-formula" label="Formula">
                <input id="bp-formula" className="sb-input sb-code" defaultValue="stroke_count + split_seconds" />
              </Field>
            </form>
            <div className="sb-formula-preview" role="region" aria-label="Formula preview">
              <strong className="sb-label">Preview on a recorded Swim</strong>
              <div className="sb-table-wrap" role="region" aria-label="Formula preview table" tabIndex={0}>
                <table className="sb-table">
                  <thead>
                    <tr>
                      <th scope="col">Length</th>
                      <th scope="col" data-numeric="true">
                        stroke_count
                      </th>
                      <th scope="col" data-numeric="true">
                        split_seconds
                      </th>
                      <th scope="col" data-numeric="true">
                        swolf
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {LENGTHS.map((length) => (
                      <tr key={length.number}>
                        <th scope="row">{length.number}</th>
                        <td data-numeric="true">{length.strokes}</td>
                        <td data-numeric="true">{length.split}</td>
                        <td data-numeric="true">{(length.strokes + Number(length.split)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <span className="sb-body-sm">
                <Icon name="check" /> Formula is valid. It reads 2 Metrics and no others.
              </span>
            </div>
          </div>
        </Frame>

        <Frame id="bp-publish" title="Publish with reach choice" note="Compact · the reach choice is explicit" flush>
          <div className="sb-frame-body">
            <Alert tone="warning" title="SWOLF formula changed">
              Choose where it applies. Recorded Values are kept either way; recalculating adds new derived Values beside them.
            </Alert>
            <PublishBar label="Draft and publish (publish blueprint)" />
          </div>
        </Frame>

        <Frame id="bp-versions" title="Configuration version history" note="Compact" flush>
          <div className="sb-frame-body">
            <div className="sb-table-wrap" role="region" aria-label="Configuration version history table" tabIndex={0}>
              <table className="sb-table">
                <caption className="sb-body-sm sb-muted">Swimming Configuration versions, newest first</caption>
                <thead>
                  <tr>
                    <th scope="col">Version</th>
                    <th scope="col">Published</th>
                    <th scope="col">By</th>
                    <th scope="col">What changed</th>
                  </tr>
                </thead>
                <tbody>
                  {CONFIG_VERSIONS.map((version) => (
                    <tr key={version.version}>
                      <th scope="row">
                        <code className="sb-code">{version.version}</code>
                      </th>
                      <td>{version.when}</td>
                      <td>{version.by}</td>
                      <td>{version.change}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Frame>
      </div>
    </Section>
  );
}

export function SystemStatesSection() {
  return (
    <Section id="system-states" kicker="Blueprints" title="System states" lead="The states every page can be in. Each says what happened, what is safe, and what to do next, in plain words.">
      <div className="sb-grid" data-min="wide">
        <Frame id="sys-sign-in" title="Sign in" note="Clerk card, localised to Splitbook">
          <div className="sb-card sb-auth-card">
            <h4 className="sb-heading-md">Sign in to Splitbook</h4>
            <p className="sb-body-sm sb-muted">Welcome back. Your Swimmers&apos; Sessions are private to your account.</p>
            <Field id="sys-email" label="Email address">
              <input id="sys-email" className="sb-input" type="email" autoComplete="email" />
            </Field>
            <button type="button" className="sb-button">
              Continue
            </button>
            <p className="sb-body-sm">
              New to Splitbook? <a className="sb-link" href="#sys-sign-in">Create an account</a>
            </p>
          </div>
        </Frame>
        <Frame id="sys-empty" title="Empty" note="First visit">
          <div className="sb-empty-state">
            <Icon name="pool" />
            <h4 className="sb-heading-md">Add your first Swimmer</h4>
            <p>A Profile holds one Swimmer&apos;s Sessions and trends. You can add more later.</p>
            <a className="sb-button" href="#bp-defaults">
              Add a Swimmer
            </a>
          </div>
        </Frame>
        <Frame id="sys-loading" title="Loading" note="Skeletons keep the layout">
          <div className="sb-stack" role="status" aria-label="Loading Sessions">
            <span className="sb-skeleton" data-shape="numeral" />
            <span className="sb-skeleton" />
            <span className="sb-skeleton" />
            <span className="sb-row">
              <span className="sb-spinner" aria-hidden="true" /> Loading Sessions…
            </span>
          </div>
        </Frame>
        <Frame id="sys-offline" title="Offline" note="Capture keeps working">
          <Alert tone="warning" title="You’re offline" role="status">
            Taps and Review sheets are kept on this device and sync when you reconnect. Keep capturing.
          </Alert>
          <SplitReadout value="38.12" caption={['Length 2 of 4', 'saved on this device']} />
        </Frame>
        <Frame id="sys-error" title="Error" note="Nothing entered is lost">
          <Alert tone="destructive" title="Couldn’t load trends" role="alert">
            Your Sessions are safe. Check your connection, then try again.
          </Alert>
          <button type="button" className="sb-button" data-variant="secondary">
            Try again
          </button>
        </Frame>
        <Frame id="sys-not-found" title="Not found" note="Also live at any unknown URL">
          <div className="sb-empty-state">
            <Icon name="search" />
            <h4 className="sb-heading-md">We can&apos;t find that page</h4>
            <p>It may have moved, or the link may be incomplete.</p>
            <a className="sb-button" href="/">
              Go to Swimmer home
            </a>
          </div>
        </Frame>
      </div>
    </Section>
  );
}

export function AgentRecipeSection() {
  return (
    <Section
      id="agent-recipe"
      kicker="For agents"
      title="Agent recipe"
      lead="The short version of agent-contract/screen-generation-rules.md: how an agent builds a Splitbook screen from this system."
    >
      <ol className="sb-steps">
        <li>Name the blueprint the screen belongs to (watcher, Admin console, or system state) and the theme: Light on the desk, Deck for Capture.</li>
        <li>Set the theme on the root element only: data-theme on html, and data-density=&quot;compact&quot; on the Admin console region only.</li>
        <li>Compose from .sb- components and domain widgets. Put the one primary action in the bottom tray on Capture screens.</li>
        <li>Use roles, never raw values: hand colours only for their job (live, metric, improvement); destructive is not a Fault.</li>
        <li>Give every state a word, number, or shape. Set every number in tabular display numerals.</li>
        <li>Write in the coach&apos;s clipboard voice with glossary terms. Explain jargon. Label fixture data as illustrative.</li>
        <li>Check: npm run validate, keyboard path, 390 and 1440 wide, reduced motion, both themes.</li>
      </ol>
      <pre className="sb-pre" role="region" aria-label="Example markup: a live Capture screen" tabIndex={0}>
        {`<html data-theme="splitbook-deck">
  <header class="sb-app-bar">… <button class="sb-button" data-variant="secondary">End Swim</button></header>
  <main id="main">
    <section class="sb-tap-pad" data-state="live" aria-labelledby="pad-title">
      … read-outs …
      <div class="sb-tap-keys" role="group" aria-label="Tap keys">
        <button class="sb-tap-key" data-kind="counter">…</button>
        <button class="sb-tap-key" data-kind="wall">Wall tap</button>
      </div>
      <div class="sb-action-row">
        <button class="sb-button" data-variant="secondary">Undo wall tap</button>
      </div>
      <p class="sb-tap-status" role="status">Length 2: 19.9 seconds, 17 strokes.</p>
    </section>
  </main>
</html>`}
      </pre>
      <div className="bg-surface-card text-surface-card-foreground border border-border rounded-md p-4 grid gap-2">
        <strong className="text-label">Tailwind bridge</strong>
        <p className="text-body-sm">
          Semantic utilities only: <code>bg-surface-card</code>, <code>text-metric</code>, <code>border-border</code>, <code>rounded-md</code>, <code>p-4</code> on the space rail.{' '}
          <span className="text-metric">Palette utilities do not exist.</span>
        </p>
      </div>
    </Section>
  );
}
