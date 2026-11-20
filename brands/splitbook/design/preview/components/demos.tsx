'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Icon } from './Icon';

// Interactive core-component demos. Behaviour follows the WAI-ARIA APG patterns named on each component.

/** APG tabs: arrow keys move between tabs and select them; Home and End jump to the ends. */
export function Tabs({ label, tabs }: { label: string; tabs: { id: string; label: string; content: ReactNode }[] }) {
  const [selected, setSelected] = useState(tabs[0]?.id);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const base = useId();

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex((tab) => tab.id === selected);
    const last = tabs.length - 1;
    const next = { ArrowRight: index === last ? 0 : index + 1, ArrowLeft: index === 0 ? last : index - 1, Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setSelected(tabs[next].id);
    refs.current[next]?.focus();
  }

  return (
    <div className="sb-tabs">
      <div role="tablist" aria-label={label} onKeyDown={onKeyDown}>
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`${base}-${tab.id}-tab`}
            aria-selected={tab.id === selected}
            aria-controls={`${base}-${tab.id}-panel`}
            tabIndex={tab.id === selected ? 0 : -1}
            onClick={() => setSelected(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div key={tab.id} role="tabpanel" id={`${base}-${tab.id}-panel`} aria-labelledby={`${base}-${tab.id}-tab`} hidden={tab.id !== selected} tabIndex={0}>
          {tab.content}
        </div>
      ))}
    </div>
  );
}

/** APG switch: a button with role="switch"; the thumb shows On or Off, so state never rests on colour. */
export function Switch({ label, initial = false }: { label: string; initial?: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <button type="button" className="sb-switch" role="switch" aria-checked={on} onClick={() => setOn(!on)}>
      <span className="sb-switch-track" aria-hidden="true">
        <span className="sb-switch-thumb">{on ? 'On' : 'Off'}</span>
      </span>
      <span>{label}</span>
    </button>
  );
}

/** Native <dialog> opened with showModal(): focus moves in, Escape closes, focus returns to the opener. */
export function DialogDemo() {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  return (
    <>
      <button type="button" className="sb-button" data-variant="destructive" onClick={() => ref.current?.showModal()}>
        Delete this Swim
      </button>
      <dialog ref={ref} className="sb-dialog" aria-labelledby={titleId}>
        <form method="dialog" className="sb-dialog-body">
          <h2 id={titleId} className="sb-heading-md">
            Delete 100 m freestyle?
          </h2>
          <p>Its 4 Lengths, counts and Review sheet go with it. Metric trends recalculate without it. This can’t be undone.</p>
          <div className="sb-dialog-actions">
            <button className="sb-button" data-variant="secondary" value="cancel" autoFocus>
              Keep Swim
            </button>
            <button className="sb-button" data-variant="destructive" value="delete">
              Delete Swim
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

/** A sheet (drawer): a modal <dialog> anchored to the bottom on phones and the inline end on wide screens. */
export function SheetDemo() {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  return (
    <>
      <button type="button" className="sb-button" data-variant="secondary" onClick={() => ref.current?.showModal()}>
        <Icon name="settings" /> Filter Sessions
      </button>
      <dialog ref={ref} className="sb-sheet" aria-labelledby={titleId}>
        <form method="dialog" className="sb-dialog-body">
          <div className="sb-row" data-justify="between">
            <h2 id={titleId} className="sb-heading-md">
              Filter Sessions
            </h2>
            <button className="sb-icon-button" value="close" aria-label="Close filters">
              <Icon name="close" />
            </button>
          </div>
          <fieldset className="sb-fieldset">
            <legend className="sb-label">Stroke</legend>
            {['Freestyle', 'Backstroke', 'Breaststroke'].map((stroke) => (
              <label key={stroke} className="sb-checkbox">
                <input type="checkbox" defaultChecked={stroke === 'Freestyle'} /> {stroke}
              </label>
            ))}
          </fieldset>
          <div className="sb-dialog-actions">
            <button className="sb-button" value="apply">
              Show Sessions
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

/** The HTML popover API: light dismiss, Escape, and top-layer stacking without z-index. */
export function PopoverDemo() {
  const id = useId().replace(/:/g, '');
  return (
    <>
      <button type="button" className="sb-button" data-variant="ghost" popoverTarget={`pop-${id}`}>
        What is SWOLF?
      </button>
      <div id={`pop-${id}`} popover="auto" className="sb-popover">
        <div className="sb-stack" data-gap="tight">
          <strong className="sb-label">SWOLF</strong>
          <p className="sb-body-sm">
            Swim golf: strokes plus seconds for one Length. 17 strokes in 19.6 seconds scores 36.6. Lower means more distance for less effort, like a golf score.
          </p>
        </div>
      </div>
    </>
  );
}

/** Toast: one at a time, in a polite live region, with its own Undo; no timer, so nothing time-critical slips away. */
export function ToastDemo() {
  const [toast, setToast] = useState<'saved' | 'undone' | null>(null);
  return (
    <div className="sb-row">
      <button type="button" className="sb-button" onClick={() => setToast('saved')}>
        Save Review sheet
      </button>
      <div className="sb-toast-region" role="status" aria-live="polite">
        {toast ? (
          <div className="sb-toast" data-tone="success">
            <span className="sb-alert-mark">
              <Icon name={toast === 'saved' ? 'check' : 'undo'} />
            </span>
            <span>{toast === 'saved' ? 'Review sheet saved to Tuesday squad.' : 'Save undone. The Review sheet is open again.'}</span>
            <span className="sb-row">
              {toast === 'saved' ? (
                <button type="button" className="sb-button" data-variant="ghost" data-size="sm" onClick={() => setToast('undone')}>
                  Undo
                </button>
              ) : null}
              <button type="button" className="sb-icon-button" aria-label="Dismiss" onClick={() => setToast(null)}>
                <Icon name="close" />
              </button>
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** APG menu button: Enter, Space, or ArrowDown opens and focuses the first item; arrows move; Escape closes. */
export function MenuButton({
  label,
  items,
  children,
  className = 'sb-button',
  variant = 'secondary',
  onSelect,
  checkedId,
}: {
  label: string;
  items: { id: string; label: ReactNode }[];
  children: ReactNode;
  className?: string;
  variant?: string;
  onSelect?: (id: string) => void;
  checkedId?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open]);

  function openAt(index: number) {
    setOpen(true);
    requestAnimationFrame(() => itemRefs.current[(index + items.length) % items.length]?.focus());
  }

  function choose(id: string) {
    onSelect?.(id);
    setOpen(false);
    button.current?.focus();
  }

  function onMenuKey(event: KeyboardEvent<HTMLUListElement>) {
    const index = itemRefs.current.findIndex((node) => node === document.activeElement);
    const moves: Record<string, number> = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: items.length - 1 };
    if (event.key in moves) {
      event.preventDefault();
      itemRefs.current[(moves[event.key] + items.length) % items.length]?.focus();
    } else if (event.key === 'Escape' || event.key === 'Tab') {
      if (event.key === 'Escape') event.preventDefault();
      setOpen(false);
      button.current?.focus();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (index > -1) choose(items[index].id);
    }
  }

  return (
    <div className="sb-menu-wrap" ref={wrap}>
      <button
        ref={button}
        type="button"
        className={className}
        data-variant={variant}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => (open ? setOpen(false) : openAt(0))}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            openAt(event.key === 'ArrowDown' ? 0 : -1);
          }
        }}
      >
        {children}
      </button>
      {open ? (
        <ul id={menuId} className="sb-menu" role="menu" aria-label={label} onKeyDown={onMenuKey}>
          {items.map((item, index) => (
            <li
              key={item.id}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              role={checkedId === undefined ? 'menuitem' : 'menuitemradio'}
              aria-checked={checkedId === undefined ? undefined : item.id === checkedId}
              tabIndex={-1}
              onClick={() => choose(item.id)}
            >
              {checkedId !== undefined ? <span aria-hidden="true">{item.id === checkedId ? <Icon name="check" /> : <span className="sb-icon" />}</span> : null}
              {item.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** A menu whose actions report what happened in a status line, so the demo is observable. */
export function SwimActionsMenu() {
  const [last, setLast] = useState('');
  return (
    <div className="sb-row">
      <MenuButton
        label="Swim actions"
        items={[
          { id: 'Edit Review sheet', label: 'Edit Review sheet' },
          { id: 'Move to a Set', label: 'Move to a Set' },
          { id: 'Duplicate setup', label: 'Duplicate setup for next Swim' },
        ]}
        onSelect={setLast}
      >
        Swim actions <Icon name="chevron-down" />
      </MenuButton>
      <span className="sb-body-sm sb-muted" role="status">
        {last ? `Chose: ${last}` : ''}
      </span>
    </div>
  );
}
