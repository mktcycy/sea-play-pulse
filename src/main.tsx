import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { MarketProvider } from "./context/MarketContext";
import { SavedProvider } from "./context/SavedContext";
import { ToastProvider } from "./context/ToastContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <MarketProvider>
        <SavedProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </SavedProvider>
      </MarketProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
