import { useState } from "react";
/** A titled block of text paragraphs with a "Copy" button that copies them as plain text. */
export function CopyBlock({ id, title, paras }: { id: string; title: string; paras: string[] }) {
  const [state, setState] = useState<"" | "ok" | "err">("");
  const text = paras.join("\n\n");
  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
      setState("ok");
    } catch { setState("err"); }
    setTimeout(() => setState(""), 2200);
  };
  return (
    <section className="bio" id={id} aria-labelledby={`${id}-h`}>
      <div className="bio-head">
        <h2 id={`${id}-h`}>{title}</h2>
        <button type="button" className="act copy-btn" onClick={copy} aria-label={`Copy ${title.toLowerCase()}`}>{state === "ok" ? "Copied ✓" : state === "err" ? "Copy failed" : "Copy"}</button>
      </div>
      {paras.map((p, i) => <p key={i}>{p}</p>)}
      <span className="sr-only" aria-live="polite">{state === "ok" ? `${title} copied to clipboard` : ""}</span>
    </section>
  );
}
