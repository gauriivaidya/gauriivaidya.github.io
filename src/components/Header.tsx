import { useEffect, useState } from "react";
import { Link, useRouter } from "../router";
import { MenuToggle, NAV } from "./MenuToggle";
import { ThemeToggle } from "./ThemeToggle";

/** Landing-page header: name left, horizontal nav right. */
export function Header() {
  const { path } = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false); addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, []);
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link to="/" className="logo">Gauri Vaidya</Link>
        <div className="header-tools">
          <ThemeToggle />
          <MenuToggle open={open} onToggle={() => setOpen(!open)} />
        </div>
        <nav id="site-nav" aria-label="Main" className="site-nav top-nav" data-open={open} onClick={() => setOpen(false)}>
          <ul>{NAV.map((r) => <li key={r.path}><Link to={r.path} aria-current={path === r.path ? "page" : undefined}>{r.label}</Link></li>)}</ul>
        </nav>
      </div>
    </header>
  );
}
