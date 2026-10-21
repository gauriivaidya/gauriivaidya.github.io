import type { ReactNode } from "react";
export function PageLayout({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <div className="page">
      <header className="page-head"><h1>{title}</h1>{intro && <p className="lede">{intro}</p>}</header>
      {children}
    </div>
  );
}
