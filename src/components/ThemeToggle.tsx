import { useEffect, useState } from "react";

/** Light/dark toggle. Initial theme is set before paint by the inline script in index.html. */
export function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => setDark(document.documentElement.dataset.theme === "dark"), []);
  const flip = () => {
    const next = !(document.documentElement.dataset.theme === "dark");
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch { /* private mode */ }
    setDark(next);
  };
  return (
    <button type="button" className="theme-toggle" onClick={flip} aria-label="Dark theme" aria-pressed={dark ?? undefined} title="Toggle dark theme">
      <svg className="i-moon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>
      <svg className="i-sun" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></g></svg>
    </button>
  );
}
