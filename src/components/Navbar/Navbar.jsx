import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/useTheme";
import { getSocket } from "../../services/socket";
import { TICKET_EVENTS } from "../../services/socketEvents";
import { fetchTicketStats } from "../../services/ticketService";
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
import CreateUserModal from "../CreateUserModal/CreateUserModal";

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

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [createUserOpen, setCreateUserOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [ticketStats, setTicketStats] = useState({ unread: 0, new: 0 });

  const dropdownRef = useRef(null);
  const isMounted = useRef(true);

  // Admin and manager can create users
  const canCreateUser = ["admin", "manager"].includes(user?.role);
  // Only admin sees ticket notifications
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

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

  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      try {
        const res = await fetchTicketStats();
        if (!isMounted.current) return;
        setTicketStats(res.data);
      } catch {}
    };
    load();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;

    const socket = getSocket();
    if (!socket) return;

    const handleNewTicket = (payload) => {
      if (!isMounted.current) return;
      setNotifications((prev) => {
        if (prev.some((n) => n._id === payload._id)) return prev;
        new Audio("/notification.mp3").play().catch(() => {});
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

  const handleUserCreated = useCallback(() => {
    setCreateUserOpen(false);
  }, []);

  return (
    <>
      <div className={styles.navbar}>
        <div className={styles.left}>
          <button
            className={styles.hamburger}
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <div className={styles.statusDot} />
          <span className={styles.statusLabel}>Live</span>
        </div>

        <div className={styles.right} ref={dropdownRef}>
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

          {/* FIX: show Create User button for admin AND manager */}
          {canCreateUser && (
            <motion.button
              className={`${styles.iconBtn} ${styles.createUserBtn}`}
              onClick={() => {
                setCreateUserOpen(true);
                setOpen(false);
                setNotifOpen(false);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Create new user"
              title="Create User"
            >
              <UserPlus size={15} />
            </motion.button>
          )}

          {/* Ticket bell — admin only */}
          {isAdmin && (
            <div className={styles.notifWrapper}>
              <motion.button
                className={`${styles.iconBtn} ${notifOpen ? styles.iconBtnActive : ""}`}
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setOpen(false);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Support tickets${badgeCount > 0 ? `, ${badgeCount} unread` : ""}`}
              >
                <Bell size={15} />
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
                    >
                      {badgeCount > 9 ? "9+" : badgeCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    className={styles.notifPanel}
                    variants={panelVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
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
                          <button onClick={markAllRead}>Mark all read</button>
                        )}
                        <button
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
                          <Ticket size={18} />
                          <p>No new tickets</p>
                        </div>
                      ) : (
                        notifications.slice(0, 6).map((n) => (
                          <motion.div
                            key={n._id}
                            className={`${styles.notifItem} ${!n.read ? styles.notifItemUnread : ""}`}
                            onClick={() => {
                              navigate("/tickets");
                              setNotifOpen(false);
                            }}
                            initial={{ opacity: 0, x: 6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.15 }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) =>
                              e.key === "Enter" && navigate("/tickets")
                            }
                          >
                            {!n.read && <span className={styles.notifDot} />}
                            <div className={styles.notifBody}>
                              <p className={styles.notifTitle}>{n.title}</p>
                              <p className={styles.notifDesc}>{n.desc}</p>
                              <span className={styles.notifTime}>
                                {fmtTime(n.time)}
                              </span>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>

                    {notifications.length > 6 && (
                      <div className={styles.panelFooter}>
                        <button
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

          <div className={styles.divider} />

          <div className={styles.profileWrapper}>
            <div
              className={styles.profile}
              onClick={() => {
                setOpen((v) => !v);
                setNotifOpen(false);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={open}
            >
              <div className={styles.avatar}>{getInitials(user?.name)}</div>
              <div className={styles.profileText}>
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
                  {/* FIX: show Create User in dropdown for admin AND manager */}
                  {canCreateUser && (
                    <button
                      onClick={() => {
                        setCreateUserOpen(true);
                        setOpen(false);
                      }}
                    >
                      <UserPlus size={14} /> Create User
                    </button>
                  )}
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setOpen(false);
                    }}
                  >
                    <UserCircle size={14} /> My profile
                  </button>
                  <button onClick={handleLogout}>
                    <LogOut size={14} /> Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* FIX: render modal for admin and manager */}
      {canCreateUser && (
        <CreateUserModal
          isOpen={createUserOpen}
          onClose={() => setCreateUserOpen(false)}
          onSuccess={handleUserCreated}
        />
      )}
    </>
  );
};

export default Navbar;
