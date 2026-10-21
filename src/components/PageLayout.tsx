import type { ReactNode } from "react";
export function PageLayout({ title, intro, wide, action, children }: { title: string; intro?: ReactNode; wide?: boolean; action?: ReactNode; children: ReactNode }) {
  return (
    <div className={wide ? "page wide" : "page"}>
      <header className={action ? "page-head has-action" : "page-head"}><h1>{title}</h1>{action && <div className="page-action">{action}</div>}{intro && <p className="lede">{intro}</p>}</header>
      {children}
    </div>
  );
}
