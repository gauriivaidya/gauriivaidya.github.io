import { NetworkField } from "../components/NetworkField";
import { Portrait, ProfileLinks } from "../components/ProfileLinks";
import { events } from "../data/events";
import data from "../data/publications.json";
import { site } from "../data/site";
import { teaching } from "../data/teaching";
import { Link } from "../router";

// Three bolder home directions (C cover split, D colour block + index, E network field).
// Facts only: role, short bio, and counts computed from the data files.
const ROLE = `${site.role}, NKDSS, School of Medicine, University of Limerick`;
const BIO = "I apply data analysis and machine learning to chronic kidney disease surveillance and health systems research in Ireland. I hold a PhD in Artificial Intelligence from the University of Limerick (2025).";
const N = { pubs: (data as unknown[]).length, modules: teaching.length, events: events.length };
const Arrow = () => <span className="arr" aria-hidden="true">→</span>;

/** Option C — magazine-cover split: tall teal-tinted portrait panel left, very large name right, counts strip. */
export function HomeCover() {
  return (
    <section className="hc" aria-labelledby="name">
      <div className="hc-panel">
        <div className="hc-frame"><Portrait className="hc-photo" sizes="340px" /></div>
      </div>
      <div className="hc-text">
        <p className="hc-kicker">{site.role}</p>
        <h1 id="name"><span>Gauri</span> <span>Vaidya</span></h1>
        <p className="hc-role">NKDSS, School of Medicine, University of Limerick</p>
        <p className="hc-intro">{BIO}</p>
        <ProfileLinks className="pills" />
        <ul className="hc-stats">
          <li><Link to="/publications/"><b>{N.pubs}</b><span>Publications</span></Link></li>
          <li><Link to="/teaching/"><b>{N.modules}</b><span>Modules taught</span></Link></li>
          <li><Link to="/talks/"><b>{N.events}</b><span>Talks &amp; events</span></Link></li>
        </ul>
      </div>
    </section>
  );
}

/** Option D — full-bleed deep-teal band with the intro, portrait on the band edge, then a big numbered index. */
export function HomeBlock() {
  const idx = [
    ["/about/", "About", "Short and long bio"],
    ["/publications/", "Publications", `${N.pubs} papers, filter by year and type`],
    ["/teaching/", "Teaching", `${N.modules} modules at the University of Limerick`],
    ["/talks/", "Talks & Events", `${N.events} talks, workshops and awards`],
    ["/contact/", "Contact", "Email or book a time"],
  ];
  return (
    <>
      <section className="hd-band" aria-labelledby="name">
        <div className="wrap hd-inner">
          <div className="hd-text">
            <h1 id="name">Gauri Vaidya</h1>
            <p className="hd-role">{ROLE}</p>
            <p className="hd-intro">{BIO}</p>
            <ProfileLinks className="pills pills-inv" />
          </div>
          <Portrait className="hd-photo" sizes="(max-width: 900px) 120px, 260px" />
        </div>
      </section>
      <nav className="wrap hd-index" aria-label="Sections">
        <ol>
          {idx.map(([to, label, sub], i) => (
            <li key={to}><Link to={to}><span className="hd-n">{String(i + 1).padStart(2, "0")}</span><span className="hd-l">{label}</span><span className="hd-s">{sub}</span><Arrow /></Link></li>
          ))}
        </ol>
      </nav>
    </>
  );
}

/** Option E — big centred name block over a faint, slowly drifting data-network texture. */
export function HomeNetwork() {
  return (
    <section className="he" aria-labelledby="name">
      <NetworkField />
      <div className="wrap he-inner">
        <Portrait className="he-photo" sizes="(max-width: 900px) 112px, 152px" />
        <h1 id="name">Gauri Vaidya</h1>
        <p className="he-role">{ROLE}</p>
        <p className="he-intro">{BIO}</p>
        <ProfileLinks className="pills" />
        <p className="he-stats">
          <Link to="/publications/">{N.pubs} publications</Link><span aria-hidden="true">·</span>
          <Link to="/teaching/">{N.modules} modules</Link><span aria-hidden="true">·</span>
          <Link to="/talks/">{N.events} talks &amp; events</Link>
        </p>
      </div>
    </section>
  );
}
