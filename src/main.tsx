import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const key = "t3-theme";
const saved = localStorage.getItem(key);
document.body.dataset.theme =
  saved === "light" || saved === "dark" ? saved : "dark";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
