'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from './Icon';

export function TabsDemo() {
  const id = useId();
  const tabs = ['Pending', 'Answered', 'Expired'] as const;
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (active + step + tabs.length) % tabs.length;
    setActive(next);
    refs.current[next]?.focus();
  }

  return (
    <div>
      <div className="hh-tabs" role="tablist" aria-label="Round filter" onKeyDown={onKeyDown}>
        {tabs.map((tab, index) => (
          <button
            key={tab}
            ref={(element) => {
              refs.current[index] = element;
            }}
            type="button"
            role="tab"
            className="hh-tab"
            id={`${id}-tab-${index}`}
            aria-selected={active === index}
            aria-controls={`${id}-panel`}
            tabIndex={active === index ? 0 : -1}
            onClick={() => setActive(index)}
          >
            {tab} <span className="hh-mono-sm">{[4, 19, 2][index]}</span>
          </button>
        ))}
      </div>
      <div className="hh-tab-panel" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${active}`}>
        <p className="hh-body-sm">{['Four Rounds wait for you.', 'Nineteen Rounds answered today.', 'Two Rounds expired today; both policies applied recommended.'][active]}</p>
      </div>
    </div>
  );
}

export function SwitchDemo({ label, initial = false }: { label: string; initial?: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <button type="button" role="switch" aria-checked={on} className="hh-switch" onClick={() => setOn(!on)}>
      <span className="hh-switch-track" aria-hidden="true">
        <span className="hh-switch-thumb" />
      </span>
      <span>
        {label} <span className="hh-switch-state">{on ? 'On' : 'Off'}</span>
      </span>
    </button>
  );
}

export function OverlayDemo() {
  const dialog = useRef<HTMLDialogElement>(null);
  const sheet = useRef<HTMLDialogElement>(null);
  const id = useId();
  return (
    <div className="hh-row">
      <button type="button" className="hh-button" data-variant="destructive" onClick={() => dialog.current?.showModal()}>
        Cancel Round…
      </button>
      <button type="button" className="hh-button" onClick={() => sheet.current?.showModal()}>
        Agent detail
      </button>
      <button type="button" className="hh-button" popoverTarget={`${id}-popover`}>
        Policy details
      </button>
      <span className="hh-tooltip-anchor">
        <button type="button" className="hh-icon-button" aria-describedby={`${id}-tip`}>
          <Icon name="clock" label="Timer" />
        </button>
        <span role="tooltip" id={`${id}-tip`} className="hh-tooltip">
          Applies recommended at 09:48
        </span>
      </span>

      <dialog ref={dialog} className="hh-dialog" aria-labelledby={`${id}-dialog-title`}>
        <div className="hh-overlay-head">
          <h2 id={`${id}-dialog-title`} className="hh-heading-md">
            Cancel Round R-0142?
          </h2>
        </div>
        <div className="hh-overlay-body hh-stack">
          <p className="hh-body">CLAUDE·api-refactor receives Cancelled for all 3 Questions. The Agent decides what to do next. This cannot be undone.</p>
        </div>
        <form method="dialog" className="hh-overlay-foot">
          <button className="hh-button" value="keep">
            Keep waiting
          </button>
          <button className="hh-button" data-variant="destructive" value="cancel">
            Cancel Round
          </button>
        </form>
      </dialog>

      <dialog ref={sheet} className="hh-sheet" aria-labelledby={`${id}-sheet-title`}>
        <div className="hh-overlay-head">
          <h2 id={`${id}-sheet-title`} className="hh-heading-md">
            CLAUDE·api-refactor
          </h2>
          <form method="dialog">
            <button className="hh-icon-button" data-variant="ghost">
              <Icon name="x" label="Close" />
            </button>
          </form>
        </div>
        <div className="hh-overlay-body">
          <dl className="hh-dl">
            <dt>Client</dt>
            <dd>Claude Code</dd>
            <dt>Session</dt>
            <dd className="hh-mono-sm">7f3c9e21-48d0-4b6a</dd>
            <dt>cwd</dt>
            <dd className="hh-mono-sm">~/src/ledger-api</dd>
            <dt>Git</dt>
            <dd className="hh-mono-sm">feat/v2-routes</dd>
          </dl>
        </div>
      </dialog>

      <div popover="auto" id={`${id}-popover`} className="hh-popover">
        <p className="hh-label">Unanswered Policy</p>
        <p className="hh-body-sm">Waits 10 min, then applies recommended. Each Question declares its own policy; the strip shows the earliest.</p>
      </div>
    </div>
  );
}

export function MenuDemo() {
  const [open, setOpen] = useState(false);
  const id = useId();
  const button = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const actions = ['Open Round', 'Copy Round id', 'Copy resume command', 'Cancel Round…'];

  function close() {
    setOpen(false);
    button.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = items.current.findIndex((item) => item === document.activeElement);
    if (event.key === 'Escape') close();
    else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const next = (index + (event.key === 'ArrowDown' ? 1 : -1) + actions.length) % actions.length;
      items.current[next]?.focus();
    }
  }

  return (
    <div className="hh-menu-anchor">
      <button
        ref={button}
        type="button"
        className="hh-button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        onClick={() => {
          setOpen(!open);
          if (!open) requestAnimationFrame(() => items.current[0]?.focus());
        }}
      >
        Round actions <Icon name="chevron-down" />
      </button>
      {open ? (
        <div className="hh-menu" role="menu" id={`${id}-menu`} aria-label="Round actions" onKeyDown={onKeyDown}>
          {actions.map((action, index) => (
            <button
              key={action}
              ref={(element) => {
                items.current[index] = element;
              }}
              type="button"
              role="menuitem"
              tabIndex={-1}
              onClick={close}
            >
              {action}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ToastDemo() {
  const [shown, setShown] = useState(false);
  return (
    <div className="hh-stack">
      <button type="button" className="hh-button" onClick={() => setShown(true)}>
        Show toast
      </button>
      <div role="status">
        {shown ? (
          <div className="hh-toast" data-placement="inline">
            <span className="hh-badge" data-tone="answered">
              Answered
            </span>
            <span className="hh-body-sm">Answer sent · R-0141 · 2 Questions delivered.</span>
            <button type="button" className="hh-button" data-variant="ghost" data-size="sm" onClick={() => setShown(false)}>
              Dismiss
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function FieldDemo() {
  const [value, setValue] = useState('hermes_tk_');
  const invalid = value.length < 16;
  return (
    <div className="hh-field">
      <label className="hh-label" htmlFor="token-field">
        Agent token
      </label>
      <input id="token-field" className="hh-input hh-mono" value={value} aria-invalid={invalid} aria-describedby="token-hint token-error" onChange={(event) => setValue(event.target.value)} />
      <p id="token-hint" className="hh-hint">
        Paste the token an Agent prints on first run. 16 characters or more.
      </p>
      {invalid ? (
        <p id="token-error" className="hh-error">
          <span className="hh-badge" data-tone="destructive">
            Error
          </span>
          Token too short: {value.length} of 16 characters.
        </p>
      ) : null}
    </div>
  );
}
