import { useState, useRef, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/useTheme";
import API from "../../services/api";
import { initSocket, disconnectSocket, getSocket } from "../../services/socket";
import { Bell, Sun, Moon, ChevronDown, LogOut, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Navbar.module.css";

/* ─── Panel animation variants ──────────────────────────── */
/* FIX #1: was missing entirely — panel had no enter/exit animation */
const panelVariants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: -6,
    transformOrigin: "top right",
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -4,
    transition: { duration: 0.13, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ─── Dropdown animation variants ───────────────────────── */
const dropVariants = {
  hidden: { opacity: 0, scale: 0.96, y: -4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.15, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -4,
    transition: { duration: 0.12, ease: [0.22, 1, 0.36, 1] },
  },
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const dropdownRef = useRef(null);
  const socketRef = useRef(null);
  const isMounted = useRef(true);

  /* ─── isMounted guard ─────────────────────────────────── */
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  /* ─── Close panels on outside click ──────────────────── */
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

  /* ─── Fetch initial notifications ────────────────────── */
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await API.get("/contact");
        if (!isMounted.current) return;

        setNotifications(
          (res.data.data || []).map((c) => ({
            _id: c._id,
            title: `Message from ${c.name}`,
            desc:
              (c.message?.slice(0, 60) ?? "") +
              (c.message?.length > 60 ? "…" : ""),
            time: c.createdAt, // FIX #2: was being set but never displayed
            read: c.status !== "new",
            type: "contact",
          })),
        );
      } catch {
        // ignore
      }
    };
    fetchContacts();
  }, []);

  /* ─── Socket: live notifications ─────────────────────── */
  useEffect(() => {
    if (!user) return;

    let socket;
    try {
      socket = getSocket();
    } catch {
      socket = initSocket(localStorage.getItem("token"));
    }
    socketRef.current = socket;

    const handleNotif = (data) => {
      if (!isMounted.current) return;

      setNotifications((prev) => {
        if (prev.some((n) => n._id === data._id)) return prev;
        new Audio("/notification.mp3").play().catch(() => {});
        return [
          {
            _id: data._id,
            title: `Message from ${data.name}`,
            desc: (data.message?.slice(0, 60) ?? "") + "…",
            time: data.createdAt,
            read: false,
            type: "contact",
          },
          ...prev,
        ];
      });
    };

    socket.on("contact_notification", handleNotif);
    return () => {
      socket.off("contact_notification", handleNotif);
    };
  }, [user]);

  /* ─── Actions ─────────────────────────────────────────── */
  const handleLogout = () => {
    logout();
    if (socketRef.current) {
      disconnectSocket();
      socketRef.current = null;
    }
    navigate("/");
  };

  const markAllRead = async () => {
    try {
      await API.patch("/contact/mark-read");
    } catch {
      // fallback: still update UI
    } finally {
      if (isMounted.current) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    }
  };

  /* FIX #2: fmtTime was defined but never called in JSX */
  const fmtTime = (ts) => {
    if (!ts) return "";
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  /* ─── Render ──────────────────────────────────────────── */
  return (
    <div className={styles.navbar}>
      {/* Left — live indicator */}
      <div className={styles.left}>
        <div className={styles.statusDot} />
        <span className={styles.statusLabel}>Live</span>
      </div>

      {/* Right — actions */}
      <div className={styles.right} ref={dropdownRef}>
        {/* Theme toggle */}
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
              initial={{ rotate: -20, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 20, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* ── Bell ─────────────────────────────────────── */}
        <div className={styles.notifWrapper}>
          <motion.button
            className={`${styles.iconBtn} ${notifOpen ? styles.iconBtnActive : ""}`}
            onClick={() => {
              setNotifOpen((v) => !v);
              setOpen(false);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
          >
            <Bell size={15} />

            {/* FIX #4: badge was a motion.span with no animation props */}
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  className={styles.badge}
                  key="badge"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* ── Notification panel ───────────────────── */}
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                className={styles.notifPanel}
                variants={panelVariants} /* FIX #1: was missing */
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* Header */}
                <div className={styles.panelHeader}>
                  <span className={styles.panelTitle}>
                    Notifications
                    {/* FIX #3: show unread count in header */}
                    {unreadCount > 0 && (
                      <span className={styles.panelUnreadCount}>
                        {unreadCount}
                      </span>
                    )}
                  </span>

                  <div className={styles.panelActions}>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead}>Mark all read</button>
                    )}
                    <button
                      onClick={() => {
                        navigate("/contacts");
                        setNotifOpen(false);
                      }}
                    >
                      Open inbox
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className={styles.notifList}>
                  {notifications.length === 0 ? (
                    <div className={styles.notifEmpty}>
                      <Bell size={18} />
                      <p>No notifications</p>
                    </div>
                  ) : (
                    notifications.slice(0, 6).map((n) => (
                      <motion.div
                        key={n._id}
                        /* FIX #3: apply unread class per item */
                        className={`${styles.notifItem} ${!n.read ? styles.notifItemUnread : ""}`}
                        onClick={() => {
                          navigate("/contacts");
                          setNotifOpen(false);
                        }}
                        initial={{ opacity: 0, x: 6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        {/* FIX #5: unread dot per item */}
                        {!n.read && <span className={styles.notifDot} />}

                        <div className={styles.notifBody}>
                          <p>{n.title}</p>
                          <p>{n.desc}</p>
                          {/* FIX #2: fmtTime now actually rendered */}
                          <span className={styles.notifTime}>
                            {fmtTime(n.time)}
                          </span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 6 && (
                  <div className={styles.panelFooter}>
                    <button
                      onClick={() => {
                        navigate("/contacts");
                        setNotifOpen(false);
                      }}
                    >
                      View all {notifications.length} notifications
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sign up */}
        <motion.button
          className={styles.btnOutline}
          onClick={() => navigate("/register")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          Sign up
        </motion.button>

        <div className={styles.divider} />

        {/* Profile */}
        <div className={styles.profileWrapper}>
          <div
            className={styles.profile}
            onClick={() => {
              setOpen((v) => !v);
              setNotifOpen(false);
            }}
          >
            <div className={styles.avatar}>{getInitials(user?.name)}</div>
            <div>
              <span>{user?.name}</span>
              <span>{user?.role}</span>
            </div>
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "flex" }}
            >
              <ChevronDown size={13} />
            </motion.span>
          </div>

          <AnimatePresence>
            {open && (
              <motion.div
                className={styles.dropdown}
                variants={dropVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <button
                  onClick={() => {
                    navigate("/profile");
                    setOpen(false);
                  }}
                >
                  <UserCircle size={14} />
                  My profile
                </button>
                <button onClick={handleLogout}>
                  <LogOut size={14} />
                  Sign out
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
