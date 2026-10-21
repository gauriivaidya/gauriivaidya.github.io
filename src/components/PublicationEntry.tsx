import { useState } from "react";
import type { Publication } from "../data/types";

const TYPE_LABEL: Record<string, string> = { journal: "Journal", conference: "Conference", preprint: "Preprint", "book chapter": "Book chapter", other: "Other" };

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
  const links = [
    pub.doi && { label: "DOI", url: `https://doi.org/${pub.doi}` },
    pub.url && { label: "Paper", url: pub.url },
    pub.slides && { label: "Slides", url: pub.slides },
    pub.video && { label: "Video", url: pub.video },
    pub.project && { label: "Project page", url: pub.project },
  ].filter(Boolean) as { label: string; url: string }[];
  return (
    <li className="pub" data-type={pub.type} data-year={pub.year ?? ""}>
      <p className="pub-title">{pub.title}</p>
      <p className="pub-authors">{authors}</p>
      <p className="pub-venue">{pub.venue && <em>{pub.venue}</em>}{pub.publisher ? `, ${pub.publisher}` : ""}{details ? `${pub.venue ? ", " : ""}${details}` : ""}.</p>
      <div className="pub-links">
        <span className="pub-type">{pub.label ?? TYPE_LABEL[pub.type]}</span>
        {links.map((l) => <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a>)}
        <button type="button" className="linklike" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)}>BibTeX</button>
      </div>
      <div id={panelId} className="bib-panel" hidden={!open}>
        <pre><code>{pub.bibtex}</code></pre>
        <button type="button" className="btn btn-ghost btn-sm" onClick={copy}>{copied === "ok" ? "Copied ✓" : copied === "err" ? "Copy failed" : "Copy BibTeX"}</button>
        <span className="sr-only" aria-live="polite">{copied === "ok" ? "BibTeX copied to clipboard" : ""}</span>
      </div>
    </li>
  );
}
