import type { TeachingRecord as T } from "../data/teaching";
export function TeachingRecord({ t }: { t: T }) {
  return (
    <li className="teach">
      <div className="teach-when">{t.years}</div>
      <div>
        <h3 className="teach-title">{t.code && <span className="teach-code">{t.code}</span>}{t.code ? " — " : ""}{t.name}</h3>
        <p className="teach-meta">{t.role} · {t.institution}{t.level ? ` · ${t.level}` : ""}</p>
        <p className="teach-desc">{t.description}</p>
        {t.resources && t.resources.length > 0 && (
          <p className="teach-res">{t.resources.map((r) => <a key={r.url} href={r.url}>{r.label}</a>)}</p>
        )}
      </div>
    </li>
  );
}
