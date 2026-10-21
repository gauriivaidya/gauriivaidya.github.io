import { Portrait, ProfileLinks } from "../components/ProfileLinks";
import { areas, currently, featuredKeys, recognitions } from "../data/home";
import data from "../data/publications.json";
import { site } from "../data/site";
import type { Publication } from "../data/types";
import { Link } from "../router";
import { HomeIntro } from "./Home";

const pubs = data as Publication[];
const featured = featuredKeys.map((k) => pubs.find((p) => p.key === k)).filter(Boolean) as Publication[];
function Recognitions() {
  return (
    <p className="recognitions"><span className="sr-only">Recognition: </span>
      {recognitions.map((r, i) => <span key={r}>{i > 0 && <span className="sep" aria-hidden="true"> · </span>}<span className="rec">{r}</span></span>)}
    </p>
  );
}
const topicHref = (t: string) => `/publications/?topic=${t}`;

/** Option A — current intro, then three understated research-area columns and a line of recognitions. */
export function HomeAreas() {
  return (
    <div className="wrap home-a">
      <HomeIntro />
      <section className="areas" aria-labelledby="areas-h">
        <h2 id="areas-h" className="sr-only">Research areas</h2>
        <ul className="area-list">
          {areas.map((a) => (
            <li key={a.topic} className="area">
              <h3>{a.title}</h3>
              <p>{a.line}</p>
              <Link to={topicHref(a.topic)} className="more">See papers <span aria-hidden="true">→</span></Link>
            </li>
          ))}
        </ul>
      </section>
      <Recognitions />
    </div>
  );
}

/** Option B — editorial: large name and bio, Research / Currently columns, three selected publications. */
export function HomeEditorial() {
  return (
    <div className="wrap home-b">
      <section className="ed-hero" aria-labelledby="name">
        <div>
          <h1 id="name">Gauri Vaidya</h1>
          <p className="ed-role">{site.role}, NKDSS, School of Medicine, University of Limerick</p>
          <p className="ed-intro">I apply data analysis and machine learning to chronic kidney disease surveillance and health systems research in Ireland. I hold a PhD in Artificial Intelligence from the University of Limerick (2025).</p>
          <ProfileLinks className="pills" />
        </div>
        <Portrait className="ed-avatar" sizes="(max-width: 900px) 96px, 192px" />
      </section>
      <div className="ed-cols">
        <section aria-labelledby="ed-research">
          <h2 id="ed-research" className="ed-label">Research</h2>
          <ul className="ed-list">{areas.map((a) => <li key={a.topic}><Link to={topicHref(a.topic)}>{a.title}</Link></li>)}</ul>
        </section>
        <section aria-labelledby="ed-now">
          <h2 id="ed-now" className="ed-label">Currently</h2>
          <ul className="ed-list plain">{currently.map((c) => <li key={c}>{c}</li>)}</ul>
        </section>
      </div>
      <section className="ed-selected" aria-labelledby="ed-sel">
        <div className="ed-sel-head"><h2 id="ed-sel" className="ed-label">Selected publications</h2><Link to="/publications/" className="more">All publications <span aria-hidden="true">→</span></Link></div>
        <ol className="ed-pubs">
          {featured.map((p) => (
            <li key={p.key}>
              <Link to={`/publications/?q=${encodeURIComponent(p.title.split(":")[0])}`} className="ed-pub-title">{p.title}</Link>
              <p className="ed-pub-venue">{p.venue}{p.year ? `, ${p.year}` : ""}</p>
            </li>
          ))}
        </ol>
      </section>
      <Recognitions />
    </div>
  );
}
