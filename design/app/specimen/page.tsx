import type { Metadata } from 'next';
import { ActiveTheme, ThemeLink } from '../../preview/components/ActiveTheme';
import { Icon } from '../../preview/components/Icon';
import { StripBay } from '../../preview/components/hermes/StripBay';
import { ConnectionStatus } from '../../preview/components/hermes/ConnectionStatus';
import { THEMES } from '../../preview/themes';

export const metadata: Metadata = { title: 'Hermes triage specimen' };

// Static route: one compact triage screen, the frame every world is judged in. The theme comes from ?theme= and ?palette=
// (see app/layout.tsx), so one page renders every theme and colour option. Illustrative data.
export const dynamic = 'force-static';

export default function SpecimenPage() {
  return (
    <div className="hh-specimen">
      <a className="hh-skip-link" href="#top">
        Skip to main content
      </a>
      <header className="hh-app-bar">
        <span className="hh-app-bar-brand">
          <Icon name="bay" /> Command Center
        </span>
        <span className="hh-app-bar-spacer" />
        <ConnectionStatus state="live" detail="SSE" />
        <ThemeLink href="/design" className="hh-button" variant="secondary">
          Design system
        </ThemeLink>
      </header>
      <main className="hh-specimen-body" id="top" tabIndex={-1} aria-labelledby="specimen-title">
        <div className="hh-stack">
          <h1 id="specimen-title" className="hh-heading-lg">
            Triage
          </h1>
          <ActiveTheme options={THEMES} lead="Illustrative data" />
        </div>
        <StripBay controls={false} showLog={false} heading="Pending Rounds" headingLevel={2} context="Triage specimen" demo />
      </main>
    </div>
  );
}
