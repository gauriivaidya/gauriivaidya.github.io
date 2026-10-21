import { createContext, useCallback, useContext, useEffect, useState, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from "react";

/** Old URLs that now show another page (home = About, as in al-folio). */
export const ALIASES: Record<string, string> = { "/about/": "/" };

export const normalize = (p: string) => {
  const clean = p.split(/[?#]/)[0] || "/";
  const n = clean.endsWith("/") ? clean : clean + "/";
  return ALIASES[n] ?? n;
};

type Ctx = { path: string; navigate: (to: string) => void };
const RouterCtx = createContext<Ctx>({ path: "/", navigate: () => {} });

export function Router({ initialPath, children }: { initialPath: string; children: ReactNode }) {
  const [path, setPath] = useState(normalize(initialPath));
  useEffect(() => {
    if (normalize(location.pathname) !== location.pathname) history.replaceState({}, "", normalize(location.pathname) + location.search + location.hash);
    const onPop = () => setPath(normalize(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const navigate = useCallback((to: string) => {
    const target = normalize(to);
    const full = target + (to.includes("?") ? "?" + to.split("?")[1] : "");
    if (full !== window.location.pathname + window.location.search) window.history.pushState({}, "", full);
    setPath(target);
    window.scrollTo({ top: 0 });
    requestAnimationFrame(() => document.getElementById("main")?.focus({ preventScroll: true }));
  }, []);
  return <RouterCtx.Provider value={{ path, navigate }}>{children}</RouterCtx.Provider>;
}

export const useRouter = () => useContext(RouterCtx);

export function Link({ to, children, onClick, ...rest }: { to: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { navigate } = useRouter();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(to);
  };
  return <a href={to} onClick={handle} {...rest}>{children}</a>;
}
