import { Icon } from './Icon';

// Hook-free read-outs and pickers: safe in server components and inside client widgets alike.

/** m:ss.hh for a duration in milliseconds (ss.hh under a minute). */
export function formatSplit(ms: number) {
  const hundredths = Math.floor(ms / 10);
  const minutes = Math.floor(hundredths / 6000);
  const seconds = Math.floor((hundredths % 6000) / 100);
  const fraction = String(hundredths % 100).padStart(2, '0');
  return minutes ? `${minutes}:${String(seconds).padStart(2, '0')}.${fraction}` : `${seconds}.${fraction}`;
}

/** The running split: the largest numeral on screen, in the live hand colour only while recording. */
export function SplitReadout({ value, live, caption }: { value: string; live?: boolean; caption: string[] }) {
  return (
    <div className="sb-split-readout" data-state={live ? 'live' : 'idle'}>
      <span className="sb-split-readout-value" role="timer" aria-live="off" aria-label={`${live ? 'Running split' : 'Split'} ${value}`}>
        {value}
      </span>
      <span className="sb-split-readout-caption">
        {caption.map((part) => (
          <span key={part}>{part}</span>
        ))}
      </span>
    </div>
  );
}

export type LengthCell = { number: number; value?: string; state: 'done' | 'current' | 'upcoming' };

/**
 * One cell per Length, out and back. Each cell carries its number and a value, so state never rests on colour: done
 * cells are solid, the current one has a heavy live frame and the word "now" for screen readers, upcoming ones are dashed.
 */
export function LengthStrip({ label, cells, unit }: { label: string; cells: LengthCell[]; unit: string }) {
  return (
    <ol className="sb-length-strip" aria-label={label}>
      {cells.map((cell) => (
        <li key={cell.number} className="sb-length-cell" data-state={cell.state} aria-current={cell.state === 'current' ? 'step' : undefined}>
          <span className="sb-length-cell-number">L{cell.number}</span>
          <span className="sb-length-cell-value">{cell.value ?? '–'}</span>
          <span className="sb-visually-hidden">
            {cell.state === 'current' ? 'now' : cell.state === 'upcoming' ? 'not swum yet' : unit}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Stroke, distance, or training-type picker: native radios (or checkboxes) styled as chips, so it works without script. */
export function ChipPicker({ legend, name, options, defaultValue, multiple }: { legend: string; name: string; options: readonly string[]; defaultValue?: string; multiple?: boolean }) {
  return (
    <fieldset className="sb-fieldset">
      <legend className="sb-label">{legend}</legend>
      <div className="sb-chip-group">
        {options.map((option) => (
          <label key={option} className="sb-chip">
            <input type={multiple ? 'checkbox' : 'radio'} name={name} value={option} defaultChecked={option === defaultValue} />
            <span className="sb-chip-check">
              <Icon name="check" />
            </span>
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
