import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/tokens.css";
import "./styles/global.css";

const el = document.getElementById("root")!;
const app = <StrictMode><App path={window.location.pathname} /></StrictMode>;
if (el.hasChildNodes()) hydrateRoot(el, app); else createRoot(el).render(app);
