import { useEffect, useMemo, useState } from "react";
import { PageLayout } from "../components/PageLayout";
import { PublicationEntry } from "../components/PublicationEntry";
import { Search, Select } from "../components/Search";
import data from "../data/publications.json";
import type { Publication } from "../data/types";

const pubs = data as Publication[];
const TYPES = [["journal", "Journal"], ["conference", "Conference"], ["preprint", "Preprint"], ["book chapter", "Book chapter"], ["other", "Other"]] as const;
const typeLabel = (t: string) => TYPES.find(([v]) => v === t)?.[1] ?? t;
const toggle = (set: Set<string>, v: string) => { const n = new Set(set); n.has(v) ? n.delete(v) : n.add(v); return n; };

function MultiChips({ label, id, options, value, onChange }: { label: string; id: string; options: { value: string; label: string; count: number }[]; value: Set<string>; onChange: (s: Set<string>) => void }) {
  return (
    <fieldset className="multi" id={id}>
      <legend>{label}</legend>
      <div className="chips">
        {options.map((o) => (
          <button key={o.value} type="button" className="chip" data-value={o.value} aria-pressed={value.has(o.value)} onClick={() => onChange(toggle(value, o.value))}>
            {o.label} <span className="chip-n">{o.count}</span>
          </button>
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
  const yearOpts = useMemo(() => [...new Set(pubs.map((p) => p.year).filter(Boolean))].sort((a, b) => b! - a!).map((y) => ({ value: String(y), label: String(y), count: pubs.filter((p) => p.year === y).length })), []);
  const typeOpts = TYPES.map(([value, label]) => ({ value, label, count: pubs.filter((p) => p.type === value).length })).filter((o) => o.count);
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const r = pubs.filter((p) =>
      (!years.size || years.has(String(p.year))) &&
      (!types.size || types.has(p.type)) &&
      (!needle || [p.title, p.venue, p.authors.join(" "), p.year].join(" ").toLowerCase().includes(needle)));
    return sort === "oldest" ? [...r].reverse() : r;
  }, [q, years, types, sort]);
  const active = [
    ...(q.trim() ? [{ k: "q", label: `“${q.trim()}”`, clear: () => setQ("") }] : []),
    ...[...years].sort().reverse().map((y) => ({ k: "y" + y, label: y, clear: () => setYears(toggle(years, y)) })),
    ...[...types].map((t) => ({ k: "t" + t, label: typeLabel(t), clear: () => setTypes(toggle(types, t)) })),
  ];
  const clearAll = () => { setQ(""); setYears(new Set()); setTypes(new Set()); };
  return (
    <PageLayout title="Publications">
      <div className="filters" role="search">
        <Search id="pub-q" label="Search" value={q} onChange={setQ} placeholder="Title, author, venue…" />
        <Select id="pub-sort" label="Sort" value={sort} onChange={setSort} options={[{ value: "newest", label: "Newest first" }, { value: "oldest", label: "Oldest first" }]} />
      </div>
      <MultiChips id="pub-years" label="Year" options={yearOpts} value={years} onChange={setYears} />
      <MultiChips id="pub-types" label="Type" options={typeOpts} value={types} onChange={setTypes} />
      <div className="active-bar" aria-live="polite">
        <span className="count">{shown.length} of {pubs.length} publications</span>
        {active.length > 0 && (
          <span className="active">
            {active.map((a) => <button key={a.k} type="button" className="active-chip" onClick={a.clear} aria-label={`Remove filter ${a.label}`}>{a.label} <span aria-hidden="true">×</span></button>)}
            <button type="button" className="linklike clear-all" onClick={clearAll}>Clear all</button>
          </span>
        )}
      </div>
      {shown.length ? <ol className="pub-list">{shown.map((p) => <PublicationEntry key={p.key} pub={p} />)}</ol> : <p className="empty">No publications match these filters.</p>}
    </PageLayout>
  );
}
