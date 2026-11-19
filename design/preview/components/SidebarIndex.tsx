'use client';

import { useId, useState, type ReactNode } from 'react';
import { Icon } from './Icon';

type Entry = { id: string; label: string };
type Section = Entry & { items?: readonly Entry[] };

// The sidebar's page list plus the on-this-page index. Below the lg breakpoint the sidebar stacks above the page, so both
// fold behind one toggle; from lg the sidebar scrolls on its own and everything shows.
export function SidebarIndex({ sections, pages }: { sections: readonly Section[]; pages: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <div className="hh-toc-wrap" data-open={open ? 'true' : 'false'}>
      <button type="button" className="hh-toc-toggle" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)}>
        <Icon name="menu" />
        On this page
      </button>
      <div id={panelId} className="hh-toc-panel">
        {pages}
        <nav className="hh-toc" aria-label="On this page">
          <ul>
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>
                  {section.label}
                  {section.items?.length ? (
                    <span className="hh-toc-count" aria-hidden="true">
                      {section.items.length}
                    </span>
                  ) : null}
                </a>
                {section.items?.length ? (
                  <ul>
                    {section.items.map((item) => (
                      <li key={item.id}>
                        <a href={`#${item.id}`}>{item.label}</a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
