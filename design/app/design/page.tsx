import type { Metadata } from 'next';
import { AdminBlueprintsSection, AgentRecipeSection, SystemStatesSection, WatcherBlueprintsSection } from '../../preview/components/BlueprintSections';
import { CoreComponentsSection } from '../../preview/components/CoreComponentsSection';
import { DomainWidgetsSection } from '../../preview/components/DomainWidgetsSection';
import { ColourRoles, DeckKnob, SpacingShape, TypeAndNumerals } from '../../preview/components/FoundationSections';
import { Icon } from '../../preview/components/Icon';
import { Section } from '../../preview/components/primitives';
import { PreviewShell } from '../../preview/components/PreviewShell';
import { SECTIONS } from '../../preview/fixtures';

export const metadata: Metadata = { title: 'Splitbook Design System' };

// Static route: fixtures only, no auth, database, cookies, server actions, or APIs.
export const dynamic = 'force-static';

export default function DesignPreviewPage() {
  return (
    <PreviewShell current="/design" sections={SECTIONS}>
      <section className="sb-hero" aria-labelledby="page-title">
        <span className="sb-kicker">Pace Clock · Splitbook design system</span>
        <h1 id="page-title" className="sb-display">
          Better before faster.
        </h1>
        <p className="sb-body-lg sb-measure">
          Chalk-tile white, ink, and the four hands of the pool&apos;s pace clock, each with one job. Big tabular numerals carry the story; counts and technique lead and
          times follow. Switch theme in the sidebar to see every example re-render from the same tokens.
        </p>
        <div className="sb-row">
          <span className="sb-badge" data-tone="live">
            <Icon name="clock" /> Live: recording now
          </span>
          <span className="sb-badge" data-tone="metric">
            Metric: a captured value
          </span>
          <span className="sb-badge" data-tone="improvement">
            <Icon name="arrow-up" /> Improvement: better than before
          </span>
          <span className="sb-badge" data-tone="outline">
            Ink: everything else
          </span>
        </div>
      </section>
      <Section id="foundations" kicker="Foundations" title="Foundations" lead="Colour roles, type and numerals, space and shape, and the Deck knob.">
        <ColourRoles />
        <TypeAndNumerals />
        <SpacingShape />
        <DeckKnob />
      </Section>
      <CoreComponentsSection />
      <DomainWidgetsSection />
      <WatcherBlueprintsSection />
      <AdminBlueprintsSection />
      <SystemStatesSection />
      <AgentRecipeSection />
    </PreviewShell>
  );
}
