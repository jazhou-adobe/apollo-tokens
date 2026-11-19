import { Schibsted_Grotesk, Spline_Sans_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import { Archivo, Barlow_Semi_Condensed, JetBrains_Mono, Public_Sans } from 'next/font/google';
import { IBM_Plex_Mono, Instrument_Sans, Marcellus_SC } from 'next/font/google';
import { Michroma } from 'next/font/google';
import { Chivo, Chivo_Mono, Source_Sans_3 } from 'next/font/google';

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

// Deck Handling Board (tokens/worlds/deck-handling.*), flight-deck drafting: Barlow Semi Condensed (static 600 and 700;
// strip headers, status words, board name), Public Sans (variable 100–900; reading, labels, controls) and JetBrains Mono
// (variable 100–800; callsigns, ids, timers, deck spots, code). Three families, no stencil.
const barlowSemiCondensed = Barlow_Semi_Condensed({ subsets: ['latin'], weight: ['600', '700'], display: 'swap', preload: false, variable: '--font-barlow-semi-condensed' });
const publicSans = Public_Sans({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-public-sans' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-jetbrains-mono' });

// Starship Hermes (tokens/worlds/starship.*): Instrument Sans (variable 400–700) is the one operational face (reading,
// labels, strip headers, headings), IBM Plex Mono the serials, timers and code, and Marcellus SC (one weight) the
// restricted identity face for display lettering and the ship's name only.
const instrumentSans = Instrument_Sans({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-instrument-sans' });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap', preload: false, variable: '--font-ibm-plex-mono' });
const marcellusSc = Marcellus_SC({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-marcellus-sc' });

// Flight Director 2169 (tokens/worlds/flight-director.*): Archivo (variable 100–900) is the operational face (Round
// titles, Questions, headings, controls), IBM Plex Mono (shared with Starship above) the ids, timers and poll tally, and
// Michroma (one 400 cut) the restricted wide identity face: display line, brand, holder status words, GO / NO-GO calls.
const archivo = Archivo({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-archivo' });
const michroma = Michroma({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-michroma' });

// Comms Deck (tokens/worlds/comms-deck.*), broadcast-engineering lettering: Chivo (variable 100–900; 700 for the board
// name, Round titles and channel numbers), Source Sans 3 (variable 200–900; reading, labels, controls) and Chivo Mono
// (variable 100–900; callsigns, ids, timers and code at the core mono sizes).
const chivo = Chivo({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-chivo' });
const sourceSans3 = Source_Sans_3({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-source-sans-3' });
const chivoMono = Chivo_Mono({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-chivo-mono' });

export const worldFontVariables = [barlowSemiCondensed, publicSans, jetbrainsMono, archivo, instrumentSans, ibmPlexMono, marcellusSc, michroma, chivo, sourceSans3, chivoMono]
  .map((font) => font.variable)
  .join(' ');
