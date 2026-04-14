import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Register.module.css";

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
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
const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
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
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

/* ── Password strength helper ── */
const getStrength = (pwd) => {
  if (!pwd) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 8)          score++;
  if (/[A-Z]/.test(pwd))        score++;
  if (/[0-9]/.test(pwd))        score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const levels = [
    { label: "",         color: "" },
    { label: "Weak",     color: "#f87171" },
    { label: "Fair",     color: "#f0a855" },
    { label: "Good",     color: "#4da8f5" },
    { label: "Strong",   color: "#3ecf8e" },
  ];
  return { score, ...levels[score] };
};

const Register = () => {
  const navigate = useNavigate();

  const [form,    setForm]    = useState({ name: "", email: "", password: "", phone: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  const strength = getStrength(form.password);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await API.post("/auth/register", form);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid} />

      <div className={styles.card}>
        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <div className={styles.brandLogo}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 20h20M6 20V10l6-6 6 6v10M10 20v-5h4v5" />
            </svg>
          </div>
          <p className={styles.brandName}>ERP System</p>
          <h1 className={styles.brandTagline}>Create your account</h1>
          <p className={styles.brandSub}>Set up your workspace in under a minute</p>
        </div>

        {/* Success state */}
        {success ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}><IconCheck /></div>
            <p className={styles.successTitle}>Account created!</p>
            <p className={styles.successSub}>Redirecting you to sign in…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.formBody} noValidate>
            {error && (
              <div className={styles.errorBanner}>
                <IconAlert />
                {error}
              </div>
            )}

            {/* Name */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-name">Full name</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><IconUser /></span>
                <input
                  id="reg-name"
                  className={styles.input}
                  name="name"
                  type="text"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-email">Email address</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><IconMail /></span>
                <input
                  id="reg-email"
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

            {/* Password */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-password">Password</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><IconLock /></span>
                <input
                  id="reg-password"
                  className={`${styles.input} ${styles.inputPassword}`}
                  name="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
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
              {/* Strength meter */}
              {form.password && (
                <div className={styles.strengthWrap}>
                  <div className={styles.strengthBar}>
                    {[1,2,3,4].map((i) => (
                      <div
                        key={i}
                        className={styles.strengthSegment}
                        style={{ background: i <= strength.score ? strength.color : undefined }}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <span className={styles.strengthLabel} style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Phone */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-phone">
                Phone
                <span className={styles.optionalBadge}>optional</span>
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><IconPhone /></span>
                <input
                  id="reg-phone"
                  className={styles.input}
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={loading || !form.name || !form.email || !form.password}
            >
              {loading
                ? <span className={styles.spinner} />
                : <><span>Create account</span><IconArrow /></>
              }
            </button>
          </form>
        )}

        {/* Footer */}
        <div className={styles.formFooter}>
          <p className={styles.footerText}>
            Already have an account?{" "}
            <Link to="/login" className={styles.footerLink}>Sign in</Link>
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

export default Register;