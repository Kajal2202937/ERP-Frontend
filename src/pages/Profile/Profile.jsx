import useAuth from "../../hooks/useAuth";
import useTheme from "../../hooks/useTheme";
import styles from "./Profile.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Moon, Sun, Shield, Activity, Clock } from "lucide-react";
import {
  FiMail,
  FiUser,
  FiHash,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheck,
} from "react-icons/fi";
import { useState } from "react";
import API from "../../services/api";

const ROLE_META = {
  admin: { label: "Admin", color: "#6c74f0", dim: "rgba(108,116,240,0.1)" },
  manager: { label: "Manager", color: "#f0a855", dim: "rgba(240,168,85,0.1)" },
  staff: { label: "Staff", color: "#3ecf8e", dim: "rgba(62,207,142,0.1)" },
};

const getInitials = (name) =>
  name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

const PwdField = ({ label, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div className={styles.pwdField}>
      <label className={styles.pwdLabel}>{label}</label>
      <div className={styles.pwdWrap}>
        <FiLock size={13} className={styles.pwdIcon} />
        <input
          className={styles.pwdInput}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete="new-password"
        />
        <button
          type="button"
          className={styles.eyeBtn}
          onClick={() => setShow((v) => !v)}
          tabIndex={-1}
        >
          {show ? <FiEyeOff size={13} /> : <FiEye size={13} />}
        </button>
      </div>
    </div>
  );
};

const Profile = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  const roleMeta = ROLE_META[user?.role] || ROLE_META.staff;

  const handleChangePassword = async () => {
    setMsg({ text: "", type: "" });

    if (!oldPassword || !newPassword || !confirmPassword)
      return setMsg({ text: "All fields are required", type: "error" });

    if (newPassword.length < 6)
      return setMsg({
        text: "New password must be at least 6 characters",
        type: "error",
      });

    if (newPassword !== confirmPassword)
      return setMsg({ text: "New passwords do not match", type: "error" });

    setLoading(true);
    try {
      await API.post("/auth/change-password", { oldPassword, newPassword });
      setMsg({ text: "Password updated successfully", type: "success" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMsg({
        text: err.response?.data?.message || "Error updating password",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const infoRows = [
    {
      icon: <FiUser size={13} />,
      label: "Full Name",
      value: user?.name || "—",
    },
    { icon: <FiMail size={13} />, label: "Email", value: user?.email || "—" },
    {
      icon: <Shield size={13} />,
      label: "Role",
      value: roleMeta.label,
      accent: roleMeta.color,
    },
    {
      icon: <Activity size={13} />,
      label: "Status",
      value: "Active",
      accent: "var(--green, #3ecf8e)",
    },
  ];

  const recentActivity = [
    { icon: <Clock size={12} />, text: "Logged in today" },
    { icon: <Activity size={12} />, text: "Viewed dashboard" },
    { icon: <FiHash size={12} />, text: "Checked inventory" },
  ];

  const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>My Profile</h1>
          <p className={styles.pageSubtitle}>
            Manage your account and preferences
          </p>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.leftCol}>
          <motion.div
            className={styles.profileCard}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className={styles.cardAccent}
              style={{ background: roleMeta.color }}
            />

            <div className={styles.avatarWrap}>
              <div
                className={styles.avatar}
                style={{ borderColor: `${roleMeta.color}40` }}
              >
                {getInitials(user?.name)}
              </div>
              <div className={styles.onlineDot} />
            </div>

            <div className={styles.profileInfo}>
              <h2 className={styles.profileName}>{user?.name}</h2>
              <p className={styles.profileEmail}>{user?.email}</p>
              <span
                className={styles.roleBadge}
                style={{
                  color: roleMeta.color,
                  background: roleMeta.dim,
                  borderColor: `${roleMeta.color}30`,
                }}
              >
                {roleMeta.label}
              </span>
            </div>
          </motion.div>
          <motion.div
            className={styles.section}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.08, duration: 0.3 }}
          >
            <h3 className={styles.sectionTitle}>Preferences</h3>
            <button className={styles.themeBtn} onClick={toggleTheme}>
              <div className={styles.themeBtnLeft}>
                <div className={styles.themeBtnIcon}>
                  {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
                </div>
                <div>
                  <p className={styles.themeBtnLabel}>Theme</p>
                  <p className={styles.themeBtnSub}>
                    {theme === "dark"
                      ? "Dark mode active"
                      : "Light mode active"}
                  </p>
                </div>
              </div>
              <div
                className={`${styles.toggle} ${theme === "dark" ? styles.toggleOn : ""}`}
              >
                <div className={styles.toggleThumb} />
              </div>
            </button>
          </motion.div>
          <motion.button
            className={styles.logoutBtn}
            onClick={logout}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.14, duration: 0.3 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut size={15} />
            Sign Out
          </motion.button>
        </div>
        <div className={styles.rightCol}>
          <motion.div
            className={styles.section}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.05, duration: 0.35 }}
          >
            <h3 className={styles.sectionTitle}>Account Information</h3>
            <div className={styles.infoGrid}>
              {infoRows.map((row) => (
                <div key={row.label} className={styles.infoRow}>
                  <div className={styles.infoIcon}>{row.icon}</div>
                  <div className={styles.infoContent}>
                    <p className={styles.infoLabel}>{row.label}</p>
                    <p
                      className={styles.infoValue}
                      style={row.accent ? { color: row.accent } : {}}
                    >
                      {row.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className={styles.section}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.1, duration: 0.35 }}
          >
            <h3 className={styles.sectionTitle}>Change Password</h3>

            <div className={styles.pwdForm}>
              <PwdField
                label="Current password"
                value={oldPassword}
                onChange={(e) => {
                  setOldPassword(e.target.value);
                  setMsg({ text: "", type: "" });
                }}
                placeholder="Enter current password"
              />

              <PwdField
                label="New password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setMsg({ text: "", type: "" });
                }}
                placeholder="Min. 6 characters"
              />

              <PwdField
                label="Confirm new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setMsg({ text: "", type: "" });
                }}
                placeholder="Repeat new password"
              />
              <AnimatePresence>
                {msg.text && (
                  <motion.div
                    className={`${styles.msgBanner} ${msg.type === "success" ? styles.msgSuccess : styles.msgError}`}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {msg.type === "success" ? <FiCheck size={13} /> : null}
                    {msg.text}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                className={styles.updateBtn}
                onClick={handleChangePassword}
                disabled={
                  loading || !oldPassword || !newPassword || !confirmPassword
                }
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <span className={styles.spinner} />
                    Updating…
                  </>
                ) : (
                  <>
                    <FiLock size={13} />
                    Update Password
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
          <motion.div
            className={styles.section}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.16, duration: 0.35 }}
          >
            <h3 className={styles.sectionTitle}>Recent Activity</h3>
            <div className={styles.activityList}>
              {recentActivity.map((item, i) => (
                <motion.div
                  key={i}
                  className={styles.activityItem}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                >
                  <div className={styles.activityIcon}>{item.icon}</div>
                  <span className={styles.activityText}>{item.text}</span>
                  <span className={styles.activityTime}>just now</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
