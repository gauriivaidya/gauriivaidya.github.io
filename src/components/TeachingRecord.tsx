import type { TeachingRecord as T } from "../data/teaching";
import { Row } from "./YearGroup";
/** One module: code badge · role · name · details · resources. */
export function TeachingRecord({ t }: { t: T }) {
  return (
    <Row className="teach" badge={t.code ?? "Module"}>
      <p className="row-kicker">{t.role}</p>
      <h3 className="row-title">{t.name}</h3>
      <p className="row-meta"><span>{[t.institution, t.location].filter(Boolean).join(", ")}</span>{t.level && <span>{t.level}</span>}<span>{t.years}</span></p>
      {t.description && <p className="row-desc">{t.description}</p>}
      {t.resources?.length ? <div className="pub-links">{t.resources.map((r) => <a key={r.url} className="act" href={r.url} target="_blank" rel="noopener noreferrer">{r.label}</a>)}</div> : null}
    </Row>
  );
}
