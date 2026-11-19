import { Schibsted_Grotesk, Spline_Sans_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import { Archivo, Barlow_Condensed, Martian_Mono } from 'next/font/google';
import { IBM_Plex_Mono, Instrument_Sans, Marcellus_SC, Saira_Condensed } from 'next/font/google';
import { Michroma } from 'next/font/google';

/*
 * Core faces (tokens/themes.css → --hh-font-*):
 * - Schibsted Grotesk, variable 400–900: reading text, Questions, labels, controls (--hh-font-sans).
 * - Spline Sans Mono, variable 300–700: callsigns, ids, timers, counts, code; always tabular numerals (--hh-font-mono).
 * - Big Shoulders, variable 100–900 (opsz 10–72): strip headers and display only (--hh-font-condensed).
 * Each loads as its variable file, so every weight the tokens name (400, 600, 700, 800) is a real cut, never synthesised.
 * The mono stops at 700, so no token asks the mono for 800. The reading face sets the first screen of every page, so it
 * is preloaded; mono and condensed load when a page renders them.
 * Big Shoulders is self-hosted from app/fonts (Google Fonts' latin variable file, SIL OFL 1.1) through next/font/local:
 * Google merged Big Shoulders Display and Text into one opsz family that next/font/google has no fallback metrics for, so
 * it warns on every build. The local loader measures the file itself to size its Arial fallback.
 */
const schibstedGrotesk = Schibsted_Grotesk({ subsets: ['latin'], display: 'swap', variable: '--font-schibsted-grotesk' });
const splineSansMono = Spline_Sans_Mono({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-spline-sans-mono' });
const bigShoulders = localFont({
  src: './fonts/BigShoulders-latin-variable.woff2',
  weight: '100 900',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  variable: '--font-big-shoulders',
});

export const coreFontVariables = [schibstedGrotesk, splineSansMono, bigShoulders].map((font) => font.variable).join(' ');

/*
 * Faces for worlds (tokens/worlds/*). Add one next/font call per family a world needs, with `preload: false` and a
 * `variable: '--font-<family>'` the world's font overrides reference, then list it here. next/font needs literal
 * options, so each call spells them out. Before adding a family, check whether another world already loads it.
 */

// Deck Handling Board (tokens/worlds/deck-handling.*): Archivo reading face, Martian Mono with its width axis (the skin
// runs mono at 87.5%), Barlow Condensed static cuts for strip headers and status words, Saira Stencil for display only.
const archivo = Archivo({ subsets: ['latin'], display: 'swap', preload: false, axes: ['wdth'], variable: '--font-archivo' });
const martianMono = Martian_Mono({ subsets: ['latin'], display: 'swap', preload: false, axes: ['wdth'], variable: '--font-martian-mono' });
const barlowCondensed = Barlow_Condensed({ subsets: ['latin'], weight: ['500', '600', '700', '800'], display: 'swap', preload: false, variable: '--font-barlow-condensed' });
// Saira Stencil is self-hosted from app/fonts (Google Fonts' latin variable file, SIL OFL 1.1): next/font/google has no
// fallback metrics for it and warns on every build; the local loader measures the file to size its Arial fallback.
const sairaStencil = localFont({
  src: './fonts/SairaStencil-latin-variable.woff2',
  weight: '100 900',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  variable: '--font-saira-stencil',
});

// Starship Hermes (tokens/worlds/starship.*): Instrument Sans reading face (variable 400–700), IBM Plex Mono and Saira
// Condensed in the static cuts the tokens name, Marcellus SC (one weight) engraved into display and heading-lg only.
const instrumentSans = Instrument_Sans({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-instrument-sans' });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap', preload: false, variable: '--font-ibm-plex-mono' });
const sairaCondensed = Saira_Condensed({ subsets: ['latin'], weight: ['500', '600', '700'], display: 'swap', preload: false, variable: '--font-saira-condensed' });
const marcellusSc = Marcellus_SC({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-marcellus-sc' });

// Flight Director 2169 (tokens/worlds/flight-director.*): reuses Archivo (reading; legends ask for its width axis) and IBM
// Plex Mono (ids, timers, poll calls) from above; Michroma (one 400 cut) is the wide console face for display slots.
const michroma = Michroma({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-michroma' });

// Comms Deck (tokens/worlds/comms-deck.*): reuses Archivo (reading; strip headers at 75% width) and Martian Mono (87.5%
// width) from above; Big Shoulders Stencil (variable 100–900) is the stencilled plate face for display, section headings
// and channel numbers. Self-hosted from app/fonts (Google Fonts' latin variable file, SIL OFL 1.1) like the core Big
// Shoulders: next/font/google has no fallback metrics for this merged opsz family and warns on every build.
const bigShouldersStencil = localFont({
  src: './fonts/BigShouldersStencil-latin-variable.woff2',
  weight: '100 900',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  variable: '--font-big-shoulders-stencil',
});

export const worldFontVariables = [archivo, martianMono, barlowCondensed, sairaStencil, instrumentSans, ibmPlexMono, sairaCondensed, marcellusSc, michroma, bigShouldersStencil]
  .map((font) => font.variable)
  .join(' ');
