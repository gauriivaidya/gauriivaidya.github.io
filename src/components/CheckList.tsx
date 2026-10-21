/** Tick-box filter group shared by Publications and Talks & Events. The number beside each option is how many items match it. */
export type CheckOption = { value: string; label: string; count: number };
export const toggle = (set: Set<string>, v: string) => { const n = new Set(set); n.has(v) ? n.delete(v) : n.add(v); return n; };

export function CheckList({ label, id, options, value, onChange, noun }: { label: string; id: string; options: CheckOption[]; value: Set<string>; onChange: (s: Set<string>) => void; noun: [string, string] }) {
  return (
    <fieldset className="checks" id={id}>
      <legend>{label}</legend>
      <div className="check-list">
        {options.map((o) => {
          const what = `${o.count} ${o.count === 1 ? noun[0] : noun[1]}`;
          return (
            <label key={o.value} className="check">
              <input type="checkbox" value={o.value} checked={value.has(o.value)} onChange={() => onChange(toggle(value, o.value))} />
              <span>{o.label}</span>
              <span className="check-n" title={what}><span aria-hidden="true">{o.count}</span><span className="sr-only">({what})</span></span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export type ActiveFilter = { k: string; label: string; clear: () => void };
export function ActiveBar({ shown, total, noun, active, clearAll }: { shown: number; total: number; noun: string; active: ActiveFilter[]; clearAll: () => void }) {
  return (
    <div className="active-bar" aria-live="polite">
      <span className="count">{shown} of {total} {noun}</span>
      {active.length > 0 && (
        <span className="active">
          {active.map((a) => <button key={a.k} type="button" className="active-chip" onClick={a.clear} aria-label={`Remove filter ${a.label}`}>{a.label} <span aria-hidden="true">×</span></button>)}
          <button type="button" className="linklike clear-all" onClick={clearAll}>Clear all</button>
        </span>
      )}
    </div>
  );
}
