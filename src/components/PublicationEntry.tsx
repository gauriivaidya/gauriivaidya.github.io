import { useState } from "react";
import type { Publication } from "../data/types";

export const TYPE_LABEL: Record<string, string> = { journal: "Journal", conference: "Conference", preprint: "Preprint", "book chapter": "Book chapter", other: "Other" };

/** One publication as a horizontal strip: type thumbnail · citation · actions. */
export function PublicationEntry({ pub }: { pub: Publication }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<"" | "ok" | "err">("");
  const panelId = `bib-${pub.key}`;
  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(pub.bibtex);
      else {
        const ta = document.createElement("textarea");
        ta.value = pub.bibtex; document.body.appendChild(ta); ta.select();
        document.execCommand("copy"); ta.remove();
      }
      setCopied("ok");
    } catch { setCopied("err"); }
    setTimeout(() => setCopied(""), 2200);
  };
  const details = [pub.year, pub.volume && `Vol. ${pub.volume}`, pub.issue && `No. ${pub.issue}`, pub.pages && `pp. ${pub.pages}`].filter(Boolean).join(", ");
  const authors = pub.authors.map((a, i) => (
    <span key={i}>{a.startsWith("Vaidya G") ? <span className="me">{a}</span> : a}{i < pub.authors.length - 1 ? ", " : ""}</span>
  ));
  // Only real URLs from the data become buttons — nothing is invented.
  const links = [
    pub.url && { label: "Link", url: pub.url },
    pub.pdf && { label: "PDF", url: pub.pdf },
    pub.doi && { label: "DOI", url: `https://doi.org/${pub.doi}` },
    pub.video && { label: "Video", url: pub.video },
    pub.slides && { label: "Slides", url: pub.slides },
    pub.project && { label: "Project", url: pub.project },
  ].filter(Boolean) as { label: string; url: string }[];
  const type = pub.label ?? TYPE_LABEL[pub.type];
  return (
    <li className="strip pub" data-type={pub.type} data-year={pub.year ?? ""}>
      <div className="ev-thumb"><div className="ev-ph" aria-hidden="true"><span>{type}</span></div></div>
      <div className="ev-body">
        <p className="pub-authors">{authors}</p>
        <h3 className="pub-title">{pub.title}</h3>
        <p className="pub-venue"><span className="sr-only">{type}. </span>{pub.venue && <em>{pub.venue}</em>}{pub.publisher ? `, ${pub.publisher}` : ""}{details ? `${pub.venue ? ", " : ""}${details}` : ""}</p>
      </div>
      <div className="pub-links">
        {links.map((l) => <a key={l.label} className="act" href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a>)}
        <button type="button" className="act" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)}>BibTeX</button>
      </div>
      <div id={panelId} className="bib-panel" hidden={!open}>
        <pre><code>{pub.bibtex}</code></pre>
        <button type="button" className="btn btn-ghost btn-sm" onClick={copy}>{copied === "ok" ? "Copied ✓" : copied === "err" ? "Copy failed" : "Copy BibTeX"}</button>
        <span className="sr-only" aria-live="polite">{copied === "ok" ? "BibTeX copied to clipboard" : ""}</span>
      </div>
    </li>
  );
}
