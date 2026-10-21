import type React from "react";
import { useEffect } from "react";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { meta } from "./meta";
import { Contact } from "./pages/Contact";
import { CV } from "./pages/CV";
import { Events } from "./pages/Events";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { Publications } from "./pages/Publications";
import { Teaching } from "./pages/Teaching";
import { Router, useRouter } from "./router";

const PAGES: Record<string, () => React.JSX.Element> = {
  "/": Home, "/publications/": Publications, "/teaching/": Teaching, "/talks/": Events, "/cv/": CV, "/contact/": Contact,
};

function Shell() {
  const { path } = useRouter();
  const Page = PAGES[path] ?? NotFound;
  useEffect(() => { document.title = meta(path).title; }, [path]);
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main" tabIndex={-1}><div className="wrap"><Page /></div></main>
      <Footer />
    </>
  );
}

export function App({ path }: { path: string }) {
  return <Router initialPath={path}><Shell /></Router>;
}
