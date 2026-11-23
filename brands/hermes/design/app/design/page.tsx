import type { Metadata } from 'next';
import { AgentRecipeSection } from '../../preview/components/AgentRecipeSection';
import { CommandCenterBlueprints, PhoneBlueprints, SystemBlueprints } from '../../preview/components/BlueprintSections';
import { CoreSection } from '../../preview/components/CoreSection';
import { DomainSection } from '../../preview/components/DomainSection';
import { FeedSection } from '../../preview/components/FeedSection';
import { ColourSection, DensitySection, DirectionSection, SpacingSection, TypographySection } from '../../preview/components/FoundationSections';
import { PreviewShell } from '../../preview/components/PreviewShell';
import { SECTIONS } from '../../preview/fixtures';

export const metadata: Metadata = { title: 'Hermes Hub design system' };

// Static route: fixtures only, no auth, database, cookies, server actions, or APIs.
export const dynamic = 'force-static';

export default function DesignPage() {
  return (
    <PreviewShell current="/design" sections={SECTIONS}>
      <DirectionSection />
      <ColourSection />
      <TypographySection />
      <SpacingSection />
      <DensitySection />
      <CoreSection />
      <DomainSection />
      <FeedSection />
      <CommandCenterBlueprints />
      <PhoneBlueprints />
      <SystemBlueprints />
      <AgentRecipeSection />
    </PreviewShell>
  );
}
