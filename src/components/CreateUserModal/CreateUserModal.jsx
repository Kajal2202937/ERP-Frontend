import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import useAuth from "../../hooks/useAuth";
import styles from "./CreateUserModal.module.css";

const Icon = ({ d, size = 16, strokeWidth = 2 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

const icons = {
  close: "M18 6L6 18M6 6l12 12",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  mail: "M4 4h16c1.1 0 2 .9 2 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  lock: "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4",
  phone:
    "M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.09 5.18 2 2 0 015 3h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L9.09 10.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
  eyeOff:
    "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22",
  check: "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3",
  alert:
    "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  userPlus:
    "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8M19 8v6M22 11h-6",
};

const getStrength = (pwd) => {
  if (!pwd) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const levels = [
    { label: "", color: "transparent" },
    { label: "Weak", color: "var(--cu-danger)" },
    { label: "Fair", color: "var(--cu-warning)" },
    { label: "Good", color: "var(--cu-info)" },
    { label: "Strong", color: "var(--cu-success)" },
  ];
  return { score, ...levels[score] };
};

const ALL_ROLES = [
  {
    value: "employee",
    label: "Employee",
    desc: "Basic read-only access",
    color: "var(--cu-role-employee)",
  },
  {
    value: "staff",
    label: "Staff",
    desc: "Operational access",
    color: "var(--cu-role-staff)",
  },
  {
    value: "manager",
    label: "Manager",
    desc: "Limited management access",
    color: "var(--cu-role-manager)",
  },
  {
    value: "admin",
    label: "Admin",
    desc: "Full system access",
    color: "var(--cu-role-admin)",
  },
];

const INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  role: "staff",
  status: "active",
};

const CreateUserModal = ({ isOpen, onClose, onSuccess }) => {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  const ROLES = isAdmin
    ? ALL_ROLES
    : ALL_ROLES.filter((r) => r.value !== "admin");

  const [form, setForm] = useState(INITIAL_FORM);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const nameRef = useRef(null);
  const strength = getStrength(form.password);

  useEffect(() => {
    if (isOpen) {
      setForm(INITIAL_FORM);
      setError("");
      setFieldErrors({});
      setSuccess(false);
      setTimeout(() => nameRef.current?.focus(), 120);
    }
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
      if (error) setError("");
    },
    [error],
  );

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    else if (form.name.trim().length < 3)
      errs.name = "Name must be at least 3 characters";

    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      errs.email = "Enter a valid email address";

    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8)
      errs.password = "Password must be at least 8 characters";

    if (!form.confirmPassword)
      errs.confirmPassword = "Please confirm the password";
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";

    if (form.phone && !/^[0-9]{10}$/.test(form.phone))
      errs.phone = "Phone must be exactly 10 digits";

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/users/create", form);
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.(res.data.data);
        onClose();
      }, 1600);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create user. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
          role="dialog"
          aria-modal="true"
          aria-label="Create new user"
        >
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* ── Header ── */}
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <div className={styles.headerIcon}>
                  <Icon d={icons.userPlus} size={18} />
                </div>
                <div>
                  <h2 className={styles.title}>Create User Account</h2>
                  <p className={styles.subtitle}>
                    {isAdmin
                      ? "New account will receive access based on assigned role"
                      : "You can create staff, employee, or manager accounts"}
                  </p>
                </div>
              </div>
              <button
                className={styles.closeBtn}
                onClick={onClose}
                aria-label="Close"
                disabled={loading}
              >
                <Icon d={icons.close} size={16} />
              </button>
            </div>

            {/* ── Success state ── */}
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  className={styles.successState}
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className={styles.successIcon}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.1,
                      type: "spring",
                      stiffness: 300,
                      damping: 18,
                    }}
                  >
                    <Icon d={icons.check} size={28} strokeWidth={2.5} />
                  </motion.div>
                  <p className={styles.successTitle}>User created!</p>
                  <p className={styles.successSub}>
                    Account has been set up and is ready to use.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  className={styles.body}
                  onSubmit={handleSubmit}
                  noValidate
                >
                  {/* ── Global error ── */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        className={styles.errorBanner}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        <Icon d={icons.alert} size={15} />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── Row: Full Name + Phone ── */}
                  <div className={styles.row}>
                    <Field label="Full Name" required error={fieldErrors.name}>
                      <InputWrap icon={icons.user}>
                        <input
                          ref={nameRef}
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Enter your name"
                          autoComplete="name"
                          disabled={loading}
                        />
                      </InputWrap>
                    </Field>

                    <Field label="Phone" error={fieldErrors.phone}>
                      <InputWrap icon={icons.phone}>
                        <input
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="10-digit number"
                          autoComplete="tel"
                          disabled={loading}
                          maxLength={10}
                        />
                      </InputWrap>
                    </Field>
                  </div>

                  {/* ── Email ── */}
                  <Field
                    label="Email Address"
                    required
                    error={fieldErrors.email}
                  >
                    <InputWrap icon={icons.mail}>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="user@gmail.com"
                        autoComplete="email"
                        disabled={loading}
                      />
                    </InputWrap>
                  </Field>

                  {/* ── Row: Password + Confirm ── */}
                  <div className={styles.row}>
                    <Field
                      label="Password"
                      required
                      error={fieldErrors.password}
                    >
                      <InputWrap icon={icons.lock}>
                        <input
                          name="password"
                          type={showPwd ? "text" : "password"}
                          value={form.password}
                          onChange={handleChange}
                          placeholder="Min. 8 characters"
                          autoComplete="new-password"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          className={styles.eyeBtn}
                          onClick={() => setShowPwd((v) => !v)}
                          tabIndex={-1}
                          aria-label={
                            showPwd ? "Hide password" : "Show password"
                          }
                        >
                          <Icon
                            d={showPwd ? icons.eyeOff : icons.eye}
                            size={14}
                          />
                        </button>
                      </InputWrap>
                      {form.password && (
                        <div className={styles.strengthWrap}>
                          <div className={styles.strengthTrack}>
                            <motion.div
                              className={styles.strengthFill}
                              animate={{
                                width: `${strength.score * 25}%`,
                                backgroundColor: strength.color,
                              }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                          {strength.label && (
                            <span
                              className={styles.strengthLabel}
                              style={{ color: strength.color }}
                            >
                              {strength.label}
                            </span>
                          )}
                        </div>
                      )}
                    </Field>

                    <Field
                      label="Confirm Password"
                      required
                      error={fieldErrors.confirmPassword}
                    >
                      <InputWrap icon={icons.lock}>
                        <input
                          name="confirmPassword"
                          type={showConfirm ? "text" : "password"}
                          value={form.confirmPassword}
                          onChange={handleChange}
                          placeholder="Repeat password"
                          autoComplete="new-password"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          className={styles.eyeBtn}
                          onClick={() => setShowConfirm((v) => !v)}
                          tabIndex={-1}
                          aria-label={showConfirm ? "Hide" : "Show"}
                        >
                          <Icon
                            d={showConfirm ? icons.eyeOff : icons.eye}
                            size={14}
                          />
                        </button>
                      </InputWrap>
                    </Field>
                  </div>

                  {/* ── Role picker ── */}
                  <Field
                    label="Assign Role"
                    required
                    hint="Controls what this user can access"
                    error={fieldErrors.role}
                  >
                    <div className={styles.roleGrid}>
                      {ROLES.map((r) => (
                        <label
                          key={r.value}
                          className={`${styles.roleCard} ${
                            form.role === r.value ? styles.roleCardActive : ""
                          }`}
                          style={
                            form.role === r.value
                              ? { "--role-color": r.color }
                              : {}
                          }
                        >
                          <input
                            type="radio"
                            name="role"
                            value={r.value}
                            checked={form.role === r.value}
                            onChange={handleChange}
                            disabled={loading}
                            className={styles.roleRadio}
                          />
                          <span
                            className={styles.roleDot}
                            style={{ background: r.color }}
                          />
                          <div className={styles.roleText}>
                            <span className={styles.roleLabel}>{r.label}</span>
                            <span className={styles.roleDesc}>{r.desc}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </Field>

                  {/* ── Status ── */}
                  <Field label="Account Status" error={fieldErrors.status}>
                    <div className={styles.statusToggle}>
                      {["active", "inactive"].map((s) => (
                        <label
                          key={s}
                          className={`${styles.statusOption} ${
                            form.status === s ? styles.statusOptionActive : ""
                          } ${styles[`status_${s}`]}`}
                        >
                          <input
                            type="radio"
                            name="status"
                            value={s}
                            checked={form.status === s}
                            onChange={handleChange}
                            disabled={loading}
                            className={styles.statusRadio}
                          />
                          <span className={styles.statusDot} />
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </label>
                      ))}
                    </div>
                  </Field>

                  {/* ── Actions ── */}
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.btnCancel}
                      onClick={onClose}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={styles.btnSubmit}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className={styles.spinner} />
                          Creating…
                        </>
                      ) : (
                        <>
                          <Icon d={icons.userPlus} size={15} />
                          Create Account
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
};

const Field = ({ label, required, hint, error, children }) => (
  <div className={`${styles.field} ${error ? styles.fieldError : ""}`}>
    <label className={styles.label}>
      {label}
      {required && <span className={styles.required}>*</span>}
      {hint && <span className={styles.hint}>{hint}</span>}
    </label>
    {children}
    <AnimatePresence>
      {error && (
        <motion.p
          className={styles.fieldErrorMsg}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

const InputWrap = ({ icon, children }) => (
  <div className={styles.inputWrap}>
    <span className={styles.inputIcon}>
      <Icon d={icon} size={15} />
    </span>
    {children}
  </div>
);

export default CreateUserModal;
