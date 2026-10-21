import { renderToString } from "react-dom/server";
import { App } from "./App";
export { meta, ROUTE_PATHS } from "./meta";
export { ALIASES } from "./router";
export const render = (path: string) => renderToString(<App path={path} />);
