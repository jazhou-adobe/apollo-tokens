import type { Metadata } from 'next';
import { ActiveTheme } from '../../preview/components/ActiveTheme';
import { ConnectionStatus } from '../../preview/components/hermes/ConnectionStatus';
import { ToggleStrip } from '../../preview/components/hermes/Strip';
import { ROUNDS } from '../../preview/fixtures';
import { THEMES } from '../../preview/themes';

export const metadata: Metadata = { title: 'Hermes theme thumbnail' };

// Static route: a composition sized to the thumbnail viewport (--hh-layout-thumbnail-width × -height), so /overview can
// show every theme at once. The theme comes from ?theme= and ?palette= (see app/layout.tsx).
export const dynamic = 'force-static';

export default function TilePage() {
  return (
    <main className="hh-thumb" aria-labelledby="thumb-title">
      <div className="hh-thumb-head">
        <div>
          <h1 id="thumb-title" className="hh-display">
            Strip board
          </h1>
          <ActiveTheme options={THEMES} />
        </div>
        <ConnectionStatus state="live" detail="4 pending" />
      </div>
      <div className="hh-thumb-body">
        <ul className="hh-strip-bay-list" data-density="compact">
          <ToggleStrip round={ROUNDS[0]} />
          <ToggleStrip round={ROUNDS[1]} />
        </ul>
        <ul className="hh-strip-bay-list" data-density="compact">
          <ToggleStrip round={ROUNDS[2]} />
          <ToggleStrip round={ROUNDS[4]} />
        </ul>
      </div>
    </main>
  );
}
