import { renderToStaticMarkup } from "react-dom/server";
import { App } from "./App.jsx";
import { LegalPage } from "./LegalPage.jsx";

export function renderHome() {
  return renderToStaticMarkup(<App />);
}

export function renderLegal(type) {
  return renderToStaticMarkup(<LegalPage type={type} />);
}
