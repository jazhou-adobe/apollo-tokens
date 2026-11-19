import type { Metadata } from 'next';
import { Icon } from '../../preview/components/Icon';
import { WorldCard } from '../../preview/components/WorldCard';
import { WORLDS } from '../../preview/themes';

export const metadata: Metadata = { title: 'Hermes worlds' };

// Static route. Each frame loads /specimen?theme=<world>[&palette=<id>], so every world renders live and independently of
// the page theme. Links are plain anchors: the layout script applies theme and palette on a full page load only.
export const dynamic = 'force-static';

export default function WorldsPage() {
  return (
    <main className="hh-gallery" id="top" aria-labelledby="worlds-title">
      <header className="hh-hero">
        <span className="hh-kicker">Used-future skins over the same strip board</span>
        <h1 id="worlds-title" className="hh-display">
          Worlds
        </h1>
        <p className="hh-body-lg hh-measure">
          A world re-skins the same components, tokens, and accessibility gates with its own faces, shape, depth, and one signature moment. Each ships four colour options: the recommended
          default, two alternatives, and the original.
        </p>
        <div className="hh-row">
          <a className="hh-button" data-variant="primary" href="/overview">
            Every theme on one screen
          </a>
          <a className="hh-button" href="/design">
            Open the design system
          </a>
        </div>
      </header>

      {WORLDS.length ? (
        <ol className="hh-gallery-grid">
          {WORLDS.map((world) => (
            <WorldCard key={world.slug} world={world} />
          ))}
        </ol>
      ) : (
        <div className="hh-empty-state">
          <Icon name="bay" />
          <p className="hh-heading-md">No worlds registered</p>
          <p className="hh-body-sm hh-measure">
            Add <code>tokens/worlds/&lt;slug&gt;.json</code> and <code>&lt;slug&gt;.css</code>, load any new face in <code>app/fonts.ts</code>, then add the slug to{' '}
            <code>WORLD_SLUGS</code> in <code>preview/themes.ts</code>. The validator checks the rest.
          </p>
        </div>
      )}
    </main>
  );
}
