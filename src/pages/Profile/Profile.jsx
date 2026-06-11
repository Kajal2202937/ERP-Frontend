import { useState, useMemo } from "react";
import useAuth from "../../hooks/useAuth";
import styles from "./Profile.module.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, Shield, Activity,
  Mail, User, Phone, Lock, Eye, EyeOff,
  Check, Edit2, X, Save,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { getInitials } from "../../../utils/string";
import { toast } from "../../../utils/toast";


const ROLE_META = {
  admin:    { label: "Admin",    color: "var(--red)",    dim: "var(--red-soft)"    },
  manager:  { label: "Manager",  color: "var(--amber)",  dim: "var(--amber-soft)"  },
  staff:    { label: "Staff",    color: "var(--green)",  dim: "var(--green-soft)"  },
  employee: { label: "Employee", color: "var(--blue)",   dim: "var(--blue-soft)"   },
};

/* Simple password strength scorer */
const scorePassword = (pwd) => {
  if (!pwd) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const levels = [
    { label: "",          color: "" },
    { label: "Weak",      color: "var(--red)"   },
    { label: "Fair",      color: "var(--amber)" },
    { label: "Good",      color: "var(--amber)" },
    { label: "Strong",    color: "var(--green)" },
    { label: "Very strong", color: "var(--green)" },
  ];
  return { score, ...levels[score] };
};

/* ── Password field ── */
const PwdField = ({ id, label, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div className={styles.pwdField}>
      <label className={styles.pwdLabel} htmlFor={id}>{label}</label>
      <div className={styles.pwdWrap}>
        <Lock size={13} className={styles.pwdIcon} aria-hidden="true" />
        <input
          id={id}
          className={styles.pwdInput}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete="new-password"
        />
        {/* FIX: removed tabIndex={-1} — eye toggle is now keyboard accessible */}
        <button
          type="button"
          className={styles.eyeBtn}
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
        >
          {show
            ? <EyeOff size={13} aria-hidden="true" />
            : <Eye    size={13} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
};

const Profile = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  /* FIX: ROLE_META now uses CSS variable tokens */
  const roleMeta = ROLE_META[user?.role] ?? ROLE_META.employee;

  const [editing,  setEditing]  = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "" });
  const [saving,   setSaving]   = useState(false);

  const [pwdForm, setPwdForm] = useState({ current: "", next: "", confirm: "" });
  const [pwdSaving, setPwdSaving] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  const startEdit = () => {
    setEditForm({ name: user?.name || "", phone: user?.phone || "" });
    setEditing(true);
  };

  const cancelEdit = () => { setEditing(false); setEditForm({ name: "", phone: "" }); };

  const saveProfile = async () => {
    if (!editForm.name.trim()) return toast.error("Name cannot be empty");
    setSaving(true);
    try {
      const res = await API.put("/auth/profile", editForm);
      login({ ...user, ...res.data?.data });
      toast.success("Profile updated");
      setEditing(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (!pwdForm.current) return toast.error("Enter your current password");
    if (!pwdForm.next)    return toast.error("Enter a new password");
    if (pwdForm.next.length < 8) return toast.error("New password must be at least 8 characters");
    if (pwdForm.next !== pwdForm.confirm) return toast.error("Passwords do not match");
    setPwdSaving(true);
    try {
      await API.put("/auth/change-password", {
        currentPassword: pwdForm.current,
        newPassword:     pwdForm.next,
      });
      toast.success("Password changed");
      setPwdForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Change failed");
    } finally {
      setPwdSaving(false);
    }
  };

  /* Real-time password strength */
  const strength = useMemo(() => scorePassword(pwdForm.next), [pwdForm.next]);

  /* Real-time confirm match */
  const confirmMismatch = pwdForm.confirm.length > 0 && pwdForm.confirm !== pwdForm.next;

  return (
    <div className={styles.page}>
      {/* ── Profile card ── */}
      <div className={styles.profileCard}>
        <div className={styles.avatarSection}>
          <div
            className={styles.avatar}
            style={{ background: roleMeta.dim, border: `2px solid ${roleMeta.color}` }}
            aria-hidden="true"
          >
            <span style={{ color: roleMeta.color }}>{getInitials(user?.name)}</span>
          </div>
          <div className={styles.avatarInfo}>
            <h1 className={styles.userName}>{user?.name || "User"}</h1>
            <span
              className={styles.roleChip}
              style={{ color: roleMeta.color, background: roleMeta.dim }}
            >
              <Shield size={10} aria-hidden="true" />
              {roleMeta.label}
            </span>
          </div>
        </div>

        {/* Contact info */}
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <Mail size={13} className={styles.infoIcon} aria-hidden="true" />
            <div>
              <p className={styles.infoLabel}>Email</p>
              <p className={styles.infoValue}>{user?.email || "—"}</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <Phone size={13} className={styles.infoIcon} aria-hidden="true" />
            <div>
              <p className={styles.infoLabel}>Phone</p>
              <p className={styles.infoValue}>{user?.phone || "Not set"}</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <User size={13} className={styles.infoIcon} aria-hidden="true" />
            <div>
              <p className={styles.infoLabel}>Role</p>
              <p className={styles.infoValue}>{roleMeta.label}</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <Activity size={13} className={styles.infoIcon} aria-hidden="true" />
            <div>
              <p className={styles.infoLabel}>Status</p>
              <p className={styles.infoValue} style={{ color: "var(--green)" }}>Active</p>
            </div>
          </div>
        </div>

        {/* Actions row */}
        <div className={styles.actionRow}>
          {!editing ? (
            <button type="button" className={styles.editBtn} onClick={startEdit}>
              <Edit2 size={13} aria-hidden="true" /> Edit Profile
            </button>
          ) : (
            <div className={styles.editActions}>
              <button type="button" className={styles.saveBtn} onClick={saveProfile} disabled={saving}>
                {saving
                  ? <span className={styles.spinner} aria-hidden="true" />
                  : <><Save size={13} aria-hidden="true" /> Save</>}
              </button>
              <button type="button" className={styles.cancelEditBtn} onClick={cancelEdit} disabled={saving}>
                <X size={13} aria-hidden="true" /> Cancel
              </button>
            </div>
          )}
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={13} aria-hidden="true" /> Sign out
          </button>
        </div>

        {/* Edit form */}
        <AnimatePresence>
          {editing && (
            <motion.div className={styles.editForm}
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="profile-name">
                  <User size={12} aria-hidden="true" /> Full Name
                </label>
                <input
                  id="profile-name"
                  className={styles.formInput}
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Your full name"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="profile-phone">
                  <Phone size={12} aria-hidden="true" /> Phone
                </label>
                <input
                  id="profile-phone"
                  className={styles.formInput}
                  value={editForm.phone}
                  onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+91 00000 00000"
                  type="tel"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Change password card ── */}
      <div className={styles.passwordCard}>
        <h2 className={styles.sectionTitle}>
          <Lock size={15} aria-hidden="true" /> Change Password
        </h2>

        <div className={styles.pwdFields}>
          <PwdField
            id="pwd-current"
            label="Current password"
            value={pwdForm.current}
            onChange={(e) => setPwdForm((p) => ({ ...p, current: e.target.value }))}
            placeholder="Enter current password"
          />

          <PwdField
            id="pwd-new"
            label="New password"
            value={pwdForm.next}
            onChange={(e) => setPwdForm((p) => ({ ...p, next: e.target.value }))}
            placeholder="Min. 8 characters"
          />

          {/* Password strength indicator */}
          {pwdForm.next.length > 0 && (
            <div className={styles.strengthWrap} aria-label={`Password strength: ${strength.label}`}>
              <div className={styles.strengthBars}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className={styles.strengthBar}
                    style={{
                      background: n <= strength.score ? strength.color : "var(--border2)",
                      transition: "background 0.2s ease",
                    }}
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

          {/* Confirm with real-time mismatch */}
          <div className={styles.pwdField}>
            <label className={styles.pwdLabel} htmlFor="pwd-confirm">Confirm new password</label>
            <div className={`${styles.pwdWrap} ${confirmMismatch ? styles.pwdWrapError : ""}`}>
              <Lock size={13} className={styles.pwdIcon} aria-hidden="true" />
              <input
                id="pwd-confirm"
                className={styles.pwdInput}
                type="password"
                placeholder="Repeat new password"
                value={pwdForm.confirm}
                onChange={(e) => setPwdForm((p) => ({ ...p, confirm: e.target.value }))}
                autoComplete="new-password"
                aria-invalid={confirmMismatch}
                aria-describedby={confirmMismatch ? "pwd-confirm-error" : undefined}
              />
              {/* Real-time match indicator */}
              {pwdForm.confirm.length > 0 && (
                <span
                  className={styles.matchIcon}
                  style={{ color: confirmMismatch ? "var(--red)" : "var(--green)" }}
                  aria-hidden="true"
                >
                  {confirmMismatch ? <X size={13} /> : <Check size={13} />}
                </span>
              )}
            </div>
            {confirmMismatch && (
              <p id="pwd-confirm-error" className={styles.fieldError} role="alert">
                Passwords do not match
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          className={styles.changePwdBtn}
          onClick={savePassword}
          disabled={pwdSaving || confirmMismatch || !pwdForm.current || !pwdForm.next || !pwdForm.confirm}
        >
          {pwdSaving
            ? <><span className={styles.spinner} aria-hidden="true" /> Changing…</>
            : <><Check size={13} aria-hidden="true" /> Change Password</>}
        </button>
      </div>
    </div>
  );
};

export default Profile;