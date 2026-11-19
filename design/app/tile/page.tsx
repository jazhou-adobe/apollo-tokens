import type { Metadata } from 'next';
import { ActiveTheme } from '../../preview/components/ActiveTheme';
import { TrendDial } from '../../preview/components/charts';
import { Icon } from '../../preview/components/Icon';
import { LengthStrip, SplitReadout } from '../../preview/components/readouts';
import { LENGTHS } from '../../preview/fixtures';
import { THEMES } from '../../preview/themes';

export const metadata: Metadata = { title: 'Splitbook theme thumbnail' };

// Static route: a composition sized to the thumbnail viewport (--sb-layout-thumbnail-width × -height), so /overview can
// show every theme at once. The theme comes from ?theme= and ?palette= (see app/layout.tsx).
export const dynamic = 'force-static';

export default function TilePage() {
  return (
    <main className="sb-thumb" aria-labelledby="thumb-title">
      <div className="sb-thumb-head">
        <h1 id="thumb-title" className="sb-display">
          100 m freestyle
        </h1>
        <ActiveTheme options={THEMES} lead="Illustrative" />
      </div>
      <div className="sb-thumb-body">
        <div className="sb-tap-pad" data-state="live">
          <div className="sb-tap-pad-head">
            <span className="sb-heading-md">Tap Pad</span>
            <span className="sb-live-mark" data-state="live">
              Recording
            </span>
          </div>
          <SplitReadout value="58.07" live caption={['Length 3 of 4', 'running split']} />
          <LengthStrip
            label="Lengths"
            unit="seconds"
            cells={[...LENGTHS.slice(0, 2).map((length) => ({ number: length.number, value: length.split, state: 'done' as const })), { number: 3, state: 'current' }, { number: 4, state: 'upcoming' }]}
          />
          <div className="sb-tap-keys">
            <span className="sb-tap-key" data-kind="counter">
              <span className="sb-numeral" data-size="lg">
                5
              </span>
              <span className="sb-tap-key-label">Underwater kicks</span>
            </span>
            <span className="sb-tap-key" data-kind="wall">
              <Icon name="wall" />
              <span className="sb-tap-key-label">Wall tap</span>
            </span>
          </div>
        </div>
        <div className="sb-pair-axis" aria-hidden="true" />
        <div className="sb-card">
          <TrendDial label="Head position" then={2.8} now={4.1} thenLabel="Aug" nowLabel="Nov" />
          <span className="sb-badge" data-tone="improvement">
            <Icon name="arrow-up" /> 3 more kicks off every wall
          </span>
          <span className="sb-badge" data-tone="fault">
            <Icon name="flag" /> Noted: head surfaced after 15 m
          </span>
        </div>
      </div>
    </main>
  );
}
