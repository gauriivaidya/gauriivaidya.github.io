import { useEffect, useMemo, useState } from "react";
import { PageLayout } from "../components/PageLayout";
import { PublicationEntry, TYPE_LABEL } from "../components/PublicationEntry";
import { Search, Select } from "../components/Search";
import data from "../data/publications.json";
import type { Publication } from "../data/types";

const pubs = data as Publication[];
const TYPE_ORDER = ["journal", "conference", "preprint", "book chapter", "other"];
const toggle = (set: Set<string>, v: string) => { const n = new Set(set); n.has(v) ? n.delete(v) : n.add(v); return n; };

function CheckList({ label, id, options, value, onChange }: { label: string; id: string; options: { value: string; label: string; count: number }[]; value: Set<string>; onChange: (s: Set<string>) => void }) {
  return (
    <fieldset className="checks" id={id}>
      <legend>{label}</legend>
      <div className="check-list">
        {options.map((o) => (
          <label key={o.value} className="check">
            <input type="checkbox" value={o.value} checked={value.has(o.value)} onChange={() => onChange(toggle(value, o.value))} />
            <span>{o.label}</span> <span className="check-n">{o.count}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Publications() {
  const [q, setQ] = useState("");
  const [years, setYears] = useState<Set<string>>(new Set());
  const [types, setTypes] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState("newest");
  useEffect(() => { const v = new URLSearchParams(window.location.search).get("q"); if (v) setQ(v); }, []);
  const allYears = useMemo(() => [...new Set(pubs.map((p) => p.year ?? 0))].sort((a, b) => b - a), []);
  const yearOpts = allYears.map((y) => ({ value: String(y), label: y ? String(y) : "Undated", count: pubs.filter((p) => (p.year ?? 0) === y).length }));
  const typeOpts = TYPE_ORDER.map((value) => ({ value, label: TYPE_LABEL[value], count: pubs.filter((p) => p.type === value).length })).filter((o) => o.count);
  const needle = q.trim().toLowerCase();
  const shown = pubs.filter((p) =>
    (!years.size || years.has(String(p.year ?? 0))) &&
    (!types.size || types.has(p.type)) &&
    (!needle || [p.title, p.venue, p.authors.join(" "), p.year, p.label].join(" ").toLowerCase().includes(needle)));
  const order = sort === "oldest" ? [...allYears].reverse() : allYears;
  const groups = order.map((y) => [y, shown.filter((p) => (p.year ?? 0) === y)] as const).filter(([, l]) => l.length);
  const active = [
    ...(q.trim() ? [{ k: "q", label: `“${q.trim()}”`, clear: () => setQ("") }] : []),
    ...[...years].sort().reverse().map((y) => ({ k: "y" + y, label: y, clear: () => setYears(toggle(years, y)) })),
    ...[...types].map((t) => ({ k: "t" + t, label: TYPE_LABEL[t], clear: () => setTypes(toggle(types, t)) })),
  ];
  const clearAll = () => { setQ(""); setYears(new Set()); setTypes(new Set()); };
  return (
    <PageLayout title="Publications" wide>
      <div className="filters" role="search">
        <Search id="pub-q" label="Search" value={q} onChange={setQ} placeholder="Title, author, venue…" />
        <Select id="pub-sort" label="Sort" value={sort} onChange={setSort} options={[{ value: "newest", label: "Newest first" }, { value: "oldest", label: "Oldest first" }]} />
      </div>
      <div className="check-groups">
        <CheckList id="pub-years" label="Year" options={yearOpts} value={years} onChange={setYears} />
        <CheckList id="pub-types" label="Type" options={typeOpts} value={types} onChange={setTypes} />
      </div>
      <div className="active-bar" aria-live="polite">
        <span className="count">{shown.length} of {pubs.length} publications</span>
        {active.length > 0 && (
          <span className="active">
            {active.map((a) => <button key={a.k} type="button" className="active-chip" onClick={a.clear} aria-label={`Remove filter ${a.label}`}>{a.label} <span aria-hidden="true">×</span></button>)}
            <button type="button" className="linklike clear-all" onClick={clearAll}>Clear all</button>
          </span>
        )}
      </div>
      {groups.length ? groups.map(([y, list]) => (
        <section key={y} className="ev-year" aria-labelledby={`py-${y}`}>
          <h2 id={`py-${y}`} className="ev-year-h">{y || "Undated"}</h2>
          <ol className="strip-list">{list.map((p) => <PublicationEntry key={p.key} pub={p} />)}</ol>
        </section>
      )) : <p className="empty">No publications match these filters.</p>}
    </PageLayout>
  );
}
