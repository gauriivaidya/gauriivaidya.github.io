import { useRef, useState, type FormEvent } from "react";
import { site } from "../data/site";
import { Icon } from "./Icons";

/**
 * "Book a time with me": a short request form in a native <dialog> (focus stays inside, Escape closes).
 * Sent with FormSubmit's AJAX endpoint — the site has no server. The very first real submission makes
 * FormSubmit email the inbox a one-time "Activate form" link; requests are delivered once it is clicked.
 */
export const BOOKING_ENDPOINT = `https://formsubmit.co/ajax/${site.contact.workEmail}`;
export const TOPICS = ["Research collaboration", "Student/supervision enquiry", "Talk or event invitation", "Other"];
type Status = "idle" | "sending" | "sent" | "error";

const mailto = (f: Record<string, string>) => {
  const body = [`Name: ${f.name ?? ""}`, `Email: ${f.email ?? ""}`, `Topic: ${f.topic ?? ""}`, `Preferred times: ${f.times ?? ""}`, "", f.message ?? ""].join("\n");
  return `mailto:${site.contact.workEmail}?subject=${encodeURIComponent("Meeting request")}&body=${encodeURIComponent(body)}`;
};

export function BookingDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [fallback, setFallback] = useState(mailto({}));
  const open = (e: { preventDefault: () => void }) => {
    const d = ref.current; if (!d?.showModal) return; // no <dialog> support: let the mailto link work
    e.preventDefault(); if (status !== "sending") setStatus("idle"); d.showModal();
  };
  const close = () => ref.current?.close();
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setFallback(mailto(f));
    if (f._honey) { setStatus("sent"); return; } // bot filled the hidden field: pretend success, send nothing
    setStatus("sending");
    try {
      const res = await fetch(BOOKING_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: f.name, email: f.email, topic: f.topic, "preferred times": f.times, message: f.message || "(none)",
          _subject: "Meeting request from website", _template: "table", _captcha: "false", _replyto: f.email, _honey: "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || String(data.success) !== "true") throw new Error(data.message || `HTTP ${res.status}`);
      setStatus("sent"); form.reset();
    } catch { setStatus("error"); }
  };
  return (
    <>
      <p className="book"><a className="btn btn-primary btn-lg" href={mailto({})} onClick={open} aria-haspopup="dialog"><Icon name="calendar" /> Book a time with me</a></p>
      <dialog ref={ref} className="book-dialog" aria-labelledby="book-h" onClick={(e) => { if (e.target === ref.current) close(); }}>
        <div className="book-inner">
          <div className="book-head">
            <h2 id="book-h">Book a time with me</h2>
            <button type="button" className="book-x" onClick={close} aria-label="Close"><span aria-hidden="true">×</span></button>
          </div>
          {status === "sent" ? (
            <div className="book-done" role="status">
              <p className="book-ok">Thank you, your request has been sent.</p>
              <p>I'll reply by email to confirm a time.</p>
              <button type="button" className="btn btn-primary" onClick={close} autoFocus>Close</button>
            </div>
          ) : (
            <form className="book-form" onSubmit={submit}>
              <p className="book-sub">Tell me a little about what you'd like to discuss and when suits you, and I'll reply by email to confirm.</p>
              <div className="bf-row">
                <div className="bf"><label htmlFor="bf-name">Name</label><input id="bf-name" name="name" required autoComplete="name" /></div>
                <div className="bf"><label htmlFor="bf-email">Email</label><input id="bf-email" name="email" type="email" required autoComplete="email" /></div>
              </div>
              <div className="bf"><label htmlFor="bf-topic">What it's about</label>
                <select id="bf-topic" name="topic" required defaultValue=""><option value="" disabled>Choose one…</option>{TOPICS.map((t) => <option key={t}>{t}</option>)}</select></div>
              <div className="bf"><label htmlFor="bf-times">Preferred times</label><input id="bf-times" name="times" required aria-describedby="bf-times-h" /><small id="bf-times-h">For example: Tue or Thu afternoons, week of 2 Nov (Irish time)</small></div>
              <div className="bf"><label htmlFor="bf-msg">Message <span className="opt">(optional)</span></label><textarea id="bf-msg" name="message" rows={3} /></div>
              <div className="bf-hp" aria-hidden="true"><label htmlFor="bf-hp">Leave this empty</label><input id="bf-hp" name="_honey" tabIndex={-1} autoComplete="off" /></div>
              {status === "error" && (
                <p className="book-err" role="alert">Sorry, the request couldn't be sent. You can <a href={fallback}>send it by email instead</a>; your details are already filled in.</p>
              )}
              <div className="bf-actions">
                <button type="submit" className="btn btn-primary" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send request"}</button>
                <button type="button" className="btn btn-ghost" onClick={close}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
