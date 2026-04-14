import { useState } from "react";
import API from "../services/api";
import useAuth from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Login.module.css";

const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 7 10-7" />
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);
const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const Login = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form,    setForm]    = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res  = await API.post("/auth/login", form);
      login(res.data.data, res.data.token);
      const role = res.data.data.role;
      navigate(role === "admin" || role === "manager" ? "/dashboard" : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
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
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 20h20M6 20V10l6-6 6 6v10M10 20v-5h4v5" />
            </svg>
          </div>
          <p className={styles.brandName}>ERP System</p>
          <h1 className={styles.brandTagline}>Welcome back</h1>
          <p className={styles.brandSub}>Sign in to your workspace to continue</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.formBody} noValidate>
          {error && (
            <div className={styles.errorBanner}>
              <IconAlert />
              {error}
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-email">Email address</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}><IconMail /></span>
              <input
                id="login-email"
                className={styles.input}
                name="email"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-password">Password</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}><IconLock /></span>
              <input
                id="login-password"
                className={`${styles.input} ${styles.inputPassword}`}
                name="password"
                type={showPwd ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPwd((v) => !v)}
                tabIndex={-1}
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.btnSubmit}
            disabled={loading || !form.email || !form.password}
          >
            {loading
              ? <span className={styles.spinner} />
              : <><span>Sign in</span><IconArrow /></>
            }
          </button>
        </form>

        <div className={styles.formFooter}>
          <p className={styles.footerText}>
            Don't have an account?{" "}
            <Link to="/register" className={styles.footerLink}>Create one</Link>
          </p>
        </div>
      </div>

      <div className={styles.meta}>
        <span className={styles.metaDot} />
        ERP v2.4.1 · Enterprise
      </div>
    </div>
  );
};

export default Login;