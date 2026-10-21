import type { TeachingRecord as T } from "../data/teaching";
/** One module as a horizontal strip: code thumbnail · details · resources. */
export function TeachingRecord({ t }: { t: T }) {
  return (
    <li className="strip teach">
      <div className="ev-thumb"><div className="ev-ph" aria-hidden="true"><span>{t.code ?? "Module"}</span></div></div>
      <div className="ev-body">
        <p className="event-type">{t.role}</p>
        <h3 className="event-title">{t.code && <span className="teach-code">{t.code}</span>}{t.code ? " · " : ""}{t.name}</h3>
        <p className="event-meta"><span>{t.institution}</span>{t.level && <span>{t.level}</span>}<span>{t.years}</span></p>
        {t.description && <p className="event-desc">{t.description}</p>}
      </div>
      <div className="pub-links">
        {(t.resources ?? []).map((r) => <a key={r.url} className="act" href={r.url} target="_blank" rel="noopener noreferrer">{r.label}</a>)}
      </div>
    </li>
  );
}
