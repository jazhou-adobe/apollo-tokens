import type { Metadata } from 'next';
import { ActiveTheme } from '../../preview/components/ActiveTheme';
import { CaptureSpecimen } from '../../preview/components/capture';
import { Illustrative } from '../../preview/components/primitives';
import { ThemeLink } from '../../preview/components/ThemeLink';
import { THEMES } from '../../preview/themes';

export const metadata: Metadata = { title: 'Splitbook Capture specimen' };

// Static route: one Capture screen whose Tap Pad and Review sheet share a single preview Swim. The theme comes from
// ?theme= and ?palette=, sizing from ?density=deck (see app/layout.tsx); ?demo=midswim opens it mid-Swim (gallery frames).
export const dynamic = 'force-static';

export default function SpecimenPage() {
  return (
    <CaptureSpecimen
      meta={
        <div className="sb-row">
          <Illustrative />
          <div className="sb-capture-aside">
            <ActiveTheme options={THEMES} lead="Capture specimen" />
          </div>
          <ThemeLink href="/design" className="sb-link sb-body-sm sb-capture-aside">
            Open the system
          </ThemeLink>
        </div>
      }
    />
  );
}
