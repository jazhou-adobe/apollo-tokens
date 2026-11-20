# Archived worlds

The owner chose **Approach Lights** as Splitbook's design (see `../brief.md`, Chosen design). The other options are kept here, unregistered and out of validation, so nothing is lost.

| Folder | What it holds | Built? |
|---|---|---|
| `worlds/flight-deck/` | `flight-deck.json`, `.css`, its quick preview (`.html`, `.png`), `flight-deck-built.png`, and its self-hosted `BigShouldersStencil-Variable-latin.woff2` | Built and reviewed |
| `worlds/sortie-board/` | `sortie-board.json`, `.css`, quick preview, `sortie-board-built.png` | Built and reviewed |
| `worlds/pressure-suit/` | Quick preview only (`.html`, `.png`) | No |
| `worlds/plotting-glass/` | Quick preview only (`.html`, `.png`) | No |

The quick previews are self-contained HTML; open them directly in a browser.

## Restoring a built world

The archived files match the system as of commit `3acf5b3`. The core has kept moving since, so re-check each world against the current DOM after restoring it.

1. Move `<slug>.json` and `<slug>.css` back to `tokens/worlds/`.
2. In `preview/themes.ts`, import the JSON and add `['<slug>', <ident>],` to `WORLD_FILES`.
3. In `app/globals.css`, add `@import '../tokens/worlds/<slug>.css';` under the seeded-worlds comment.
4. Load its faces in `app/fonts.ts` and add them to `worldFonts`:
   - **Flight Deck:** move `BigShouldersStencil-Variable-latin.woff2` back to `app/fonts/`, then:
     ```ts
     const b612 = B612({ subsets: ['latin'], weight: ['400', '700'], display: 'swap', preload: false, variable: '--font-b612' });
     const bigShouldersStencil = localFont({ src: './fonts/BigShouldersStencil-Variable-latin.woff2', weight: '100 900', display: 'swap', preload: false, adjustFontFallback: 'Arial', variable: '--font-big-shoulders-stencil' });
     ```
   - **Sortie Board:**
     ```ts
     const ibmPlexSans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '700'], display: 'swap', preload: false, variable: '--font-ibm-plex-sans' });
     const ibmPlexSansCondensed = IBM_Plex_Sans_Condensed({ subsets: ['latin'], weight: ['400', '700'], display: 'swap', preload: false, variable: '--font-ibm-plex-sans-condensed' });
     const sofiaSansExtraCondensed = Sofia_Sans_Extra_Condensed({ subsets: ['latin'], weight: ['700', '800'], display: 'swap', preload: false, variable: '--font-sofia-sans-extra-condensed' });
     const ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '700'], display: 'swap', preload: false, variable: '--font-ibm-plex-mono' });
     ```
5. Run `npm run validate`.

The review history for these worlds is in `research/design-taste-review.md` and `research/design-studio-review.md`.
