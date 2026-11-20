import type { Metadata } from 'next';
import { Icon } from '../../preview/components/Icon';
import { WorldCard } from '../../preview/components/WorldCard';
import { withBase } from '../../preview/paths';
import { WORLDS } from '../../preview/themes';

export const metadata: Metadata = { title: 'Splitbook seeded worlds' };

// Static route. Each card frames /specimen?theme=<world>[&palette=<id>], so every world renders live and independently of
// the page theme. Worlds appear here once registered in preview/themes.ts (WORLD_FILES) and app/globals.css.
export const dynamic = 'force-static';

export default function WorldsPage() {
  return (
    <main className="sb-gallery" id="top" aria-labelledby="worlds-title">
      <header className="sb-hero">
        <span className="sb-kicker">Used future</span>
        <h1 id="worlds-title" className="sb-display">
          Seeded worlds
        </h1>
        <p className="sb-body-lg sb-measure">
          Each world re-skins the same components, tokens, and accessibility gates in a used-future style: real flight-deck conventions pushed forward in time. A
          world may change type, shape, and depth, and brings four colour options; motion, density, spacing, and target sizes stay system-wide.
        </p>
        <div className="sb-row">
          <a className="sb-button" href={withBase('/overview')}>
            Every theme on one screen
          </a>
          <a className="sb-button" data-variant="secondary" href={withBase('/design')}>
            Open the design system
          </a>
        </div>
      </header>

      {WORLDS.length ? (
        <ol className="sb-gallery-grid">
          {WORLDS.map((world) => (
            <WorldCard key={world.slug} world={world} />
          ))}
        </ol>
      ) : (
        <div className="sb-empty-state">
          <Icon name="pool" />
          <h2 className="sb-heading-md">No worlds registered yet</h2>
          <p className="sb-measure">
            A world is two files in tokens/worlds/ (slug.json and slug.css) plus one line in preview/themes.ts and one import in app/globals.css. The validator checks it
            against every gate the core themes pass. Until then, the two core themes are on the overview.
          </p>
          <a className="sb-button" href={withBase('/overview')}>
            See the core themes
          </a>
        </div>
      )}
    </main>
  );
}
