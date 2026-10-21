import type { ReactNode } from "react";
export function PageLayout({ title, intro, wide, children }: { title: string; intro?: ReactNode; wide?: boolean; children: ReactNode }) {
  return (
    <div className={wide ? "page wide" : "page"}>
      <header className="page-head"><h1>{title}</h1>{intro && <p className="lede">{intro}</p>}</header>
      {children}
    </div>
  );
}
