import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../services/api";
import styles from "./Login.module.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [form, setForm] = useState({ newPassword: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (!token) {
      setError("Reset token is missing. Please use the link from your email.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await API.post("/auth/reset-password", {
        token,
        newPassword: form.newPassword,
      });
      setDone(true);
    } catch (err) {
      setError(err.message || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid} />
      <div className={styles.card}>
        <div className={styles.brandHeader}>
          <div className={styles.brandLogo}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 20h20M6 20V10l6-6 6 6v10M10 20v-5h4v5" />
            </svg>
          </div>
          <p className={styles.brandName}>ERP System</p>
          <h1 className={styles.brandTagline}>
            {done ? "Password updated" : "Set new password"}
          </h1>
          <p className={styles.brandSub}>
            {done
              ? "Your password has been changed. All other sessions have been logged out."
              : "Choose a strong password with at least 8 characters."}
          </p>
        </div>

        {!done ? (
          <form onSubmit={handleSubmit} className={styles.formBody} noValidate>
            {error && (
              <div className={styles.errorBanner}>
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

            {!token && (
              <div className={styles.errorBanner}>
                Invalid or missing reset token. Please request a new reset link.
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label} htmlFor="rp-password">
                New password
              </label>
              <div className={styles.inputWrap}>
                <input
                  id="rp-password"
                  className={`${styles.input} ${styles.inputPassword}`}
                  name="newPassword"
                  type={showPwd ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={form.newPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPwd((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {/* minimal eye icon */}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {showPwd ? (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="rp-confirm">
                Confirm password
              </label>
              <div className={styles.inputWrap}>
                <input
                  id="rp-confirm"
                  className={styles.input}
                  name="confirm"
                  type={showPwd ? "text" : "password"}
                  placeholder="Repeat new password"
                  value={form.confirm}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={loading || !form.newPassword || !form.confirm || !token}
            >
              {loading ? (
                <span className={styles.spinner} />
              ) : (
                "Update password"
              )}
            </button>
          </form>
        ) : (
          <div className={styles.formBody}>
            <button
              className={styles.btnSubmit}
              onClick={() => navigate("/login")}
            >
              Sign in with new password
            </button>
          </div>
        )}
      </div>
      <div className={styles.meta}>
        <span className={styles.metaDot} />
        ERP v2.4.1 · Enterprise
      </div>
    </div>
  );
};

export default ResetPassword;
