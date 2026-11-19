import type { ReactNode } from 'react';
import { THEMES } from '../themes';
import { SidebarIndex } from './SidebarIndex';
import { ThemeSwitcher } from './ThemeSwitcher';

// Plain anchors on purpose: a full load lets the layout script apply ?theme= previews.
export const REFERENCE_PAGES = [
  { href: '/design', label: 'Design system' },
  { href: '/worlds', label: 'Worlds' },
  { href: '/overview', label: 'Every theme' },
  { href: '/specimen', label: 'Triage specimen' },
] as const;

export type ReferenceHref = (typeof REFERENCE_PAGES)[number]['href'];

/** One "On this page" entry; `items` lists what the section holds as nested links. */
export type PageSection = { id: string; label: string; items?: readonly { id: string; label: string }[] };

export function PreviewShell({ current, sections, children }: { current: ReferenceHref; sections: readonly PageSection[]; children: ReactNode }) {
  return (
    <div className="hh-shell">
      <a className="hh-skip-link" href="#top">
        Skip to main content
      </a>
      <aside className="hh-sidebar" aria-label="Preview controls">
        <div className="hh-sidebar-brand">
          <strong className="hh-heading-lg">Hermes Hub</strong>
          <span className="hh-kicker">Design system · strip board</span>
        </div>
        <ThemeSwitcher options={THEMES} />
        <SidebarIndex
          sections={sections}
          pages={
            <nav className="hh-side-nav" aria-label="Design system pages">
              {REFERENCE_PAGES.map((page) => (
                <a key={page.href} href={page.href} aria-current={page.href === current ? 'page' : undefined}>
                  {page.label}
                </a>
              ))}
            </nav>
          }
        />
      </aside>
      <main className="hh-main" id="top" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
