import type { ReactNode } from 'react';
import { withBase } from '../paths';
import { THEMES } from '../themes';
import { SidebarIndex } from './SidebarIndex';
import { DensitySwitch, ThemeSwitcher } from './ThemeSwitcher';

// Plain anchors on purpose: a full load lets the layout script apply ?theme= previews. Hrefs are app paths (compared with
// `current`); withBase adds the basePath when rendering.
export const REFERENCE_PAGES = [
  { href: '/design', label: 'Design system' },
  { href: '/specimen', label: 'Capture specimen' },
  { href: '/overview', label: 'Every theme' },
  { href: '/worlds', label: 'Seeded worlds' },
] as const;

export type ReferenceHref = (typeof REFERENCE_PAGES)[number]['href'];

export type PageSection = { id: string; label: string; items?: readonly { id: string; label: string }[] };

export function PreviewShell({ current, sections, children }: { current: ReferenceHref; sections: readonly PageSection[]; children: ReactNode }) {
  return (
    <div className="sb-shell">
      <a className="sb-skip-link" href="#top">
        Skip to main content
      </a>
      <aside className="sb-sidebar" aria-label="Preview controls">
        <div className="sb-brand">
          <strong className="sb-heading-md">Splitbook</strong>
          <span className="sb-body-sm sb-muted">Pace Clock design system</span>
        </div>
        <ThemeSwitcher options={THEMES} />
        <SidebarIndex
          sections={sections}
          pages={
            <>
              <DensitySwitch />
              <nav className="sb-side-nav" aria-label="Design system pages">
                {REFERENCE_PAGES.map((page) => (
                  <a key={page.href} href={withBase(page.href)} aria-current={page.href === current ? 'page' : undefined}>
                    {page.label}
                  </a>
                ))}
              </nav>
            </>
          }
        />
      </aside>
      <main className="sb-main" id="top" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
