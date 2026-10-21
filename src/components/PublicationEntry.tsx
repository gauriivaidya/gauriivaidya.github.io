import { useState } from "react";
import type { Publication } from "../data/types";
import { useCopy } from "./copy";
import { Row } from "./YearGroup";

export const TYPE_LABEL: Record<string, string> = { journal: "Journal", conference: "Conference", preprint: "Preprint", "book chapter": "Book chapter", other: "Other" };

/** One publication, al-folio style: venue badge · title · authors · venue · ABS/BIB + link buttons. */
export function PublicationEntry({ pub, idPrefix = "" }: { pub: Publication; idPrefix?: string }) {
  const [open, setOpen] = useState<"" | "abs" | "bib">("");
  const [copied, copy] = useCopy();
  const flip = (p: "abs" | "bib") => setOpen(open === p ? "" : p);
  const details = [pub.year, pub.volume && `Vol. ${pub.volume}`, pub.issue && `No. ${pub.issue}`, pub.pages && `pp. ${pub.pages}`].filter(Boolean).join(", ");
  const authors = pub.authors.map((a, i) => (
    <span key={i}>{a.startsWith("Vaidya G") ? <b className="me">{a}</b> : a}{i < pub.authors.length - 1 ? ", " : ""}</span>
  ));
  // Only real URLs from the data become buttons — nothing is invented.
  const links = ([["HTML", pub.url], ["PDF", pub.pdf], ["DOI", pub.doi && `https://doi.org/${pub.doi}`], ["Code", pub.code], ["Slides", pub.slides], ["Video", pub.video], ["Project", pub.project]]
    .filter(([, u]) => u)) as [string, string][];
  const type = pub.label ?? TYPE_LABEL[pub.type];
  const id = idPrefix + pub.key;
  return (
    <Row className="pub" badge={pub.abbr ?? type} title={pub.venue || type} data-type={pub.type} data-year={pub.year ?? ""}>
      <h3 className="pub-title">{pub.title}</h3>
      <p className="pub-authors">{authors}</p>
      <p className="pub-venue"><span className="sr-only">{type}. </span>{pub.venue && <em>{pub.venue}</em>}{pub.publisher ? `, ${pub.publisher}` : ""}{details ? `${pub.venue ? ", " : ""}${details}` : ""}</p>
      <div className="pub-links">
        {pub.abstract && <button type="button" className="act" aria-expanded={open === "abs"} aria-controls={`abs-${id}`} onClick={() => flip("abs")}>Abs</button>}
        <button type="button" className="act" aria-expanded={open === "bib"} aria-controls={`bib-${id}`} onClick={() => flip("bib")} title="BibTeX">Bib</button>
        {links.map(([l, u]) => <a key={l} className="act" href={u} target="_blank" rel="noopener noreferrer">{l}</a>)}
      </div>
      {pub.abstract && <div id={`abs-${id}`} className="panel" hidden={open !== "abs"}><p>{pub.abstract}</p></div>}
      <div id={`bib-${id}`} className="panel bib-panel" hidden={open !== "bib"}>
        <pre><code>{pub.bibtex}</code></pre>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => copy(pub.bibtex)}>{copied === "ok" ? "Copied ✓" : copied === "err" ? "Copy failed" : "Copy BibTeX"}</button>
        <span className="sr-only" aria-live="polite">{copied === "ok" ? "BibTeX copied to clipboard" : ""}</span>
      </div>
    </Row>
  );
}
