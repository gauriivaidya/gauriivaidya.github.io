import { PageLayout } from "../components/PageLayout";
import { isSet, site } from "../data/site";

export function Contact() {
  const c = site.contact;
  const rows: { label: string; value: string; href?: string }[] = [
    { label: "Work email", value: c.workEmail, href: isSet(c.workEmail) ? `mailto:${c.workEmail}` : undefined },
    { label: "Personal email", value: c.personalEmail, href: `mailto:${c.personalEmail}` },
    { label: "LinkedIn", value: "linkedin.com/in/gauriivaidya", href: c.linkedin },
    { label: "Google Scholar", value: "Google Scholar profile (verified)", href: c.scholar },
    { label: "GitHub", value: "github.com/gauriivaidya", href: c.github },
    { label: "ORCID", value: c.orcid.replace("https://", ""), href: isSet(c.orcid) ? c.orcid : undefined },
  ];
  return (
    <PageLayout title="Contact">
      <p className="contact-intro">I'm always happy to connect with people who are curious about using data and AI to make a meaningful difference. Whether it's a research collaboration, a teaching opportunity, an interesting idea, or simply a conversation, I'd love to hear from you.</p>
      <dl className="contact-list">
        {rows.map((r) => (
          <div key={r.label} className="contact-row">
            <dt>{r.label}</dt>
            <dd>{r.href ? <a href={r.href} {...(r.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{r.value}</a> : <span className="placeholder" title="Placeholder — set in src/data/site.ts">To be added</span>}</dd>
          </div>
        ))}
      </dl>
      <p className="contact-loc">School of Medicine, University of Limerick, Co. Limerick, V94 T9PX, Ireland</p>
    </PageLayout>
  );
}
