'use client';

import { useEffect, useState } from 'react';
import type { ThemeOption } from '../theme-constants';

// Names the theme and colour option painted on <html> (set before paint from ?theme=, ?palette=, or the saved choice).
export function ActiveTheme({ options, id, lead }: { options: ThemeOption[]; id?: string; lead?: string }) {
  const [text, setText] = useState(lead ?? 'Splitbook');

  useEffect(() => {
    const root = document.documentElement;
    const theme = options.find((option) => option.value === root.dataset.theme);
    if (!theme) return;
    const palette = theme.palettes.find((option) => option.id === (root.dataset.palette ?? ''));
    setText([lead, theme.label, palette?.label, theme.group === 'Core' ? 'core theme' : 'seeded world'].filter(Boolean).join(' · '));
  }, [options, lead]);

  return (
    <p id={id} className="sb-body-sm sb-muted">
      {text}
    </p>
  );
}
