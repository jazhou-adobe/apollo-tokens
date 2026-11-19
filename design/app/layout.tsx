import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DEFAULT_THEME, DENSITIES, DENSITY_STORAGE_KEY, PALETTE_STORAGE_KEY, THEME_STORAGE_KEY } from '../preview/theme-constants';
import { PALETTE_IDS, THEMES, worldStyles } from '../preview/themes';
import { coreFontVariables, worldFontVariables } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hermes Hub design system',
  description: 'Hermes Hub design system preview: tokens, core themes, worlds, components, Round widgets, blueprints, and the agent recipe.',
};

// Apply theme, colour option, and density before first paint so the page never flashes the wrong board.
// ?theme=<value> previews a theme without saving it (gallery and overview frames use this) and shows its recommended
// colours unless ?palette=<id> names another; without ?theme, the saved theme and that theme's saved palette win.
// ?density=compact|glance previews a density the same way; otherwise the saved density applies.
const themeScript = `(function(){try{var d=document.documentElement,s=new URLSearchParams(location.search),v=${JSON.stringify(
  THEMES.map((theme) => theme.value),
)},p=${JSON.stringify(PALETTE_IDS)},q=s.get('theme'),t=v.indexOf(q)>-1?q:localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(v.indexOf(t)>-1)d.dataset.theme=t;else t=d.dataset.theme;var ids=p[t]||[],c=s.get('palette');if(ids.indexOf(c)<0){var saved={};try{saved=JSON.parse(localStorage.getItem(${JSON.stringify(
  PALETTE_STORAGE_KEY,
)})||'{}')||{}}catch(e){}c=s.has('theme')?null:saved[t]}if(ids.indexOf(c)>-1)d.dataset.palette=c;var ds=${JSON.stringify(
  DENSITIES.map((density) => density.id).filter(Boolean),
)},n=s.get('density');if(ds.indexOf(n)<0)n=s.has('theme')?null:localStorage.getItem(${JSON.stringify(DENSITY_STORAGE_KEY)});if(ds.indexOf(n)>-1)d.dataset.density=n;}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme={DEFAULT_THEME} className={`${coreFontVariables} ${worldFontVariables}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Registered worlds (preview/themes.ts WORLD_SLUGS): unlayered like themes.css, every rule scoped to its theme. */}
        {worldStyles().map((world) => (
          <style key={world.slug} data-world={world.slug} dangerouslySetInnerHTML={{ __html: world.css }} />
        ))}
      </head>
      <body>{children}</body>
    </html>
  );
}
