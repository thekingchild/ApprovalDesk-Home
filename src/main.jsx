import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import { LegalPage } from "./LegalPage.jsx";
import "./styles.css";
import "./legal.css";
import "./lead-modal.css";

const path = window.location.pathname.replace(/\/+$/, "") || "/";
const legalType = path === "/privacy" ? "privacy" : path === "/terms" ? "terms" : null;

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {legalType ? <LegalPage type={legalType} /> : <App />}
  </React.StrictMode>,
);
