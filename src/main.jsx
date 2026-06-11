import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import ThemeProvider from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { initCsrf } from "./services/api";
import { Toaster } from "react-hot-toast";

import "./index.css";
import "./theme-transitions.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

const renderApp = () => {
  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <NotificationProvider>
              <App />
              <Toaster
                position="top-right"
                gutter={8}
                containerStyle={{ top: 64 }}
                toastOptions={{
                  duration: 3500,
                  style: {
                    background: "var(--surface2)",
                    color: "var(--text)",
                    border: "1px solid var(--border2)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "var(--text-sm)",
                    fontFamily: "var(--font)",
                    boxShadow: "var(--shadow-md)",
                    padding: "10px 14px",
                    maxWidth: 380,
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: "var(--green)",
                      secondary: "var(--surface2)",
                    },
                  },
                  error: {
                    duration: 4500,
                    iconTheme: {
                      primary: "var(--red)",
                      secondary: "var(--surface2)",
                    },
                  },
                }}
              />
            </NotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>,
  );
};

renderApp();

initCsrf().catch((err) => {
  console.warn(
    "[CSRF] Initial token fetch failed, will retry on first mutation:",
    err?.message,
  );
});
