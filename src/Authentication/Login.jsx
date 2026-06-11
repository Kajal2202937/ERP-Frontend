import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  X,
} from "lucide-react";
import API, { initCsrf } from "../services/api";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import ForgotPassword from "./ForgotPassword";
import styles from "./Login.module.css";

const getRedirectPath = () => "/dashboard";

const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!validateEmail(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!form.password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      await initCsrf();
      const res = await API.post("/auth/login", form);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      login(res.data.data);
      navigate(getRedirectPath());
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Invalid email or password.",
      );
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !form.email || !form.password;

  return (
    <div className={styles.container}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.card}>
        {/* Close button */}
        <button
          className={styles.closeBtn}
          onClick={() => navigate("/")}
          aria-label="Close and go to home"
          type="button"
        >
          <X size={13} strokeWidth={2.2} />
        </button>

        {/* Brand header */}
        <div className={styles.brandHeader}>
          <div className={styles.brandLogo} aria-hidden="true">
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
          <h1 className={styles.brandTagline}>Welcome back</h1>
          <p className={styles.brandSub}>
            Sign in to your workspace to continue
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className={styles.formBody}
          noValidate
          aria-describedby={error ? "login-error" : undefined}
        >
          {/* Error banner */}
          {error && (
            <div
              id="login-error"
              className={styles.errorBanner}
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle size={15} strokeWidth={2} aria-hidden="true" />
              {error}
            </div>
          )}

          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-email">
              Email address
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon} aria-hidden="true">
                <Mail size={15} strokeWidth={1.8} />
              </span>
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
                aria-required="true"
                aria-invalid={
                  error && !validateEmail(form.email) ? "true" : undefined
                }
              />
            </div>
          </div>

          {/* Password */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-password">
              Password
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon} aria-hidden="true">
                <Lock size={15} strokeWidth={1.8} />
              </span>
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
                aria-required="true"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? "Hide password" : "Show password"}
                aria-pressed={showPwd}
              >
                {showPwd ? (
                  <EyeOff size={15} strokeWidth={1.8} aria-hidden="true" />
                ) : (
                  <Eye size={15} strokeWidth={1.8} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div className={styles.forgotRow}>
            <button
              type="button"
              className={styles.forgotBtn}
              onClick={() => setShowForgot(true)}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={styles.btnSubmit}
            disabled={isDisabled}
            aria-busy={loading}
          >
            {loading ? (
              <span className={styles.spinner} aria-hidden="true" />
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
              </>
            )}
          </button>
        </form>
      </div>

      {showForgot && <ForgotPassword onClose={() => setShowForgot(false)} />}

      <div className={styles.meta} aria-hidden="true">
        <span className={styles.metaDot} />
        ERP v2.4.1 · Enterprise
      </div>
    </div>
  );
};

export default Login;
