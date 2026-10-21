import { PageLayout } from "../components/PageLayout";
import { TeachingRecord } from "../components/TeachingRecord";
import { mentoring, teaching } from "../data/teaching";

export function Teaching() {
  return (
    <PageLayout title="Teaching" intro="I believe in accessible, applied education: helping students build real confidence with data, programming and research methods, and mentoring them through projects of their own.">
      <h2 className="section-h">Modules</h2>
      <ul className="teach-list">{teaching.map((t) => <TeachingRecord key={`${t.code ?? t.name}-${t.years}`} t={t} />)}</ul>
      <h2 className="section-h">Supervision &amp; mentoring</h2>
      <ul className="teach-list">
        {mentoring.map((m) => (
          <li key={m.text} className="teach"><div className="teach-when">{m.years}</div><p className="teach-desc">{m.text}</p></li>
        ))}
      </ul>
    </PageLayout>
  );
}
