import { site } from "../data/site";
import { Icon } from "./Icons";

/** al-folio-style row of social icons (bottom of the home page). */
export function SocialRow() {
  const c = site.contact;
  const links = [
    ["Email", `mailto:${c.workEmail}`, "mail"], ["Google Scholar", c.scholar, "scholar"], ["ORCID", c.orcid, "orcid"],
    ["GitHub", c.github, "github"], ["LinkedIn", c.linkedin, "linkedin"],
  ];
  return (
    <ul className="social">
      {links.map(([label, href, icon]) => (
        <li key={label}><a href={href} aria-label={label} title={label} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}><Icon name={icon} /></a></li>
      ))}
    </ul>
  );
}
const SRC = (f: string) => [96, 192, 200, 340].map((w) => `/images/portrait-${w}.${f} ${w}w`).join(", ");
/** Responsive portrait: AVIF → WebP → JPEG fallback. */
export function Portrait({ className, sizes }: { className: string; sizes: string }) {
  return (
    <picture className={`portrait ${className}`}>
      <source type="image/avif" srcSet={SRC("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={SRC("webp")} sizes={sizes} />
      <img src="/images/portrait-340.jpg" width="200" height="200" alt="Gauri Vaidya" fetchPriority="high" decoding="async" />
    </picture>
  );
}
