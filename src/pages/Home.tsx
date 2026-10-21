import { useCopy } from "../components/copy";
import { Portrait, SocialRow } from "../components/ProfileLinks";
import { longBio, shortBio } from "../data/bio";
import { site } from "../data/site";

function CopyBio({ label, paras }: { label: string; paras: string[] }) {
  const [state, copy] = useCopy();
  return <button type="button" className="act copy-btn" onClick={() => copy(paras.join("\n\n"))}>{state === "ok" ? "Copied ✓" : state === "err" ? "Copy failed" : label}</button>;
}

/** Home = About (al-folio profile layout): name + role, portrait with affiliation on the right, bio, social icons. */
export function Home() {
  return (
    <div className="page about">
      <header className="about-head">
        <h1 id="name">Gauri Vaidya</h1>
        <p className="about-role">{site.role}, NKDSS, School of Medicine, University of Limerick</p>
      </header>
      <div className="about-body">
        <figure className="profile">
          <Portrait className="profile-img" sizes="(max-width: 640px) 168px, 232px" />
          <figcaption>{site.address.map((l) => <span key={l}>{l}</span>)}</figcaption>
        </figure>
        <div className="about-text">{longBio.map((p, i) => <p key={i}>{p}</p>)}</div>
        <p className="bio-copy"><span>Bios for introductions and programmes:</span> <CopyBio label="Copy short bio" paras={shortBio} /> <CopyBio label="Copy long bio" paras={longBio} /></p>
      </div>
      <SocialRow />
    </div>
  );
}
