import { BookingDialog } from "../components/BookingDialog";
import { useCopy } from "../components/copy";
import { Icon } from "../components/Icons";
import { Portrait, SocialRow } from "../components/ProfileLinks";
import { bioLinks, longBio, shortBio, type PhraseLink } from "../data/bio";
import { areas, background, backgroundLinks, BACKGROUND_DRAFT, PORTRAIT, type Area } from "../data/home";
import { site } from "../data/site";
import { Link } from "../router";
import type { MouseEvent, ReactNode } from "react";

function CopyBio({ label, paras }: { label: string; paras: string[] }) {
  const [state, copy] = useCopy();
  return <button type="button" className="act copy-btn" onClick={() => copy(paras.join("\n\n"))}>{state === "ok" ? "Copied ✓" : state === "err" ? "Copy failed" : label}</button>;
}

/** Section with the brand marker (terracotta rounded square) and an optional "See all →" link to the full page. */
function Section({ id, title, all, children }: { id: string; title: string; all?: [string, string]; children: ReactNode }) {
  return (
    <section id={id} className="snap" aria-labelledby={`${id}-h`}>
      <div className="snap-head">
        <h2 id={`${id}-h`} tabIndex={-1}>{title}</h2>
        {all && <Link className="see-all" to={all[0]}>{all[1]} <span aria-hidden="true">→</span></Link>}
      </div>
      {children}
    </section>
  );
}

/**
 * Wraps the first whole-word occurrence of each link phrase in an external link; the visible text stays exactly the source string.
 * `used` (optional) carries phrases already linked in earlier paragraphs, so each one is linked only once across a section.
 */
function linkify(text: string, links: ReadonlyArray<PhraseLink> = bioLinks, used?: Set<string>): ReactNode[] {
  const find = (phrase: string, after?: string) => {
    let from = 0;
    if (after) { const a = text.indexOf(after); if (a < 0) return -1; from = a + after.length; }
    const esc = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const m = new RegExp(`(?<![\\p{L}\\p{N}])${esc}(?![\\p{L}\\p{N}])`, "u").exec(text.slice(from));
    return m ? from + m.index : -1;
  };
  const hits = links.filter(([phrase]) => !used?.has(phrase)).map(([phrase, url, after]) => ({ phrase, url, at: find(phrase, after) }))
    .filter((h) => h.at >= 0).sort((a, b) => a.at - b.at);
  const out: ReactNode[] = []; let i = 0;
  for (const h of hits) {
    if (h.at < i) continue;
    out.push(text.slice(i, h.at), <a key={h.url} href={h.url} target="_blank" rel="noopener noreferrer">{h.phrase}</a>);
    used?.add(h.phrase);
    i = h.at + h.phrase.length;
  }
  out.push(text.slice(i));
  return out;
}

/** In-page jump to a home section: smooth unless the visitor prefers reduced motion; moves focus to the section heading. */
function jumpTo(e: MouseEvent<HTMLAnchorElement>, id: string) {
  const target = document.getElementById(id), heading = document.getElementById(`${id}-h`);
  if (!target) return;
  e.preventDefault();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  heading?.focus({ preventScroll: true });
  history.replaceState(null, "", `#${id}`);
}

/** Home: hero + photo; bio ¶1 + accolades (¶3) verbatim; two research cards; Background story (Pranav Rajpurkar pattern); contact. */
export function Home() {
  const bgUsed = new Set<string>();
  return (
    <div className="home">
      <section className={`hero about-head${PORTRAIT ? "" : " no-photo"}`}>
        {PORTRAIT && <figure className="hero-photo profile"><Portrait src={PORTRAIT} className="profile-img" sizes="(max-width: 640px) 300px, 600px" /></figure>}
        <div className="hero-id">
          <h1 id="name">Gauri Vaidya</h1>
          <p className="about-role">{site.role}</p>
          <p className="hero-aff">National Kidney Disease Surveillance System · School of Medicine, University of Limerick, Ireland</p>
          <SocialRow />
        </div>
        <div className="hero-bio about-body">
          {/* Bio ¶1 verbatim → accolades in passing (bio ¶3, verbatim). Bio ¶2 is the Expertise card. */}
          <div className="about-text">
            <p className="bg">{linkify(longBio[0])}</p>
            <p>{linkify(longBio[2])}</p>
          </div>
          {/* Home-only invitation; deliberately not part of shortBio/longBio, which others copy to introduce her. */}
          <p className="collab">She is always open to collaborations, so feel free to <a href="#contact" onClick={(e) => jumpTo(e, "contact")}>get in touch</a>.</p>
          <p className="bio-copy"><span>Bios for introductions and programmes:</span> <CopyBio label="Copy short bio" paras={shortBio} /> <CopyBio label="Copy long bio" paras={longBio} /></p>
        </div>
      </section>

      <Section id="research" title="Research">
        <ul className="research-list">
          {areas.map((a: Area) => (
            <li key={a.title} className="item">
              <span className="tile tile-brand" aria-hidden="true"><Icon name={a.icon} /></span>
              <div>
                <p className="eyebrow">{a.eyebrow}</p>
                <h3><Link to={a.topic ? `/publications/?topic=${a.topic}` : "/publications/"}>{a.title}</Link></h3>
                <p>{a.summary}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="background" title="Background">
        <div className="background">
          {background.map((p, i) => <p key={i}>{i === 0 && BACKGROUND_DRAFT && <span className="draft" title="Draft wording for Gauri to approve">Draft</span>}{linkify(p, backgroundLinks, bgUsed)}</p>)}
        </div>
      </Section>

      <Section id="contact" title="Get in touch" all={["/contact/", "Contact"]}>
        <div className="contact-row">
          <p>For research collaborations, talks or teaching, email <a href={`mailto:${site.contact.workEmail}`}>{site.contact.workEmail}</a> or book a time.</p>
          <BookingDialog />
        </div>
      </Section>
    </div>
  );
}
