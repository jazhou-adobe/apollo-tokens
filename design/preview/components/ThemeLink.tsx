'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { withBase } from '../paths';

// A link to another preview route that carries the theme and colour option painted on <html>, so a page reached through
// ?theme=…&palette=… opens the next page in the same colours. `href` is an app path; the basePath is added here.
export function ThemeLink({ href, className, variant, children }: { href: string; className?: string; variant?: 'secondary' | 'ghost'; children: ReactNode }) {
  const [target, setTarget] = useState(withBase(href));

  useEffect(() => {
    const { theme, palette } = document.documentElement.dataset;
    const query = new URLSearchParams();
    if (theme) query.set('theme', theme);
    if (palette) query.set('palette', palette);
    setTarget(withBase(`${href}?${query}`));
  }, [href]);

  return (
    <a className={className} data-variant={variant} href={target}>
      {children}
    </a>
  );
}
