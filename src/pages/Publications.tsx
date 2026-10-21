import { useEffect, useMemo, useState } from "react";
import { PageLayout } from "../components/PageLayout";
import { PublicationEntry, TYPE_LABEL } from "../components/PublicationEntry";
import { Search, Select } from "../components/Search";
import data from "../data/publications.json";
import type { Publication } from "../data/types";
import { areas } from "../data/home";
import { ActiveBar, CheckList, toggle } from "../components/CheckList";
import { Icon } from "../components/Icons";
import { site } from "../data/site";

const pubs = data as Publication[];
const TYPE_ORDER = ["journal", "conference", "preprint", "book chapter", "other"];
export function Publications() {
  const [q, setQ] = useState("");
  const [years, setYears] = useState<Set<string>>(new Set());
  const [types, setTypes] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState("newest");
  const [topic, setTopic] = useState("");
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search); const v = sp.get("q"); if (v) setQ(v);
    const t = sp.get("topic"); if (t && areas.some((a) => a.topic === t)) setTopic(t);
  }, []);
  const area = areas.find((a) => a.topic === topic);
  const allYears = useMemo(() => [...new Set(pubs.map((p) => p.year ?? 0))].sort((a, b) => b - a), []);
  const yearOpts = allYears.map((y) => ({ value: String(y), label: y ? String(y) : "Undated", count: pubs.filter((p) => (p.year ?? 0) === y).length }));
  const typeOpts = TYPE_ORDER.map((value) => ({ value, label: TYPE_LABEL[value], count: pubs.filter((p) => p.type === value).length })).filter((o) => o.count);
  const needle = q.trim().toLowerCase();
  const shown = pubs.filter((p) =>
    (!years.size || years.has(String(p.year ?? 0))) &&
    (!types.size || types.has(p.type)) &&
    (!area || area.keywords.test(`${p.title} ${p.venue}`)) &&
    (!needle || [p.title, p.venue, p.authors.join(" "), p.year, p.label].join(" ").toLowerCase().includes(needle)));
  const order = sort === "oldest" ? [...allYears].reverse() : allYears;
  const groups = order.map((y) => [y, shown.filter((p) => (p.year ?? 0) === y)] as const).filter(([, l]) => l.length);
  const active = [
    ...(area ? [{ k: "topic", label: area.title, clear: () => setTopic("") }] : []),
    ...(q.trim() ? [{ k: "q", label: `“${q.trim()}”`, clear: () => setQ("") }] : []),
    ...[...years].sort().reverse().map((y) => ({ k: "y" + y, label: y, clear: () => setYears(toggle(years, y)) })),
    ...[...types].map((t) => ({ k: "t" + t, label: TYPE_LABEL[t], clear: () => setTypes(toggle(types, t)) })),
  ];
  const clearAll = () => { setQ(""); setTopic(""); setYears(new Set()); setTypes(new Set()); };
  return (
    <PageLayout title="Publications" wide action={<a className="btn btn-ghost btn-scholar" href={site.contact.scholar} target="_blank" rel="noopener noreferrer"><Icon name="scholar" /> Full list on Google Scholar <span aria-hidden="true">↗</span><span className="sr-only">(opens in a new tab)</span></a>}>
      <div className="filters" role="search">
        <Search id="pub-q" label="Search" value={q} onChange={setQ} placeholder="Title, author, venue…" />
        <Select id="pub-sort" label="Sort" value={sort} onChange={setSort} options={[{ value: "newest", label: "Newest first" }, { value: "oldest", label: "Oldest first" }]} />
      </div>
      <div className="check-groups">
        <CheckList id="pub-years" label="Year" options={yearOpts} value={years} onChange={setYears} noun={["publication", "publications"]} />
        <CheckList id="pub-types" label="Type" options={typeOpts} value={types} onChange={setTypes} noun={["publication", "publications"]} />
      </div>
      <ActiveBar shown={shown.length} total={pubs.length} noun="publications" active={active} clearAll={clearAll} />
      {groups.length ? groups.map(([y, list]) => (
        <section key={y} className="ev-year" aria-labelledby={`py-${y}`}>
          <h2 id={`py-${y}`} className="ev-year-h">{y || "Undated"}</h2>
          <ol className="strip-list">{list.map((p) => <PublicationEntry key={p.key} pub={p} />)}</ol>
        </section>
      )) : <p className="empty">No publications match these filters.</p>}
    </PageLayout>
  );
}
