import tokens from '../tokens/tokens.json';
import approachLights from '../tokens/worlds/approach-lights.json';
import flightDeck from '../tokens/worlds/flight-deck.json';
import sortieBoard from '../tokens/worlds/sortie-board.json';
import type { ThemeOption } from './theme-constants';

// Server-side theme registry: the core themes from tokens.json plus every seeded world in tokens/worlds/.
// Pass THEMES to client components as props; never import this module from a 'use client' file.

type ColourSet = Record<string, { $value: string }>;

export type WorldDefinition = {
  label: string;
  order: number;
  $description: string;
  signature: string;
  colorScheme: string;
  color: ColourSet;
  /** Names the default colours in the theme block. */
  palette?: { label: string };
  /** Alternative colour sets, applied with data-palette: two alternatives, then "original". */
  palettes?: { id: string; label: string; colorScheme: string; color: ColourSet }[];
};

/** One colour option. The default comes first with id '' (it lives in the theme block, so no data-palette is set). */
export type WorldPalette = { id: string; label: string; colorScheme: string; swatches: { role: string; value: string }[] };

export type World = {
  slug: string;
  value: string;
  label: string;
  order: number;
  idea: string;
  signature: string;
  palettes: WorldPalette[];
};

/*
 * Registered worlds. To register one, import its JSON at the top of this file and add one entry, then import its
 * stylesheet in app/globals.css:
 *   import approachLights from '../tokens/worlds/approach-lights.json';
 *   ['approach-lights', approachLights],
 * The theme value (splitbook-<slug>), the /worlds gallery, /overview, the theme menu, the colour menu, and the
 * pre-paint script all follow from this array.
 */
const WORLD_FILES: [string, WorldDefinition][] = [
  ['approach-lights', approachLights],
  ['flight-deck', flightDeck],
  ['sortie-board', sortieBoard],
];

// The roles that carry most of a palette's identity, in the order the gallery paints them.
const SWATCH_ROLES = ['background', 'surface-card', 'foreground', 'primary', 'live', 'metric', 'improvement'];

export const WORLDS: World[] = WORLD_FILES.map(([slug, world]) => ({
  slug,
  value: `splitbook-${slug}`,
  label: world.label,
  order: world.order,
  idea: world.$description,
  signature: world.signature,
  palettes: [{ id: '', label: world.palette?.label ?? 'Default', colorScheme: world.colorScheme, color: world.color }, ...(world.palettes ?? [])].map((palette) => ({
    id: palette.id,
    label: palette.label,
    colorScheme: palette.colorScheme,
    swatches: SWATCH_ROLES.map((role) => ({ role, value: palette.color[role].$value })),
  })),
})).sort((a, b) => a.order - b.order);

/** Valid data-palette values per theme, for the pre-paint layout script. */
export const PALETTE_IDS: Record<string, string[]> = Object.fromEntries(
  WORLDS.map((world) => [world.value, world.palettes.filter((palette) => palette.id).map((palette) => palette.id)]),
);

const CORE_LABELS: Record<string, string> = {
  'splitbook-light': 'Pace Clock Light',
  'splitbook-deck': 'Pace Clock Deck',
};

const coreThemes = tokens.themes as Record<string, { $description: string }>;

export const CORE_THEMES: ThemeOption[] = tokens.meta.themes.map((value) => ({
  value,
  label: CORE_LABELS[value] ?? value,
  group: 'Core' as const,
  idea: coreThemes[value].$description,
  palettes: [],
}));

export const THEMES: ThemeOption[] = [
  ...CORE_THEMES,
  ...WORLDS.map((world) => ({
    value: world.value,
    label: world.label,
    group: 'Seeded worlds' as const,
    idea: world.idea,
    palettes: world.palettes.map(({ id, label }) => ({ id, label })),
  })),
];
