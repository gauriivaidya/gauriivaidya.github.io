import type { ReactNode } from "react";
/** al-folio-style year block: large year label on the left, rows on the right. Shared by Publications, Teaching and Talks. */
export function YearGroup({ id, year, children }: { id: string; year: ReactNode; children: ReactNode }) {
  return (
    <section className="yg" aria-labelledby={id}>
      <h2 id={id} className="yg-year">{year}</h2>
      <ol className="rows">{children}</ol>
    </section>
  );
}
/** One row: brand badge on the left, content on the right. */
export function Row({ badge, title, className, children, ...data }: { badge: string; title?: string; className?: string; children: ReactNode } & Record<`data-${string}`, string | number>) {
  return (
    <li className={className ? `row ${className}` : "row"} {...data}>
      <div className="row-badge"><span className="badge" title={title}>{badge}</span></div>
      <div className="row-body">{children}</div>
    </li>
  );
}
