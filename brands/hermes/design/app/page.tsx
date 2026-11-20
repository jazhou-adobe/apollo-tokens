import { withBase } from '../preview/paths';

export default function Home() {
  return (
    <main className="hh-gallery" id="top">
      <div className="hh-hero">
        <h1 className="hh-display">Design system</h1>
        <p className="hh-body-lg hh-measure">
          The system lives at <a className="hh-link" href={withBase('/design')}>/design</a>. Every theme on one screen is at{' '}
          <a className="hh-link" href={withBase('/overview')}>
            /overview
          </a>
          , worlds at <a className="hh-link" href={withBase('/worlds')}>/worlds</a>, and the triage specimen at{' '}
          <a className="hh-link" href={withBase('/specimen')}>
            /specimen
          </a>
          .
        </p>
      </div>
    </main>
  );
}
