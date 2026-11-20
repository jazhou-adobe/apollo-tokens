'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { withBase } from '../paths';
import type { ThemeOption } from '../theme-constants';

// Names the theme and colour option painted on <html>, which the layout script sets from ?theme= and ?palette= or the
// saved choice before paint. Kept to one short line: lead, theme, colour option, and the density only when one is set.
export function ActiveTheme({ options, id, lead, className = 'hh-kicker' }: { options: ThemeOption[]; id?: string; lead?: string; className?: string }) {
  const [text, setText] = useState([lead, 'Hermes Hub'].filter(Boolean).join(' · '));

  useEffect(() => {
    const root = document.documentElement;
    const theme = options.find((option) => option.value === root.dataset.theme);
    if (!theme) return;
    const palette = theme.palettes.find((option) => option.id === (root.dataset.palette ?? ''));
    setText([lead, theme.label, palette?.label, root.dataset.density].filter(Boolean).join(' · '));
  }, [options, lead]);

  return (
    <p id={id} className={className}>
      {text}
    </p>
  );
}

// A link to another preview route that carries the theme, colour option, and density painted on <html>.
export function ThemeLink({ href, className, variant, children }: { href: string; className?: string; variant?: 'primary' | 'secondary'; children: ReactNode }) {
  const [target, setTarget] = useState(href);

  useEffect(() => {
    const { theme, palette, density } = document.documentElement.dataset;
    const query = new URLSearchParams();
    if (theme) query.set('theme', theme);
    if (palette) query.set('palette', palette);
    if (density) query.set('density', density);
    setTarget(`${href}?${query}`);
  }, [href]);

  return (
    <a className={className} data-variant={variant} href={withBase(target)}>
      {children}
    </a>
  );
}
