import { useMemo, useState } from "react";
import { ActiveBar, CheckList, toggle } from "../components/CheckList";
import { EventRow } from "../components/EventCard";
import { PageLayout } from "../components/PageLayout";
import { Search } from "../components/Search";
import { YearGroup } from "../components/YearGroup";
import { EVENT_TYPES, events } from "../data/events";

const NOUN: [string, string] = ["item", "items"];

export function Events() {
  const [q, setQ] = useState("");
  const [years, setYears] = useState<Set<string>>(new Set());
  const [types, setTypes] = useState<Set<string>>(new Set());
  const allYears = useMemo(() => [...new Set(events.map((e) => e.year))].sort((a, b) => b - a), []);
  const yearOpts = allYears.map((y) => ({ value: String(y), label: String(y), count: events.filter((e) => e.year === y).length }));
  const typeOpts = EVENT_TYPES.map((value) => ({ value, label: value, count: events.filter((e) => e.type === value).length })).filter((o) => o.count);
  const needle = q.trim().toLowerCase();
  const shown = events.filter((e) =>
    (!years.size || years.has(String(e.year))) &&
    (!types.size || types.has(e.type)) &&
    (!needle || [e.title, e.host, e.location, e.role, e.description, e.type].join(" ").toLowerCase().includes(needle)));
  const groups = allYears.map((y) => [y, shown.filter((e) => e.year === y)] as const).filter(([, l]) => l.length);
  const active = [
    ...(q.trim() ? [{ k: "q", label: `“${q.trim()}”`, clear: () => setQ("") }] : []),
    ...[...years].sort().reverse().map((y) => ({ k: "y" + y, label: y, clear: () => setYears(toggle(years, y)) })),
    ...[...types].map((t) => ({ k: "t" + t, label: t, clear: () => setTypes(toggle(types, t)) })),
  ];
  const clearAll = () => { setQ(""); setYears(new Set()); setTypes(new Set()); };
  return (
    <PageLayout title="Talks & Events" wide>
      <div className="filters" role="search">
        <Search id="ev-q" label="Search" value={q} onChange={setQ} placeholder="Talk, host, place…" />
      </div>
      <div className="check-groups">
        <CheckList id="ev-years" label="Year" options={yearOpts} value={years} onChange={setYears} noun={NOUN} />
        <CheckList id="ev-types" label="Type" options={typeOpts} value={types} onChange={setTypes} noun={NOUN} />
      </div>
      <ActiveBar shown={shown.length} total={events.length} noun="items" active={active} clearAll={clearAll} />
      {groups.length ? groups.map(([y, list]) => (
        <YearGroup key={y} id={`y-${y}`} year={y}>{list.map((e) => <EventRow key={e.id} e={e} />)}</YearGroup>
      )) : <p className="empty">Nothing here yet for these filters.</p>}
    </PageLayout>
  );
}
