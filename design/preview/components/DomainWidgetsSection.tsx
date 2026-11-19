import { CONFIG_METRICS, DISTANCES, KICK_TREND, LENGTHS, SESSIONS, STROKE_TREND, STROKES, SWIMS, TRAINING_TYPES } from '../fixtures';
import { SessionRow, SetGroup, SwimRow, TrendDial, TrendLine } from './charts';
import { Illustrative, Section, SubSection } from './primitives';
import { ChipPicker, LengthStrip, SplitReadout } from './readouts';
import { FaultFlag, ProfileSwitcher, PublishBar, Rating, ReviewSheet, TapPad } from './widgets';

export function ConfigList() {
  return (
    <div className="sb-config-list">
      <div className="sb-table-wrap">
        <table className="sb-table">
          <caption className="sb-body-sm sb-muted">Swimming · Metric definitions in the Draft</caption>
          <thead>
            <tr>
              <th scope="col">Metric definition</th>
              <th scope="col">Key</th>
              <th scope="col">Input</th>
              <th scope="col">Scope</th>
              <th scope="col">Status</th>
              <th scope="col">
                <span className="sb-visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {CONFIG_METRICS.map((metric) => (
              <tr key={metric.key}>
                <th scope="row">{metric.name}</th>
                <td>
                  <code className="sb-code">{metric.key}</code>
                </td>
                <td>{metric.widget}</td>
                <td>{metric.scope}</td>
                <td>
                  <span className="sb-badge" data-tone={metric.status === 'Published' ? 'outline' : undefined}>
                    {metric.status}
                  </span>
                </td>
                <td>
                  <a className="sb-button" data-variant="ghost" data-size="sm" href="#bp-metric-editor">
                    Edit <span className="sb-visually-hidden">{metric.name}</span>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DomainWidgetsSection() {
  return (
    <Section
      id="domain-widgets"
      kicker="Domain widgets"
      title="Domain widgets"
      lead="What a stopwatch can't capture, captured in seconds. Counts and technique lead; times are shown as the result. Every number is a tabular numeral; every state carries a word, number, or shape."
    >
      <SubSection id="dw-tap-pad" title="Tap Pad" note="Try it: Start Swim, tap the counters, tap the wall, undo any tap">
        <div className="sb-row">
          <Illustrative />
        </div>
        <div className="sb-phone">
          <TapPad />
        </div>
      </SubSection>

      <SubSection id="dw-readouts" title="Length strip and split read-out" note=".sb-length-strip · .sb-split-readout">
        <div className="sb-pair">
          <div className="sb-card">
            <SplitReadout value="1:18.42" caption={['100 m freestyle', '4 Lengths', 'total time']} />
          </div>
          <div className="sb-pair-axis" aria-hidden="true" />
          <div className="sb-card">
            <LengthStrip
              label="Splits by Length"
              unit="seconds"
              cells={[...LENGTHS.slice(0, 3).map((length) => ({ number: length.number, value: length.split, state: 'done' as const })), { number: 4, state: 'current' }, { number: 5, state: 'upcoming' }, { number: 6, state: 'upcoming' }]}
            />
            <p className="sb-body-sm sb-muted">Solid: swum. Heavy frame: now. Dashed: still to come. Each cell prints its Length number and split.</p>
          </div>
        </div>
      </SubSection>

      <SubSection id="dw-pickers" title="Chip pickers" note="Pre-Swim setup: stroke, distance, training type">
        <div className="sb-card">
          <ChipPicker legend="Stroke" name="dw-stroke" options={STROKES} defaultValue="Freestyle" />
          <ChipPicker legend="Distance" name="dw-distance" options={DISTANCES} defaultValue="100 m" />
          <ChipPicker legend="Training type" name="dw-type" options={TRAINING_TYPES} defaultValue="Swim" />
        </div>
      </SubSection>

      <SubSection id="dw-rating" title="Rating and fault flag" note="A Technique point rated 1–5 with cue text; a Fault as an observer's note">
        <div className="sb-grid" data-min="wide">
          <div className="sb-card">
            <Rating label="Head position" />
          </div>
          <div className="sb-card">
            <FaultFlag label="Head surfaced after 15 m" note="Freestyle start or turn" />
            <FaultFlag label="Missed wall touch on the turn" note="Feet did not touch the wall" defaultNoted />
            <p className="sb-body-sm sb-muted">A Fault records what one person saw. Splitbook never makes an official call.</p>
          </div>
        </div>
      </SubSection>

      <SubSection id="dw-review" title="Review sheet" note="Completed straight after a Swim">
        <div className="sb-phone">
          <ReviewSheet />
        </div>
      </SubSection>

      <SubSection id="dw-rows" title="Swim, Session and Set rows" note=".sb-swim-row · .sb-session-row · .sb-set-group">
        <div className="sb-row">
          <Illustrative />
        </div>
        <ul className="sb-list">
          {SESSIONS.map((session) => (
            <li key={session.id}>
              <SessionRow session={session} />
            </li>
          ))}
        </ul>
        <SetGroup title="3 × 100 m freestyle on 1:45" summary="Kicks held at 5 per wall; strokes crept up by half a stroke" swims={SWIMS.slice(0, 3)} />
        <ul className="sb-list">
          <li>
            <SwimRow swim={SWIMS[3]} />
          </li>
        </ul>
      </SubSection>

      <SubSection id="dw-trends" title="Metric and Technique trends" note="Plain lines and a clock dial, never fitness rings">
        <div className="sb-row">
          <Illustrative />
        </div>
        <div className="sb-pair">
          <div className="sb-card">
            <TrendLine
              title="Underwater kicks off each wall"
              unit="Average per wall, 100 m freestyle"
              points={KICK_TREND}
              better="higher"
              summary="3 more kicks off every wall than in July."
            />
          </div>
          <div className="sb-pair-axis" aria-hidden="true" />
          <div className="sb-card">
            <TrendDial label="Head position" then={2.8} now={4.1} thenLabel="August" nowLabel="November" />
            <p className="sb-body-sm">Head position rose from 2.8 to 4.1 out of 5: eyes down more often, with fewer lifts on breaths.</p>
          </div>
        </div>
        <div className="sb-card">
          <TrendLine
            title="Strokes per Length"
            unit="Average per 25 m Length, freestyle"
            points={STROKE_TREND}
            better="lower"
            summary="About 3 fewer strokes per Length than in July: more distance from each stroke."
          />
        </div>
      </SubSection>

      <SubSection id="dw-profile" title="Profile switcher" note="Swimmer menu (APG menu button, radio items)">
        <div className="sb-card">
          <ProfileSwitcher />
        </div>
      </SubSection>

      <SubSection id="dw-admin" title="Configuration list and publish bar" note="Admin console, compact density">
        <div className="sb-stack" data-density="compact">
          <ConfigList />
          <PublishBar />
        </div>
      </SubSection>
    </Section>
  );
}
