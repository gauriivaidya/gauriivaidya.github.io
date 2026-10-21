import { site } from "../data/site";
export function ProfileLinks({ className }: { className: string }) {
  const c = site.contact;
  const links = [
    ["Email", `mailto:${c.workEmail}`], ["Google Scholar", c.scholar], ["GitHub", c.github],
    ["LinkedIn", c.linkedin], ["ORCID", c.orcid], ["CV", "/cv.pdf"],
  ];
  return (
    <ul className={className}>
      {links.map(([label, href]) => (
        <li key={label}><a href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{label}</a></li>
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
