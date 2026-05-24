import useAuth from "../../hooks/useAuth";
import useTheme from "../../hooks/useTheme";
import styles from "./Profile.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Moon, Sun, Shield, Activity } from "lucide-react";
import {
  FiMail,
  FiUser,
  FiPhone,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiEdit2,
  FiX,
  FiSave,
} from "react-icons/fi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

const ROLE_META = {
  admin: { label: "Admin", color: "#6c74f0", dim: "rgba(108,116,240,0.1)" },
  manager: { label: "Manager", color: "#f0a855", dim: "rgba(240,168,85,0.1)" },
  staff: { label: "Staff", color: "#3ecf8e", dim: "rgba(62,207,142,0.1)" },
  employee: {
    label: "Employee",
    color: "#60a5fa",
    dim: "rgba(96,165,250,0.1)",
  },
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

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
  const { user, login, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg] = useState({ text: "", type: "" });

  const startEdit = () => {
    setEditForm({ name: user?.name || "", phone: user?.phone || "" });
    setEditMsg({ text: "", type: "" });
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditMsg({ text: "", type: "" });
  };

  const handleSaveProfile = async () => {
    if (!editForm.name.trim())
      return setEditMsg({ text: "Name is required", type: "error" });
    if (editForm.name.trim().length < 3)
      return setEditMsg({
        text: "Name must be at least 3 characters",
        type: "error",
      });
    if (editForm.phone && !/^[0-9]{10}$/.test(editForm.phone))
      return setEditMsg({
        text: "Phone must be exactly 10 digits",
        type: "error",
      });

    setEditLoading(true);
    try {
      const res = await API.put("/users/me", {
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
      });

      const token = localStorage.getItem("token");
      login(res.data.data, token);
      setEditMsg({ text: "Profile updated successfully", type: "success" });
      setTimeout(() => setEditing(false), 1000);
    } catch (err) {
      setEditMsg({
        text: err.message || "Failed to update profile",
        type: "error",
      });
    } finally {
      setEditLoading(false);
    }
  };

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState({ text: "", type: "" });

  const handleChangePassword = async () => {
    setPwdMsg({ text: "", type: "" });

    if (!oldPassword || !newPassword || !confirmPassword)
      return setPwdMsg({ text: "All fields are required", type: "error" });

    if (newPassword.length < 8)
      return setPwdMsg({
        text: "New password must be at least 8 characters",
        type: "error",
      });

    if (newPassword !== confirmPassword)
      return setPwdMsg({ text: "New passwords do not match", type: "error" });

    setPwdLoading(true);
    try {
      await API.post("/auth/change-password", { oldPassword, newPassword });
      setPwdMsg({ text: "Password updated successfully", type: "success" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwdMsg({
        text: err.message || "Error updating password",
        type: "error",
      });
    } finally {
      setPwdLoading(false);
    }
  };

  const roleMeta = ROLE_META[user?.role] || ROLE_META.employee;

  const infoRows = [
    {
      icon: <FiUser size={13} />,
      label: "Full Name",
      value: user?.name || "—",
    },
    { icon: <FiMail size={13} />, label: "Email", value: user?.email || "—" },
    { icon: <FiPhone size={13} />, label: "Phone", value: user?.phone || "—" },
    {
      icon: <Shield size={13} />,
      label: "Role",
      value: roleMeta.label,
      accent: roleMeta.color,
    },
    {
      icon: <Activity size={13} />,
      label: "Status",
      value: user?.status
        ? user.status.charAt(0).toUpperCase() + user.status.slice(1)
        : "Active",
      accent: "var(--green, #3ecf8e)",
    },
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
        {/* ── Left col ── */}
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
            onClick={handleLogout}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.14, duration: 0.3 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut size={15} /> Sign Out
          </motion.button>
        </div>

        {/* ── Right col ── */}
        <div className={styles.rightCol}>
          {/* Account Information */}
          <motion.div
            className={styles.section}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.05, duration: 0.35 }}
          >
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Account Information</h3>
              {!editing && (
                <button className={styles.editBtn} onClick={startEdit}>
                  <FiEdit2 size={12} /> Edit
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {editing ? (
                <motion.div
                  key="edit-form"
                  className={styles.editForm}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className={styles.editField}>
                    <label className={styles.pwdLabel}>Full Name</label>
                    <div className={styles.pwdWrap}>
                      <FiUser size={13} className={styles.pwdIcon} />
                      <input
                        className={styles.pwdInput}
                        type="text"
                        placeholder="Your full name"
                        value={editForm.name}
                        onChange={(e) => {
                          setEditForm((p) => ({ ...p, name: e.target.value }));
                          setEditMsg({ text: "", type: "" });
                        }}
                      />
                    </div>
                  </div>
                  <div className={styles.editField}>
                    <label className={styles.pwdLabel}>Phone</label>
                    <div className={styles.pwdWrap}>
                      <FiPhone size={13} className={styles.pwdIcon} />
                      <input
                        className={styles.pwdInput}
                        type="tel"
                        placeholder="10-digit number"
                        value={editForm.phone}
                        maxLength={10}
                        onChange={(e) => {
                          setEditForm((p) => ({ ...p, phone: e.target.value }));
                          setEditMsg({ text: "", type: "" });
                        }}
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {editMsg.text && (
                      <motion.div
                        className={`${styles.msgBanner} ${editMsg.type === "success" ? styles.msgSuccess : styles.msgError}`}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {editMsg.type === "success" && <FiCheck size={13} />}
                        {editMsg.text}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className={styles.editActions}>
                    <button
                      className={styles.cancelBtn}
                      onClick={cancelEdit}
                      disabled={editLoading}
                    >
                      <FiX size={13} /> Cancel
                    </button>
                    <motion.button
                      className={styles.updateBtn}
                      onClick={handleSaveProfile}
                      disabled={editLoading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {editLoading ? (
                        <>
                          <span className={styles.spinner} /> Saving…
                        </>
                      ) : (
                        <>
                          <FiSave size={13} /> Save Changes
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="info-rows"
                  className={styles.infoGrid}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Change Password */}
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
                  setPwdMsg({ text: "", type: "" });
                }}
                placeholder="Enter current password"
              />
              <PwdField
                label="New password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPwdMsg({ text: "", type: "" });
                }}
                placeholder="Min. 8 characters"
              />
              <PwdField
                label="Confirm new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPwdMsg({ text: "", type: "" });
                }}
                placeholder="Repeat new password"
              />

              <AnimatePresence>
                {pwdMsg.text && (
                  <motion.div
                    className={`${styles.msgBanner} ${pwdMsg.type === "success" ? styles.msgSuccess : styles.msgError}`}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {pwdMsg.type === "success" ? <FiCheck size={13} /> : null}
                    {pwdMsg.text}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                className={styles.updateBtn}
                onClick={handleChangePassword}
                disabled={
                  pwdLoading || !oldPassword || !newPassword || !confirmPassword
                }
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {pwdLoading ? (
                  <>
                    <span className={styles.spinner} /> Updating…
                  </>
                ) : (
                  <>
                    <FiLock size={13} /> Update Password
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
