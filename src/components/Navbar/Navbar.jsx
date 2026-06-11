import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/useTheme";
import { getSocket } from "../../services/socket";
import { TICKET_EVENTS } from "../../services/socketEvents";
import { fetchTicketStats } from "../../services/ticketService";
import { SearchTrigger } from "../common/Globalsearch";
import {
  Bell,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  UserCircle,
  Menu,
  Ticket,
  UserPlus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Navbar.module.css";
import { getInitials } from "../../../utils/string";
import CreateUserModal from "../CreateUserModal/CreateUserModal";

const notifAudio =
  typeof window !== "undefined" ? new Audio("/notification.mp3") : null;

const playNotifSound = () => {
  if (!notifAudio) return;
  notifAudio.currentTime = 0;
  notifAudio.play().catch(() => {});
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.96, y: -6, transformOrigin: "top right" },
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

const fmtTime = (ts) => {
  if (!ts) return "";
  const m = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [createUserOpen, setCreateUserOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [ticketStats, setTicketStats] = useState({ unread: 0, new: 0 });

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const isMounted = useRef(true);

  const canCreateUser = ["admin", "manager"].includes(user?.role);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    fetchTicketStats()
      .then((res) => {
        if (!cancelled && isMounted.current) setTicketStats(res.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const socket = getSocket();
    if (!socket) return;

    const handleNewTicket = (payload) => {
      if (!isMounted.current) return;
      setNotifications((prev) => {
        if (prev.some((n) => n._id === payload._id)) return prev;
        playNotifSound();
        return [
          {
            _id: payload._id,
            ticketId: payload.ticketId,
            title: `New ticket from ${payload.name}`,
            desc: payload.subject || "New support request",
            time: payload.createdAt,
            read: false,
            status: payload.status,
          },
          ...prev,
        ];
      });
      setTicketStats((prev) => ({
        ...prev,
        new: (prev.new || 0) + 1,
        unread: (prev.unread || 0) + 1,
      }));
    };

    const handleTicketUpdated = (payload) => {
      if (!isMounted.current) return;
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === payload._id ? { ...n, status: payload.status } : n,
        ),
      );
      if (["resolved", "closed"].includes(payload.status)) {
        setTicketStats((prev) => ({
          ...prev,
          unread: Math.max(0, (prev.unread || 0) - 1),
        }));
      }
    };

    const handleTicketDeleted = (payload) => {
      if (!isMounted.current) return;
      setNotifications((prev) => prev.filter((n) => n._id !== payload._id));
      setTicketStats((prev) => ({
        ...prev,
        unread: Math.max(0, (prev.unread || 0) - 1),
      }));
    };

    const attachListeners = () => {
      socket.off(TICKET_EVENTS.TICKET_NEW, handleNewTicket);
      socket.off(TICKET_EVENTS.TICKET_UPDATED, handleTicketUpdated);
      socket.off(TICKET_EVENTS.TICKET_DELETED, handleTicketDeleted);
      socket.on(TICKET_EVENTS.TICKET_NEW, handleNewTicket);
      socket.on(TICKET_EVENTS.TICKET_UPDATED, handleTicketUpdated);
      socket.on(TICKET_EVENTS.TICKET_DELETED, handleTicketDeleted);
    };

    socket.on("connect", attachListeners);
    if (socket.connected) attachListeners();

    return () => {
      socket.off("connect", attachListeners);
      socket.off(TICKET_EVENTS.TICKET_NEW, handleNewTicket);
      socket.off(TICKET_EVENTS.TICKET_UPDATED, handleTicketUpdated);
      socket.off(TICKET_EVENTS.TICKET_DELETED, handleTicketDeleted);
    };
  }, [isAdmin]);

  const markAllRead = useCallback(() => {
    if (!isMounted.current) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setTicketStats((prev) => ({ ...prev, unread: 0 }));
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
  }, [logout, navigate]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );
  const badgeCount = Math.max(unreadCount, ticketStats.unread || 0);

  return (
    <>
      <header className={styles.navbar} role="banner">
        {/* Left — hamburger + live indicator */}
        <div className={styles.left}>
          <button
            className={styles.hamburger}
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            type="button"
          >
            <Menu size={18} aria-hidden="true" />
          </button>
          <span className={styles.statusDot} aria-hidden="true" />
          <span className={styles.statusLabel} aria-hidden="true">
            Live
          </span>
        </div>

        {/* Right — actions + profile */}
        <div className={styles.right}>
          {/* Theme toggle */}
          <SearchTrigger />
          <motion.button
            className={styles.iconBtn}
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            type="button"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={theme}
                initial={{ rotate: -20, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 20, opacity: 0 }}
                transition={{ duration: 0.18 }}
                aria-hidden="true"
                style={{ display: "flex" }}
              >
                {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          {/* Create user — admin + manager */}
          {canCreateUser && (
            <motion.button
              className={`${styles.iconBtn} ${styles.createUserBtn}`}
              onClick={() => {
                setCreateUserOpen(true);
                setProfileOpen(false);
                setNotifOpen(false);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Create new user"
              type="button"
            >
              <UserPlus size={15} aria-hidden="true" />
            </motion.button>
          )}

          {/* Notifications bell — admin only */}
          {isAdmin && (
            <div className={styles.notifWrapper} ref={notifRef}>
              <motion.button
                className={`${styles.iconBtn} ${notifOpen ? styles.iconBtnActive : ""}`}
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setProfileOpen(false);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Support tickets${badgeCount > 0 ? `, ${badgeCount} unread` : ""}`}
                aria-expanded={notifOpen}
                aria-haspopup="dialog"
                type="button"
              >
                <Bell size={15} aria-hidden="true" />
                <AnimatePresence>
                  {badgeCount > 0 && (
                    <motion.span
                      className={styles.badge}
                      key="badge"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                      }}
                      aria-hidden="true"
                    >
                      {badgeCount > 9 ? "9+" : badgeCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Screen-reader live region */}
              <span
                className={styles.srOnly}
                aria-live="polite"
                aria-atomic="true"
              >
                {badgeCount > 0
                  ? `${badgeCount} unread support ticket${badgeCount > 1 ? "s" : ""}`
                  : ""}
              </span>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    className={styles.notifPanel}
                    variants={panelVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    role="dialog"
                    aria-label="Support ticket notifications"
                    aria-modal="false"
                  >
                    <div className={styles.panelHeader}>
                      <span className={styles.panelTitle}>
                        Support Tickets
                        {badgeCount > 0 && (
                          <span className={styles.panelUnreadCount}>
                            {badgeCount}
                          </span>
                        )}
                      </span>
                      <div className={styles.panelActions}>
                        {unreadCount > 0 && (
                          <button type="button" onClick={markAllRead}>
                            Mark all read
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            navigate("/tickets");
                            setNotifOpen(false);
                          }}
                        >
                          Open inbox
                        </button>
                      </div>
                    </div>

                    <div className={styles.notifList}>
                      {notifications.length === 0 ? (
                        <div className={styles.notifEmpty}>
                          <Ticket size={18} aria-hidden="true" />
                          <p>No new tickets</p>
                        </div>
                      ) : (
                        notifications.slice(0, 6).map((n) => (
                          <motion.button
                            key={n._id}
                            type="button"
                            className={`${styles.notifItem} ${!n.read ? styles.notifItemUnread : ""}`}
                            onClick={() => {
                              navigate("/tickets");
                              setNotifOpen(false);
                            }}
                            initial={{ opacity: 0, x: 6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            {!n.read && (
                              <span
                                className={styles.notifDot}
                                aria-hidden="true"
                              />
                            )}
                            <div className={styles.notifBody}>
                              <p className={styles.notifTitle}>{n.title}</p>
                              <p className={styles.notifDesc}>{n.desc}</p>
                              <span className={styles.notifTime}>
                                {fmtTime(n.time)}
                              </span>
                            </div>
                          </motion.button>
                        ))
                      )}
                    </div>

                    {notifications.length > 6 && (
                      <div className={styles.panelFooter}>
                        <button
                          type="button"
                          onClick={() => {
                            navigate("/tickets");
                            setNotifOpen(false);
                          }}
                        >
                          View all {notifications.length} tickets
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className={styles.divider} aria-hidden="true" />

          {/* Profile — FIX: real <button> instead of <div role="button"> */}
          <div className={styles.profileWrapper} ref={profileRef}>
            <button
              type="button"
              className={styles.profileBtn}
              onClick={() => {
                setProfileOpen((v) => !v);
                setNotifOpen(false);
              }}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              aria-label={`Account menu for ${user?.name ?? "user"}`}
            >
              <div className={styles.avatar} aria-hidden="true">
                {getInitials(user?.name)}
              </div>
              <div className={styles.profileText}>
                <span>{user?.name}</span>
                <span>{user?.role}</span>
              </div>
              <motion.span
                animate={{ rotate: profileOpen ? 180 : 0 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: "flex" }}
                aria-hidden="true"
              >
                <ChevronDown size={13} />
              </motion.span>
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  className={styles.dropdown}
                  variants={dropVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  role="menu"
                  aria-label="Account options"
                >
                  <button
                    role="menuitem"
                    type="button"
                    onClick={() => {
                      navigate("/profile");
                      setProfileOpen(false);
                    }}
                  >
                    <UserCircle size={14} aria-hidden="true" /> My profile
                  </button>
                  <button role="menuitem" type="button" onClick={handleLogout}>
                    <LogOut size={14} aria-hidden="true" /> Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {canCreateUser && (
        <CreateUserModal
          isOpen={createUserOpen}
          onClose={() => setCreateUserOpen(false)}
          onSuccess={() => setCreateUserOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
