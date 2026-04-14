import useAuth from "../../hooks/useAuth";
import useTheme from "../../hooks/useTheme";
import styles from "./Profile.module.css";
import { motion } from "framer-motion";
import { LogOut, Moon, Sun, Shield, Activity, Clock } from "lucide-react";
import { FiMail, FiUser, FiHash } from "react-icons/fi";

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

const Profile = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const roleMeta = ROLE_META[user?.role] || ROLE_META.staff;

  const infoRows = [
    {
      icon: <FiUser size={13} />,
      label: "Full Name",
      value: user?.name || "—",
    },
    { icon: <FiMail size={13} />, label: "Email", value: user?.email || "—" },
    { icon: <Shield size={13} />, label: "Role", value: roleMeta.label },
    { icon: <Activity size={13} />, label: "Status", value: "Active" },
  ];

  const recentActivity = [
    { icon: <Clock size={12} />, text: "Logged in today" },
    { icon: <Activity size={12} />, text: "Viewed dashboard" },
    { icon: <FiHash size={12} />, text: "Checked inventory" },
  ];

  return (
    <div className={styles.page}>
      {/* ── HEADER ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>My Profile</h1>
          <p className={styles.pageSubtitle}>
            Manage your account and preferences
          </p>
        </div>
      </div>

      <div className={styles.layout}>
        {/* ── LEFT COLUMN ── */}
        <div className={styles.leftCol}>
          {/* Profile card */}
          <motion.div
            className={styles.profileCard}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Accent top line */}
            <div
              className={styles.cardAccent}
              style={{ background: roleMeta.color }}
            />

            <div className={styles.avatarWrap}>
              <div className={styles.avatar}>{getInitials(user?.name)}</div>
              <div className={styles.avatarOnline} />
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

          {/* Theme preference */}
          <motion.div
            className={styles.section}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
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
                    {theme === "dark" ? "Dark mode" : "Light mode"}
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

          {/* Sign out */}
          <motion.button
            className={styles.logoutBtn}
            onClick={logout}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut size={15} />
            Sign Out
          </motion.button>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className={styles.rightCol}>
          {/* Account info */}
          <motion.div
            className={styles.section}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.35 }}
          >
            <h3 className={styles.sectionTitle}>Account Information</h3>
            <div className={styles.infoGrid}>
              {infoRows.map((row) => (
                <div key={row.label} className={styles.infoRow}>
                  <div className={styles.infoIcon}>{row.icon}</div>
                  <div>
                    <p className={styles.infoLabel}>{row.label}</p>
                    <p
                      className={styles.infoValue}
                      style={
                        row.label === "Role" ? { color: roleMeta.color } : {}
                      }
                    >
                      {row.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent activity */}
          <motion.div
            className={styles.section}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.35 }}
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
