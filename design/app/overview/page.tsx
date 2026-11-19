import type { Metadata } from 'next';
import { OverviewGrid, type OverviewItem } from '../../preview/components/OverviewGrid';
import { CORE_THEMES, WORLDS } from '../../preview/themes';

export const metadata: Metadata = { title: 'Every Splitbook theme' };

// Static route: every core theme and registered world on one screen, each a live /tile thumbnail.
export const dynamic = 'force-static';

const items: OverviewItem[] = [
  ...CORE_THEMES.map((theme) => ({ value: theme.value, label: theme.label, core: true, palettes: [] })),
  ...WORLDS.map((world) => ({ value: world.value, label: world.label, core: false, palettes: world.palettes })),
];

export default function OverviewPage() {
  return <OverviewGrid items={items} worldCount={WORLDS.length} />;
}
