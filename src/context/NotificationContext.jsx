import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const notify = useCallback((message, type = "info", duration = 3500) => {
    const id = `notif_${Date.now()}_${Math.random()}`;
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration);
  }, []);

  const dismiss = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notify, dismiss, notifications }}>
      {children}

      <div style={containerStyle}>
        <AnimatePresence initial={false}>
          {notifications.map((n) => {
            const meta = TYPE_META[n.type] ?? TYPE_META.info;
            return (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.94 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                style={{ ...toastStyle, ...meta.style }}
                onClick={() => dismiss(n.id)}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.975 }}
              >
                <span style={iconWrapStyle(meta.color)}>{meta.icon}</span>
                <span style={messageStyle}>{n.message}</span>
                <span style={dismissStyle}>✕</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotification must be used inside NotificationProvider");
  return ctx;
};

const containerStyle = {
  position: "fixed",
  bottom: 24,
  right: 24,
  zIndex: 9999,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  width: 340,

  pointerEvents: "none",
};

const toastStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "11px 14px",
  borderRadius: 12,
  border: "1px solid",
  cursor: "pointer",

  fontFamily: "var(--font, sans-serif)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  pointerEvents: "all",
  userSelect: "none",
};

const TYPE_META = {
  success: {
    icon: "✓",
    color: "#3ecf8e",
    style: {
      background: "rgba(62, 207, 142, 0.1)",
      borderColor: "rgba(62, 207, 142, 0.25)",
      color: "#3ecf8e",
      boxShadow:
        "0 4px 20px rgba(62, 207, 142, 0.12), 0 1px 4px rgba(0,0,0,0.18)",
    },
  },
  error: {
    icon: "✕",
    color: "#f87171",
    style: {
      background: "rgba(248, 113, 113, 0.1)",
      borderColor: "rgba(248, 113, 113, 0.25)",
      color: "#f87171",
      boxShadow:
        "0 4px 20px rgba(248, 113, 113, 0.12), 0 1px 4px rgba(0,0,0,0.18)",
    },
  },
  warning: {
    icon: "⚠",
    color: "#f0a855",
    style: {
      background: "rgba(240, 168, 85, 0.1)",
      borderColor: "rgba(240, 168, 85, 0.25)",
      color: "#f0a855",
      boxShadow:
        "0 4px 20px rgba(240, 168, 85, 0.12), 0 1px 4px rgba(0,0,0,0.18)",
    },
  },
  info: {
    icon: "ℹ",
    color: "#4da8f5",
    style: {
      background: "rgba(77, 168, 245, 0.1)",
      borderColor: "rgba(77, 168, 245, 0.25)",
      color: "#4da8f5",
      boxShadow:
        "0 4px 20px rgba(77, 168, 245, 0.12), 0 1px 4px rgba(0,0,0,0.18)",
    },
  },
};

const iconWrapStyle = (color) => ({
  width: 22,
  height: 22,
  borderRadius: 6,
  background: `${color}18`,
  border: `1px solid ${color}30`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
  fontWeight: 700,
  flexShrink: 0,
  color,
});

const messageStyle = {
  flex: 1,
  fontSize: 13,
  fontWeight: 500,
  lineHeight: 1.45,
};

const dismissStyle = {
  fontSize: 11,
  opacity: 0.4,
  flexShrink: 0,
  transition: "opacity 0.15s",
  marginLeft: 2,
};
