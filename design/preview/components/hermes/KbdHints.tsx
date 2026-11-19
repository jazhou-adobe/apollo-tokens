/** Visible key hints for strip-bay triage. Shortcuts act only while focus is inside the bay and can be switched off. */
export const SHORTCUTS = [
  { keys: ['J', 'K'], action: 'next / previous Round' },
  { keys: ['1–9'], action: 'choose an option' },
  { keys: ['A', 'R'], action: 'approve / reject' },
  { keys: ['⌘↵', 'Ctrl↵'], action: 'send the Answer' },
] as const;

export function KbdHints({ label = 'Keyboard shortcuts' }: { label?: string }) {
  return (
    <ul className="hh-kbd-hints" aria-label={label}>
      {SHORTCUTS.map((shortcut) => (
        <li key={shortcut.action}>
          {shortcut.keys.map((key, index) => (
            <span key={key} className="hh-row">
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              <kbd className="hh-kbd">{key}</kbd>
            </span>
          ))}
          <span>{shortcut.action}</span>
        </li>
      ))}
    </ul>
  );
}
