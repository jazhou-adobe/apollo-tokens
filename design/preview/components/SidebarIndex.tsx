'use client';

import { useId, useState, type ReactNode } from 'react';
import { Icon } from './Icon';

type Entry = { id: string; label: string };
type Section = Entry & { items?: readonly Entry[] };

// The sidebar's page list plus the on-this-page index. Below lg the sidebar stacks above the page, so both fold behind
// one toggle and the page heading stays in the first viewport; from lg everything shows and the sidebar scrolls alone.
export function SidebarIndex({ sections, pages }: { sections: readonly Section[]; pages: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <div className="sb-toc-wrap sb-stack" data-open={open ? 'true' : 'false'}>
      <button type="button" className="sb-button sb-toc-toggle" data-variant="secondary" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)}>
        <Icon name={open ? 'close' : 'menu'} />
        Contents
      </button>
      <div id={panelId} className="sb-toc-panel">
        {pages}
        <nav className="sb-toc" aria-label="On this page">
          <ul>
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>
                  <strong>{section.label}</strong>
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
