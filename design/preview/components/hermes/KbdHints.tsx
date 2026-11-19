/**
 * Visible key hints for triage. Bay keys act while the strip list has focus; Round keys while focus is in the open Round
 * (letters and digits never in a text field). Single-key shortcuts can be switched off; glance density hides the hints.
 */
export const SHORTCUTS = [
  { keys: ['J', 'K'], action: 'next / previous strip' },
  { keys: ['Enter'], action: 'open the Round' },
  { keys: ['1–9'], action: 'choose an option' },
  { keys: ['A', 'R'], action: 'approve / reject' },
  { keys: ['N'], action: 'notes' },
  { keys: ['Esc'], action: 'back to pending' },
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
