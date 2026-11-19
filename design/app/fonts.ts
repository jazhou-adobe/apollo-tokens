import { Archivo, B612, Barlow_Condensed, IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Sans_Condensed, Martian_Mono, Schibsted_Grotesk, Sofia_Sans_Extra_Condensed } from 'next/font/google';
import localFont from 'next/font/local';

/*
 * Core faces (tokens/themes.css → --sb-font-*). Only the weights the tokens name are used, so no weight is synthesised.
 * - Schibsted Grotesk (display, headings, every numeral read-out): a newsroom grotesque with a tnum feature, so the
 *   running split and counts set in tabular figures. Tokens ask for 700 (bold) and 800 (heavy); both static cuts are
 *   fetched by next/font/google.
 * - Atkinson Hyperlegible Next (reading text, labels, controls): drawn for low-vision legibility (distinct 1/l/I, 0/O),
 *   which also helps in glare. Tokens ask for 400 and 700.
 * - Atkinson Hyperlegible Mono (metric keys, formulas, Configuration version IDs): 400 and 700.
 * Both Atkinson faces are self-hosted from app/fonts (Google Fonts' latin variable files, wght 200–800, SIL OFL 1.1)
 * through next/font/local: next/font/google has no fallback metrics for them and warns at build time, while the local
 * loader measures each file to size its fallback. Display and body faces set the first screen and are preloaded; mono
 * loads when a page renders it.
 */
const schibstedGrotesk = Schibsted_Grotesk({ subsets: ['latin'], weight: ['700', '800'], display: 'swap', variable: '--font-schibsted-grotesk' });
const atkinsonNext = localFont({
  src: './fonts/AtkinsonHyperlegibleNext-Variable-latin.woff2',
  weight: '200 800',
  display: 'swap',
  adjustFontFallback: 'Arial',
  variable: '--font-atkinson-next',
});
const atkinsonMono = localFont({
  src: './fonts/AtkinsonHyperlegibleMono-Variable-latin.woff2',
  weight: '200 800',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  variable: '--font-atkinson-mono',
});

export const coreFontVariables = [schibstedGrotesk, atkinsonNext, atkinsonMono].map((font) => font.variable).join(' ');

/*
 * Faces for seeded worlds (tokens/worlds/*). When a world needs a face: add one next/font call here with
 * preload: false and a variable named --font-<family>, add it to this list, and reference var(--font-<family>) from the
 * world's font and type overrides. next/font requires literal options, so each call spells them out.
 */
// Approach Lights: Barlow Condensed (display and numerals, tnum; 700, 800), Archivo (body and labels; 400, 700), Martian
// Mono (data-plate labels, code; 400, 700).
const barlowCondensed = Barlow_Condensed({ subsets: ['latin'], weight: ['700', '800'], display: 'swap', preload: false, variable: '--font-barlow-condensed' });
const archivo = Archivo({ subsets: ['latin'], weight: ['400', '700'], display: 'swap', preload: false, variable: '--font-archivo' });
const martianMono = Martian_Mono({ subsets: ['latin'], weight: ['400', '700'], display: 'swap', preload: false, variable: '--font-martian-mono' });
// Flight Deck: B612 (body, labels and every numeral; 400, 700), Big Shoulders Stencil (display and placards; 700, 800).
// Big Shoulders Stencil is self-hosted (Google Fonts' latin variable file, wght 100–900, SIL OFL 1.1) because
// next/font/google has no fallback metrics for it; the local loader measures the file to size its Arial fallback.
const b612 = B612({ subsets: ['latin'], weight: ['400', '700'], display: 'swap', preload: false, variable: '--font-b612' });
const bigShouldersStencil = localFont({
  src: './fonts/BigShouldersStencil-Variable-latin.woff2',
  weight: '100 900',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  variable: '--font-big-shoulders-stencil',
});
// Sortie Board: IBM Plex Sans (reading text, labels and controls; 400, 700), IBM Plex Sans Condensed (every numeral and
// figure column, tnum; 400, 700), Sofia Sans Extra Condensed (board titles only; 700, 800), IBM Plex Mono (short
// identifiers: Swim IDs, Length numbers, status marks, code; 400, 700).
const ibmPlexSans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '700'], display: 'swap', preload: false, variable: '--font-ibm-plex-sans' });
const ibmPlexSansCondensed = IBM_Plex_Sans_Condensed({ subsets: ['latin'], weight: ['400', '700'], display: 'swap', preload: false, variable: '--font-ibm-plex-sans-condensed' });
const sofiaSansExtraCondensed = Sofia_Sans_Extra_Condensed({ subsets: ['latin'], weight: ['700', '800'], display: 'swap', preload: false, variable: '--font-sofia-sans-extra-condensed' });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '700'], display: 'swap', preload: false, variable: '--font-ibm-plex-mono' });

const worldFonts: { variable: string }[] = [barlowCondensed, archivo, martianMono, b612, bigShouldersStencil, ibmPlexSans, ibmPlexSansCondensed, sofiaSansExtraCondensed, ibmPlexMono];

export const worldFontVariables = worldFonts.map((font) => font.variable).join(' ');
