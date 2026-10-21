import { Icon } from "../components/Icons";
import { PageLayout } from "../components/PageLayout";
import { site } from "../data/site";

export function Contact() {
  const c = site.contact;
  const booking = site.bookingUrl || `mailto:${c.workEmail}?subject=${encodeURIComponent("Meeting request")}`;
  const buttons: { label: string; href: string; icon: string }[] = [
    { label: "Email (work)", href: `mailto:${c.workEmail}`, icon: "mail" },
    { label: "Email (personal)", href: `mailto:${c.personalEmail}`, icon: "mail" },
    { label: "Google Scholar", href: c.scholar, icon: "scholar" },
    { label: "ORCID", href: c.orcid, icon: "orcid" },
    { label: "GitHub", href: c.github, icon: "github" },
    { label: "LinkedIn", href: c.linkedin, icon: "linkedin" },
    { label: "CV", href: "/cv.pdf", icon: "file" },
  ];
  const ext = (h: string) => (h.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {});
  return (
    <PageLayout title="Contact">
      <p className="contact-intro">I'm always happy to connect with people who are curious about using data and AI to make a meaningful difference. Whether it's a research collaboration, a teaching opportunity, an interesting idea, or simply a conversation, I'd love to hear from you.</p>
      <p className="book"><a className="btn btn-primary btn-lg" href={booking} {...ext(booking)}><Icon name="calendar" /> Book a time with me</a></p>
      <ul className="contact-buttons">
        {buttons.map((b) => (
          <li key={b.label}><a className="cbtn" href={b.href} {...ext(b.href)}><Icon name={b.icon} /><span>{b.label}</span></a></li>
        ))}
      </ul>
      <p className="contact-loc">School of Medicine, University of Limerick, Ireland</p>
    </PageLayout>
  );
}
