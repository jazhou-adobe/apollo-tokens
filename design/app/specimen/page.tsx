import type { Metadata } from 'next';
import { ActiveTheme } from '../../preview/components/ActiveTheme';
import { Icon } from '../../preview/components/Icon';
import { Illustrative } from '../../preview/components/primitives';
import { ThemeLink } from '../../preview/components/ThemeLink';
import { ProfileSwitcher, ReviewSheet, TapPad } from '../../preview/components/widgets';
import { THEMES } from '../../preview/themes';

export const metadata: Metadata = { title: 'Splitbook Capture specimen' };

// Static route: one compact Capture + Review screen. The theme comes from ?theme= and ?palette= (see app/layout.tsx), so
// world gallery frames and the Deck Capture blueprint render this same page in any theme.
export const dynamic = 'force-static';

export default function SpecimenPage() {
  return (
    <main className="sb-specimen" id="top" aria-labelledby="specimen-title">
      <header className="sb-app-bar">
        <span className="sb-wordmark">
          <Icon name="clock" /> Splitbook
        </span>
        <ProfileSwitcher />
      </header>
      <div className="sb-specimen-body">
        <div className="sb-row" data-justify="between">
          <div className="sb-stack" data-gap="tight">
            <h1 id="specimen-title" className="sb-heading-lg">
              Tuesday squad · Capture
            </h1>
            <ActiveTheme options={THEMES} lead="Capture specimen" />
          </div>
          <div className="sb-row">
            <Illustrative />
            <ThemeLink href="/design" className="sb-button" variant="ghost">
              Open the system
            </ThemeLink>
          </div>
        </div>
        <div className="sb-pair">
          <TapPad />
          <div className="sb-pair-axis" aria-hidden="true" />
          <ReviewSheet compact />
        </div>
      </div>
    </main>
  );
}
