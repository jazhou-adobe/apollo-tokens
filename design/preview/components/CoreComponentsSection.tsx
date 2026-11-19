import { SESSIONS, SWIMS } from '../fixtures';
import { DialogDemo, PopoverDemo, SheetDemo, SwimActionsMenu, Switch, Tabs, ToastDemo } from './demos';
import { Icon } from './Icon';
import { Alert, Field, Illustrative, Progress, Section, SubSection } from './primitives';
import { SessionRow, SwimRow } from './charts';

// Every core component in the shared inventory, each under its .sb-* class.

export function CoreComponentsSection() {
  return (
    <Section
      id="core-components"
      kicker="Core components"
      title="Core components"
      lead="The parts every Splitbook screen is built from. Each uses the .sb- class of the same name, variants on data-variant, sizes on data-size, and state on ARIA attributes."
    >
      <SubSection id="cc-actions" title="Actions and links" note="button · icon-button · link · skip-link · kbd">
        <div className="sb-card">
          <div className="sb-row">
            <button type="button" className="sb-button">
              Start Swim
            </button>
            <button type="button" className="sb-button" data-variant="secondary">
              Add a Set
            </button>
            <button type="button" className="sb-button" data-variant="ghost">
              Skip for now
            </button>
            <button type="button" className="sb-button" data-variant="destructive">
              Delete Swim
            </button>
            <button type="button" className="sb-button" disabled>
              Publish (no changes)
            </button>
          </div>
          <div className="sb-row">
            <button type="button" className="sb-button" data-size="sm">
              Small
            </button>
            <button type="button" className="sb-button" data-size="lg">
              <Icon name="play" /> Large: Start Swim
            </button>
            <button type="button" className="sb-icon-button" aria-label="Undo last tap">
              <Icon name="undo" />
            </button>
            <button type="button" className="sb-icon-button" aria-label="Search Sessions">
              <Icon name="search" />
            </button>
          </div>
          <p>
            Read <a className="sb-link" href="#dw-trends">how Metric trends are worked out</a>. The skip link is the first stop on every page: press <kbd className="sb-kbd">Tab</kbd> from the
            top to see it. Close a dialog or sheet with <kbd className="sb-kbd">Esc</kbd>.
          </p>
        </div>
      </SubSection>

      <SubSection id="cc-inputs" title="Inputs and fields" note="field · input · textarea · select · checkbox · radio · switch · chip">
        <div className="sb-grid" data-min="wide">
          <div className="sb-card">
            <Field id="cc-pool" label="Pool length" hint="Used to split a Swim into Lengths.">
              <select id="cc-pool" className="sb-select" defaultValue="25 m" aria-describedby="cc-pool-hint">
                <option>25 m</option>
                <option>50 m</option>
                <option>25 yd</option>
              </select>
            </Field>
            <Field id="cc-target" label="Target strokes per Length" hint="Profile default for Mia.">
              <input id="cc-target" className="sb-input" data-numeric="true" inputMode="numeric" defaultValue="17" aria-describedby="cc-target-hint" />
            </Field>
            <Field id="cc-venue" label="Venue" error="Add a venue so Sessions at different pools stay apart.">
              <input id="cc-venue" className="sb-input" aria-invalid="true" aria-describedby="cc-venue-error" />
            </Field>
            <Field id="cc-notes" label="Context" hint="Anything that might explain the numbers: tiredness, a crowded lane.">
              <textarea id="cc-notes" className="sb-textarea" aria-describedby="cc-notes-hint" />
            </Field>
          </div>
          <div className="sb-card">
            <fieldset className="sb-fieldset">
              <legend className="sb-label">Units</legend>
              <label className="sb-radio">
                <input type="radio" name="cc-units" defaultChecked /> Metres
              </label>
              <label className="sb-radio">
                <input type="radio" name="cc-units" /> Yards
              </label>
            </fieldset>
            <label className="sb-checkbox">
              <input type="checkbox" defaultChecked /> Group Swims into a Set after Capture
            </label>
            <Switch label="Show times on the Swimmer summary" />
            <Switch label="Keep the screen awake during Capture" initial />
            <fieldset className="sb-fieldset">
              <legend className="sb-label">Chip (single choice)</legend>
              <div className="sb-chip-group">
                {['Freestyle', 'Backstroke', 'Breaststroke'].map((stroke, index) => (
                  <label key={stroke} className="sb-chip">
                    <input type="radio" name="cc-chip" defaultChecked={index === 0} />
                    <span className="sb-chip-check">
                      <Icon name="check" />
                    </span>
                    {stroke}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </div>
      </SubSection>

      <SubSection id="cc-containers" title="Containers" note="card · panel · shelf · tray · divider">
        <div className="sb-grid">
          <div className="sb-card">
            <h4 className="sb-heading-md">Card</h4>
            <p className="sb-body-sm">The first surface a reader meets: a Swim, a trend, a Profile.</p>
          </div>
          <div className="sb-panel">
            <h4 className="sb-heading-md">Panel</h4>
            <p className="sb-body-sm">Groups related cards, like the paired Tap Pad and Review sheet.</p>
          </div>
          <div className="sb-shelf">
            <h4 className="sb-heading-md">Shelf</h4>
            <p className="sb-body-sm">Secondary lists and filters beside the main content.</p>
          </div>
        </div>
        <hr className="sb-divider" />
        <div className="sb-tray">
          <span className="sb-body-sm">Tray: primary actions in the reach zone.</span>
          <button type="button" className="sb-button">
            Save Swim
          </button>
        </div>
        <hr className="sb-divider" data-variant="axis" />
      </SubSection>

      <SubSection id="cc-navigation" title="Navigation" note="app-bar · side-nav · bottom-nav · breadcrumbs · tabs">
        <div className="sb-frame">
          <header className="sb-app-bar" data-static="true">
            <a className="sb-wordmark" href="#cc-navigation">
              <Icon name="clock" /> Splitbook
            </a>
            <nav className="sb-breadcrumbs" aria-label="Breadcrumb">
              <ol>
                <li>
                  <a href="#cc-navigation">Mia</a>
                </li>
                <li>
                  <a href="#cc-navigation">Sessions</a>
                </li>
                <li>
                  <span aria-current="page">Tuesday squad</span>
                </li>
              </ol>
            </nav>
          </header>
          <div className="sb-frame-body">
            <div className="sb-grid">
              <nav className="sb-side-nav" aria-label="Watcher sections (example)">
                <a href="#cc-navigation" aria-current="page">
                  <Icon name="home" /> Home
                </a>
                <a href="#cc-navigation">
                  <Icon name="history" /> Sessions
                </a>
                <a href="#cc-navigation">
                  <Icon name="trend" /> Trends
                </a>
                <a href="#cc-navigation">
                  <Icon name="user" /> Profile
                </a>
              </nav>
              <Tabs
                label="Swim detail views"
                tabs={[
                  { id: 'lengths', label: 'Lengths', content: <p className="sb-body-sm">Four Lengths with splits, strokes and kicks.</p> },
                  { id: 'technique', label: 'Technique', content: <p className="sb-body-sm">Head position rated 4 of 5.</p> },
                  { id: 'faults', label: 'Faults', content: <p className="sb-body-sm">One observer&apos;s note: head surfaced after 15 m.</p> },
                ]}
              />
            </div>
          </div>
          <nav className="sb-bottom-nav" aria-label="Watcher sections, phone (example)">
            <a href="#cc-navigation" aria-current="page">
              <Icon name="home" /> Home
            </a>
            <a href="#cc-navigation">
              <Icon name="play" /> Capture
            </a>
            <a href="#cc-navigation">
              <Icon name="history" /> Sessions
            </a>
            <a href="#cc-navigation">
              <Icon name="trend" /> Trends
            </a>
          </nav>
        </div>
      </SubSection>

      <SubSection id="cc-feedback" title="Feedback" note="alert · toast · progress · spinner · skeleton · badge">
        <div className="sb-grid" data-min="wide">
          <div className="sb-stack">
            <Alert tone="info" title="Capture template changed">
              The Freestyle template now asks for head position on every Review sheet.
            </Alert>
            <Alert tone="success" title="Swim saved">
              Metric trends now include it.
            </Alert>
            <Alert tone="warning" title="You’re offline">
              Taps are kept on this device and sync when you reconnect. Keep capturing.
            </Alert>
            <Alert tone="destructive" title="Couldn’t save the Review sheet">
              Your entries are still here. Try again, or keep them on this device for now.
            </Alert>
            <Alert tone="improvement" title="Better than before">
              3 more kicks off every wall than in July.
            </Alert>
          </div>
          <div className="sb-card">
            <Progress label="Lengths captured" percent={75} valueText="3 of 4 Lengths" />
            <div className="sb-row" role="status">
              <span className="sb-spinner" aria-hidden="true" /> Loading Sessions…
            </div>
            <div className="sb-stack" data-gap="tight" aria-hidden="true">
              <span className="sb-skeleton" data-shape="numeral" />
              <span className="sb-skeleton" />
              <span className="sb-skeleton" />
            </div>
            <div className="sb-row">
              <span className="sb-badge" data-tone="live">
                <Icon name="clock" /> Recording
              </span>
              <span className="sb-badge" data-tone="metric">
                Focus metric
              </span>
              <span className="sb-badge" data-tone="improvement">
                <Icon name="arrow-up" /> Better
              </span>
              <span className="sb-badge" data-tone="fault">
                <Icon name="flag" /> Fault noted
              </span>
              <span className="sb-badge">Draft</span>
              <span className="sb-badge" data-tone="success">
                <Icon name="check" /> Published
              </span>
            </div>
            <ToastDemo />
          </div>
        </div>
      </SubSection>

      <SubSection id="cc-overlays" title="Overlays" note="dialog · sheet · popover · tooltip · menu">
        <div className="sb-card">
          <div className="sb-row">
            <DialogDemo />
            <SheetDemo />
            <PopoverDemo />
            <span className="sb-tooltip-wrap">
              <button type="button" className="sb-icon-button" aria-describedby="cc-tooltip">
                <Icon name="info" label="About DPS" />
              </button>
              <span id="cc-tooltip" role="tooltip" className="sb-tooltip">
                DPS: distance per stroke. Pool length divided by strokes in the Length.
              </span>
            </span>
            <SwimActionsMenu />
          </div>
          <p className="sb-body-sm sb-muted">Dialogs confirm only what can’t be undone. Nothing time-critical ever waits behind one.</p>
        </div>
      </SubSection>

      <SubSection id="cc-data" title="Data display" note="table · list-row · avatar · empty-state">
        <div className="sb-row">
          <Illustrative />
        </div>
        <div className="sb-table-wrap" role="region" aria-label="Data table example: Lengths of a 100 m freestyle Swim" tabIndex={0}>
          <table className="sb-table">
            <caption className="sb-body-sm sb-muted">Lengths of a 100 m freestyle Swim</caption>
            <thead>
              <tr>
                <th scope="col">Length</th>
                <th scope="col" data-numeric="true">
                  Underwater kicks
                </th>
                <th scope="col" data-numeric="true">
                  Strokes
                </th>
                <th scope="col" data-numeric="true">
                  Split
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                [1, 6, 16, '17.84'],
                [2, 5, 17, '19.92'],
                [3, 5, 17, '20.31'],
                [4, 4, 18, '20.35'],
              ].map(([length, kicks, strokes, split]) => (
                <tr key={length}>
                  <th scope="row">Length {length}</th>
                  <td data-numeric="true">{kicks}</td>
                  <td data-numeric="true">{strokes}</td>
                  <td data-numeric="true">{split}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="sb-list">
          <li>
            <div className="sb-list-row">
              <span className="sb-avatar" aria-hidden="true">
                MI
              </span>
              <span className="sb-list-row-main">
                <strong>Mia</strong>
                <span className="sb-list-row-meta">12 · freestyle and backstroke</span>
              </span>
              <Icon name="chevron-right" />
            </div>
          </li>
          <li>
            <SessionRow session={SESSIONS[0]} href="#cc-data" />
          </li>
          <li>
            <SwimRow swim={SWIMS[0]} href="#cc-data" />
          </li>
        </ul>
        <div className="sb-row">
          <span className="sb-avatar" data-size="sm" aria-hidden="true">
            LE
          </span>
          <span className="sb-avatar" aria-hidden="true">
            AV
          </span>
          <span className="sb-avatar" data-size="lg" aria-hidden="true">
            MI
          </span>
        </div>
        <div className="sb-empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path d="M3 18c2 0 2-1.5 4.5-1.5S9.5 18 12 18s2-1.5 4.5-1.5S18.5 18 21 18M7 15V5M17 15V5M7 8h10M7 12h10" />
          </svg>
          <h4 className="sb-heading-md">No Sessions yet</h4>
          <p className="sb-measure">Your first Session starts when you pick a stroke and distance and tap Start Swim.</p>
          <a className="sb-button" href="#bp-setup">
            Set up a Swim
          </a>
        </div>
      </SubSection>
    </Section>
  );
}
