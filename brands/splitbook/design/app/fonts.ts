import { Archivo, Barlow_Condensed, Martian_Mono, Schibsted_Grotesk } from 'next/font/google';
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

const worldFonts: { variable: string }[] = [barlowCondensed, archivo, martianMono];

export const worldFontVariables = worldFonts.map((font) => font.variable).join(' ');
