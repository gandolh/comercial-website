import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@core/lib/i18n";
import "./index.css";
import { App } from "./App.tsx";

const root = document.getElementById("root");
if (!root) throw new Error("index.html has no #root element");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
