import { PageLayout } from "../components/PageLayout";
import { TeachingRecord } from "../components/TeachingRecord";
import { teaching } from "../data/teaching";

const latest = (years: string) => Math.max(...(years.match(/\d{4}/g) ?? ["0"]).map(Number));
const groups = [...new Set(teaching.map((t) => latest(t.years)))].sort((a, b) => b - a)
  .map((y) => [y, teaching.filter((t) => latest(t.years) === y)] as const);

export function Teaching() {
  return (
    <PageLayout title="Teaching" wide>
      {groups.map(([y, list]) => (
        <section key={y} className="ev-year" aria-labelledby={`ty-${y}`}>
          <h2 id={`ty-${y}`} className="ev-year-h">{y}</h2>
          <ul className="strip-list">{list.map((t) => <TeachingRecord key={`${t.code ?? t.name}-${t.years}`} t={t} />)}</ul>
        </section>
      ))}
    </PageLayout>
  );
}
