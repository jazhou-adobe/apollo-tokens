import { withBase } from '../preview/paths';

export default function Home() {
  return (
    <main className="sb-gallery" id="top">
      <header className="sb-hero">
        <span className="sb-kicker">Splitbook design system</span>
        <h1 className="sb-display">See what a stopwatch can’t.</h1>
        <p className="sb-body-lg sb-measure">
          The Pace Clock system for Splitbook: tokens, the Light and Deck themes, components, Capture and trend widgets, blueprints, and the agent recipe.
        </p>
        <div className="sb-row">
          <a className="sb-button" href={withBase('/design')}>
            Open the design system
          </a>
          <a className="sb-button" data-variant="secondary" href={withBase('/specimen')}>
            Capture specimen
          </a>
          <a className="sb-button" data-variant="secondary" href={withBase('/overview')}>
            Every theme
          </a>
          <a className="sb-button" data-variant="ghost" href={withBase('/worlds')}>
            Seeded worlds
          </a>
        </div>
      </header>
    </main>
  );
}
