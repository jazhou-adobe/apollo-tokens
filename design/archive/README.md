# Archived worlds

The owner chose **Flight Director 2169** as Hermes Hub's design (see `../brief.md`, Chosen design). The other options are kept here, unregistered and out of validation, so nothing is lost.

| Folder | What it holds | Built? |
|---|---|---|
| `worlds/deck-handling/` | `deck-handling.json`, `.css`, quick preview (`.html`, `.png`), `deck-handling-built.png` | Built and reviewed |
| `worlds/comms-deck/` | `comms-deck.json`, `.css`, quick preview, `comms-deck-built.png` | Built and reviewed |
| `worlds/starship/` | `starship.json`, `.css`, quick preview, `starship-built.png` | Built and reviewed |
| `worlds/telemetry-ribbon/` | Quick preview only (`.html`, `.png`) | No |

The quick previews are self-contained HTML; open them directly in a browser.

## Restoring a built world

The archived files match the system as of commit `c886968`. The core has kept moving since, so re-check each world against the current DOM after restoring it.

1. Move `<slug>.json` and `<slug>.css` back to `tokens/worlds/`.
2. Add `'<slug>'` to `WORLD_SLUGS` in `preview/themes.ts`. `app/layout.tsx` inlines the CSS.
3. Load its faces in `app/fonts.ts` and add them to `worldFontVariables`:
   - **Deck Handling Board:**
     ```ts
     const barlowSemiCondensed = Barlow_Semi_Condensed({ subsets: ['latin'], weight: ['600', '700'], display: 'swap', preload: false, variable: '--font-barlow-semi-condensed' });
     const publicSans = Public_Sans({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-public-sans' });
     const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-jetbrains-mono' });
     ```
   - **Starship Hermes** (IBM Plex Mono is already loaded for Flight Director):
     ```ts
     const instrumentSans = Instrument_Sans({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-instrument-sans' });
     const marcellusSc = Marcellus_SC({ subsets: ['latin'], weight: '400', display: 'swap', preload: false, variable: '--font-marcellus-sc' });
     ```
   - **Comms Deck:**
     ```ts
     const chivo = Chivo({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-chivo' });
     const sourceSans3 = Source_Sans_3({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-source-sans-3' });
     const chivoMono = Chivo_Mono({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-chivo-mono' });
     ```
4. Run `npm run validate`.

The review history for these worlds is in `research/design-taste-review.md` and `research/design-studio-review.md`.
