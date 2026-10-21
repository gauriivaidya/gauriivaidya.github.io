import { Portrait, ProfileLinks } from "../components/ProfileLinks";
import { site } from "../data/site";

/** The centred intro (portrait, name, role, short bio, links), shared by the default home and option A. */
export function HomeIntro() {
  return (
    <section className="landing-hero" aria-labelledby="name">
      <Portrait className="hero-avatar" sizes="(max-width: 900px) 132px, 272px" />
      <div>
        <h1 id="name">Gauri Vaidya</h1>
        <p className="hero-role">{site.role}, NKDSS, School of Medicine, University of Limerick</p>
        <p className="hero-intro">I apply data analysis and machine learning to chronic kidney disease surveillance and health systems research in Ireland. I hold a PhD in Artificial Intelligence from the University of Limerick (2025).</p>
        <ProfileLinks className="pills" />
      </div>
    </section>
  );
}

export function HomeClassic() {
  return <div className="wrap"><HomeIntro /></div>;
}
