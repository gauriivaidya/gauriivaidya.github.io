export function MenuToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button className="nav-toggle" aria-expanded={open} aria-controls="site-nav" onClick={onToggle}>
      <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      <span className="burger" aria-hidden="true" data-open={open} />
    </button>
  );
}
export const NAV = [
  { path: "/", label: "About" }, { path: "/publications/", label: "Publications" }, { path: "/teaching/", label: "Teaching" },
  { path: "/talks/", label: "Talks & Events" }, { path: "/contact/", label: "Contact" },
];
