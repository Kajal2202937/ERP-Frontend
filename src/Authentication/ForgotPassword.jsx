import { useState, useEffect } from "react";
import API, { initCsrf } from "../services/api";
import styles from "./Login.module.css";

const ForgotPassword = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await initCsrf();
      await API.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        padding: "1rem",
        animation: "fpFadeIn 0.18s ease both",
      }}
    >
      <style>{`
        @keyframes fpFadeIn  { from { opacity: 0; }           to { opacity: 1; } }
        @keyframes fpSlideUp { from { transform: translateY(16px) scale(0.97); opacity: 0; }
                               to   { transform: translateY(0)    scale(1);    opacity: 1; } }
      `}</style>

      {/* Modal card — stop clicks propagating to backdrop */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface, #fff)",
          borderRadius: "20px",
          padding: "2rem",
          width: "100%",
          maxWidth: "420px",
          position: "relative",
          boxShadow:
            "0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
          animation: "fpSlideUp 0.22s cubic-bezier(0.22, 1, 0.36, 1) both",
        }}
      >
        {/* Close button — top-right, matches Login.module.css .closeBtn style */}
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close forgot password"
          style={{ position: "absolute", top: "1rem", right: "1rem" }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "1.5rem",
            paddingTop: "0.25rem",
          }}
        >
          {!sent ? (
            <>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #7c83f5, #5a62e8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: 24, height: 24 }}
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div>
              <h2
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  margin: "0 0 0.4rem",
                  color: "var(--text1, #1a1a2e)",
                }}
              >
                Forgot password?
              </h2>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text3, #888)",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Enter your work email and we'll send you a reset link.
              </p>
            </>
          ) : (
            <>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "#e8f5e9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#3ecf8e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: 26, height: 26 }}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  margin: "0 0 0.4rem",
                  color: "var(--text1, #1a1a2e)",
                }}
              >
                Check your email
              </h2>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text3, #888)",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                If an account exists for <strong>{email}</strong>, a reset link
                has been sent.
              </p>
            </>
          )}
        </div>

        {/* Form */}
        {!sent ? (
          <form onSubmit={handleSubmit} noValidate>
            {error && (
              <div
                className={styles.errorBanner}
                style={{ marginBottom: "1rem" }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: 16, height: 16, flexShrink: 0 }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label} htmlFor="forgot-email">
                Email address
              </label>
              <div className={styles.inputWrap}>
                <input
                  id="forgot-email"
                  className={styles.input}
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={loading || !email}
              style={{ marginTop: "1rem" }}
            >
              {loading ? (
                <span className={styles.spinner} />
              ) : (
                "Send reset link"
              )}
            </button>
          </form>
        ) : (
          <button type="button" className={styles.btnSubmit} onClick={onClose}>
            Back to sign in
          </button>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
