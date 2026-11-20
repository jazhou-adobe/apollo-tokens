import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DEFAULT_THEME, DENSITY_STORAGE_KEY, DENSITY_VALUES, PALETTE_STORAGE_KEY, THEME_STORAGE_KEY } from '../preview/theme-constants';
import { PALETTE_IDS, THEMES } from '../preview/themes';
import { coreFontVariables, worldFontVariables } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Splitbook Design System',
  description: 'Splitbook design system preview: Pace Clock tokens, the Light and Deck themes, components, Capture and trend widgets, blueprints, and the agent recipe.',
};

// Apply theme, colour option, and density before first paint so the page never flashes the wrong palette.
// ?theme=<value> previews a theme without saving it (gallery frames and thumbnails use this) and shows its default
// colours unless ?palette=<id> names another; without ?theme, the saved theme and that theme's saved palette win.
// ?density=deck|compact previews a density the same way; otherwise the saved preview density applies.
const themeScript = `(function(){try{var d=document.documentElement,s=new URLSearchParams(location.search),v=${JSON.stringify(
  THEMES.map((theme) => theme.value),
)},p=${JSON.stringify(PALETTE_IDS)},q=s.get('theme'),t=v.indexOf(q)>-1?q:localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(v.indexOf(t)>-1)d.dataset.theme=t;else t=d.dataset.theme;var ids=p[t]||[],c=s.get('palette');if(ids.indexOf(c)<0){var saved={};try{saved=JSON.parse(localStorage.getItem(${JSON.stringify(
  PALETTE_STORAGE_KEY,
)})||'{}')||{}}catch(e){}c=s.has('theme')?null:saved[t]}if(ids.indexOf(c)>-1)d.dataset.palette=c;var n=s.has('density')?s.get('density'):s.has('theme')?null:localStorage.getItem(${JSON.stringify(
  DENSITY_STORAGE_KEY,
)});if(${JSON.stringify(DENSITY_VALUES)}.indexOf(n)>-1)d.dataset.density=n;}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-AU" data-theme={DEFAULT_THEME} className={`${coreFontVariables} ${worldFontVariables}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
