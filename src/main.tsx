import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { MarketProvider } from "./context/MarketContext";
import { SavedProvider } from "./context/SavedContext";
import { ToastProvider } from "./context/ToastContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <MarketProvider>
        <SavedProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </SavedProvider>
      </MarketProvider>
    </HashRouter>
  </React.StrictMode>,
);
