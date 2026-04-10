import { useState, useRef, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/useTheme";
import { Bell, Sun, Moon, ChevronDown, LogOut, Settings, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import styles from "./Navbar.module.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getInitials = (name) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  const notifications = [
    { id: 1, title: "New order received", desc: "Order #4521 from Acme Corp", time: "2m ago", unread: true },
    { id: 2, title: "Low stock alert", desc: "Product SKU-088 below threshold", time: "18m ago", unread: true },
    { id: 3, title: "Report ready", desc: "Q2 inventory report generated", time: "1h ago", unread: false },
  ];

  return (
    <div className={styles.navbar}>
      {/* Left — Page breadcrumb feel */}
      <div className={styles.left}>
        <div className={styles.statusDot} />
        <span className={styles.statusLabel}>Live</span>
      </div>

      <div className={styles.right} ref={dropdownRef}>
        {/* Theme Toggle */}
        <motion.button
          className={styles.iconBtn}
          onClick={toggleTheme}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle theme"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              initial={{ rotate: -30, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 30, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* Notification Bell */}
        <div className={styles.notifWrapper}>
          <motion.button
            className={`${styles.iconBtn} ${notifOpen ? styles.iconBtnActive : ""}`}
            onClick={() => { setNotifOpen(!notifOpen); setOpen(false); }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell size={17} />
            <motion.span
              className={styles.badge}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              2
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                className={styles.notifPanel}
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={styles.panelHeader}>
                  <span>Notifications</span>
                  <button className={styles.markAll}>Mark all read</button>
                </div>
                {notifications.map((n, i) => (
                  <motion.div
                    key={n.id}
                    className={`${styles.notifItem} ${n.unread ? styles.notifUnread : ""}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className={styles.notifDot} style={{ opacity: n.unread ? 1 : 0 }} />
                    <div className={styles.notifBody}>
                      <p className={styles.notifTitle}>{n.title}</p>
                      <p className={styles.notifDesc}>{n.desc}</p>
                    </div>
                    <span className={styles.notifTime}>{n.time}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Profile */}
        <div className={styles.profileWrapper}>
          <motion.div
            className={`${styles.profile} ${open ? styles.profileActive : ""}`}
            onClick={() => { setOpen(!open); setNotifOpen(false); }}
            whileHover={{ backgroundColor: "rgba(255,255,255,0.06)" }}
          >
            <div className={styles.avatar}>{getInitials(user?.name)}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.name}</span>
              <span className={styles.userRole}>{user?.role}</span>
            </div>
            <motion.div
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={14} className={styles.chevron} />
            </motion.div>
          </motion.div>

          <AnimatePresence>
            {open && (
              <motion.div
                className={styles.dropdown}
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={styles.dropdownHeader}>
                  <div className={styles.avatarLg}>{getInitials(user?.name)}</div>
                  <div>
                    <p className={styles.dropName}>{user?.name}</p>
                    <p className={styles.dropEmail}>{user?.email}</p>
                  </div>
                </div>
                <div className={styles.dropDivider} />
                <button className={styles.dropItem}>
                  <UserCircle size={15} />
                  <span>My Profile</span>
                </button>
                <button className={styles.dropItem}>
                  <Settings size={15} />
                  <span>Settings</span>
                </button>
                <div className={styles.dropDivider} />
                <button className={`${styles.dropItem} ${styles.dropLogout}`} onClick={handleLogout}>
                  <LogOut size={15} />
                  <span>Sign out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Navbar;