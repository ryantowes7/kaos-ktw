import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

const ensureRootContainer = () => {
  const existingRoot = document.getElementById("root");
  if (existingRoot) return existingRoot;

  const fallbackRoot = document.createElement("div");
  fallbackRoot.id = "root";
  document.body.appendChild(fallbackRoot);
  return fallbackRoot;
};

const root = ReactDOM.createRoot(ensureRootContainer());
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);