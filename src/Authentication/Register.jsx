import { useState, useEffect, useRef } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Register.module.css";

const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 7l10 7 10-7" />
  </svg>
);

const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 01-2.18 2A19.8 19.8 0 013 5.18 2 2 0 015 3h3a2 2 0 012 1.72c.12.9.32 1.77.6 2.6a2 2 0 01-.45 2.11L9.03 10.97a16 16 0 006 6l1.54-1.12a2 2 0 012.11-.45c.83.28 1.7.48 2.6.6A2 2 0 0122 16.92z" />
  </svg>
);

const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M17.94 17.94A10.94 10.94 0 0112 19c-7 0-11-7-11-7a21.77 21.77 0 015.17-6.32" />
  </svg>
);

const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const getStrength = (pwd) => {
  if (!pwd) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const levels = [
    { label: "", color: "" },
    { label: "Weak", color: "#f87171" },
    { label: "Fair", color: "#f0a855" },
    { label: "Good", color: "#4da8f5" },
    { label: "Strong", color: "#3ecf8e" },
  ];
  return { score, ...levels[score] };
};

const Register = () => {
  const navigate = useNavigate();
  const nameRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const strength = getStrength(form.password);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

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
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid} />

      <div className={styles.card}>
        <button
          className={styles.closeBtn}
          onClick={() => navigate("/dashboard")}
        >
          <IconClose />
        </button>

        <div className={styles.brandHeader}>
          <div className={styles.brandLogo}>🏢</div>
          <p className={styles.brandName}>ERP System</p>
          <h1 className={styles.brandTagline}>Create your account</h1>
          <p className={styles.brandSub}>
            Set up your workspace in under a minute
          </p>
        </div>

        {success ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}>
              <IconCheck />
            </div>
            <p className={styles.successTitle}>Account created!</p>
            <p className={styles.successSub}>Redirecting you to sign in…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.formBody}>
            {error && (
              <div className={styles.errorBanner}>
                <IconAlert />
                {error}
              </div>
            )}

            <div className={styles.field}>
              <label>Full name</label>
              <div className={styles.inputWrap}>
                <IconUser />
                <input
                  ref={nameRef}
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>Email</label>
              <div className={styles.inputWrap}>
                <IconMail />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>Password</label>
              <div className={styles.inputWrap}>
                <IconLock />
                <input
                  type={showPwd ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                />
                <button type="button" onClick={() => setShowPwd((v) => !v)}>
                  {showPwd ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>

              {form.password && (
                <div className={styles.strengthBar}>
                  <div
                    style={{
                      width: `${strength.score * 25}%`,
                      background: strength.color,
                    }}
                  />
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label>Phone</label>
              <div className={styles.inputWrap}>
                <IconPhone />
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
