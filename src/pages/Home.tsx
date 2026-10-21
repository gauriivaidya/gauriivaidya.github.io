import { Portrait, ProfileLinks } from "../components/ProfileLinks";
import { news } from "../data/news";
import { site } from "../data/site";
import { Link } from "../router";

export function Home() {
  return (
    <div className="wrap">
      <section className="landing-hero" aria-labelledby="name">
        <Portrait className="hero-avatar" sizes="(max-width: 900px) 96px, 200px" />
        <div>
          <h1 id="name">Gauri Vaidya</h1>
          <p className="hero-role">{site.role}, NKDSS, School of Medicine, University of Limerick</p>
          <p className="hero-intro">I apply data analysis and machine learning to chronic kidney disease surveillance and health systems research in Ireland. I hold a PhD in Artificial Intelligence from the University of Limerick (2025).</p>
          <ProfileLinks className="pills" />
        </div>
      </section>
      <section className="recent" aria-labelledby="recent-h">
        <h2 id="recent-h" className="eyebrow">Recent</h2>
        <ul>
          {news.map((n) => (
            <li key={n.text}>
              <span className="recent-date">{n.date}</span>
              <span><strong>{n.kind}</strong> — {n.to ? <Link to={n.to}>{n.text}</Link> : n.text}</span>
            </li>
          ))}
        </ul>
        <p className="recent-more"><Link to="/publications/">All publications →</Link></p>
      </section>
    </div>
  );
}
