import { useMemo, useState } from "react";
import { EventRow } from "../components/EventCard";
import { PageLayout } from "../components/PageLayout";
import { Chips, Search, Select } from "../components/Search";
import { EVENT_TYPES, events } from "../data/events";

export function Events() {
  const [q, setQ] = useState("");
  const [year, setYear] = useState("all");
  const [type, setType] = useState("All");
  const years = useMemo(() => [...new Set(events.map((e) => e.year))].sort((a, b) => b - a), []);
  const needle = q.trim().toLowerCase();
  const shown = events.filter((e) =>
    (type === "All" || e.type === type) &&
    (year === "all" || String(e.year) === year) &&
    (!needle || [e.title, e.host, e.location, e.role, e.description, e.type].join(" ").toLowerCase().includes(needle)));
  const groups = years.map((y) => [y, shown.filter((e) => e.year === y)] as const).filter(([, l]) => l.length);
  return (
    <PageLayout title="Talks & Events">
      <div className="filters" role="search">
        <Search id="ev-q" label="Search" value={q} onChange={setQ} placeholder="Talk, host, place…" />
        <Select id="ev-year" label="Year" value={year} onChange={setYear} options={[{ value: "all", label: "All years" }, ...years.map((y) => ({ value: String(y), label: String(y) }))]} />
      </div>
      <Chips label="Filter by type" value={type} onChange={setType} options={[...EVENT_TYPES]} />
      <p className="count" aria-live="polite">{shown.length} of {events.length} items</p>
      {groups.length ? groups.map(([y, list]) => (
        <section key={y} className="ev-year" aria-labelledby={`y-${y}`}>
          <h2 id={`y-${y}`} className="ev-year-h">{y}</h2>
          <ul className="event-list">{list.map((e) => <EventRow key={e.id} e={e} />)}</ul>
        </section>
      )) : <p className="empty">Nothing here yet for these filters.</p>}
    </PageLayout>
  );
}
