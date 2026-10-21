import { site } from "../data/site";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <span>© {new Date().getFullYear()} Gauri Vaidya</span>
        <a href={`mailto:${site.contact.workEmail}`}>{site.contact.workEmail}</a>
      </div>
    </footer>
  );
}
