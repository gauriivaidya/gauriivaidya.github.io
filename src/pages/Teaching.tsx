import { PageLayout } from "../components/PageLayout";
import { TeachingRecord } from "../components/TeachingRecord";
import { YearGroup } from "../components/YearGroup";
import { teaching } from "../data/teaching";

const latest = (years: string) => Math.max(...(years.match(/\d{4}/g) ?? ["0"]).map(Number));
const groups = [...new Set(teaching.map((t) => latest(t.years)))].sort((a, b) => b - a)
  .map((y) => [y, teaching.filter((t) => latest(t.years) === y)] as const);

export function Teaching() {
  return (
    <PageLayout title="Teaching" wide>
      {groups.map(([y, list]) => (
        <YearGroup key={y} id={`ty-${y}`} year={y}>{list.map((t) => <TeachingRecord key={`${t.code ?? t.name}-${t.years}`} t={t} />)}</YearGroup>
      ))}
    </PageLayout>
  );
}
