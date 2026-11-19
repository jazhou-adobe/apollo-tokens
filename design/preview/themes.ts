import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import tokens from '../tokens/tokens.json';
import type { ThemeOption } from './theme-constants';

// Server-side theme registry: the core themes from tokens.json plus every registered world in tokens/worlds/.
// Pass THEMES to client components as props; never import this module from a 'use client' file (it reads the disk).

/*
 * Register a world here, by slug, after creating tokens/worlds/<slug>.json and tokens/worlds/<slug>.css and loading any
 * new face in app/fonts.ts. That one line is the whole registration: the JSON feeds the switcher, /worlds, and /overview;
 * the CSS is inlined into every page by app/layout.tsx. The validator fails if a world on disk is missing from this
 * list, or a listed slug has no files.
 */
export const WORLD_SLUGS: readonly string[] = ['deck-handling', 'starship', 'flight-director', 'comms-deck'];

type ColourSet = Record<string, { $value: string }>;

type WorldDefinition = {
  label: string;
  order: number;
  $description: string;
  signature: string;
  colorScheme: string;
  color: ColourSet;
  /** Names the recommended default colours in the theme block. */
  palette?: { label: string };
  /** Alternative colour sets applied with data-palette: two alternatives, then "original". */
  palettes?: { id: string; label: string; colorScheme: string; color: ColourSet }[];
};

/** One colour option. The recommended default comes first with id ''. */
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

const worldsDir = join(process.cwd(), 'tokens', 'worlds');

// The roles that carry most of a palette's identity, in the order the gallery paints them.
const SWATCH_ROLES = ['background', 'strip', 'foreground', 'primary', 'pending', 'answered', 'live'];

export const WORLDS: World[] = WORLD_SLUGS.map((slug) => {
  const world = JSON.parse(readFileSync(join(worldsDir, `${slug}.json`), 'utf8')) as WorldDefinition;
  return {
    slug,
    value: `hermes-${slug}`,
    label: world.label,
    order: world.order,
    idea: world.$description,
    signature: world.signature,
    palettes: [{ id: '', label: world.palette?.label ?? 'Recommended', colorScheme: world.colorScheme, color: world.color }, ...(world.palettes ?? [])].map((palette) => ({
      id: palette.id,
      label: palette.label,
      colorScheme: palette.colorScheme,
      swatches: SWATCH_ROLES.map((role) => ({ role, value: palette.color[role].$value })),
    })),
  };
}).sort((a, b) => a.order - b.order);

/**
 * Each registered world's stylesheet, inlined by app/layout.tsx (unlayered, every rule scoped to its theme).
 * Read on every render, not at module load, so `next dev` serves world CSS edits without a restart.
 */
export function worldStyles(): { slug: string; css: string }[] {
  return WORLD_SLUGS.map((slug) => ({ slug, css: readFileSync(join(worldsDir, `${slug}.css`), 'utf8') }));
}

/** Valid data-palette values per theme, for the pre-paint layout script. */
export const PALETTE_IDS: Record<string, string[]> = Object.fromEntries(
  WORLDS.map((world) => [world.value, world.palettes.filter((palette) => palette.id).map((palette) => palette.id)]),
);

const CORE_LABELS: Record<string, string> = {
  'hermes-dark': 'Ops room (dark)',
  'hermes-light': 'Day shift (light)',
};

const coreThemes = tokens.themes as Record<string, { $description: string }>;

export const THEMES: ThemeOption[] = [
  ...tokens.meta.themes.map((value) => ({ value, label: CORE_LABELS[value] ?? value, group: 'Core' as const, idea: coreThemes[value].$description, palettes: [] })),
  ...WORLDS.map((world) => ({
    value: world.value,
    label: world.label,
    group: 'Worlds' as const,
    idea: world.idea,
    palettes: world.palettes.map(({ id, label }) => ({ id, label })),
  })),
];

/** Every core theme, for pages that paint them side by side. */
export const CORE_THEMES = THEMES.filter((theme) => theme.group === 'Core');
