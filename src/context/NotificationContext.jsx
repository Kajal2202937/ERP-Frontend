import { createContext, useContext, useState, useCallback } from "react";

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

      {notifications.length > 0 && (
        <div style={containerStyle}>
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{ ...toastStyle, ...typeStyle[n.type] }}
              onClick={() => dismiss(n.id)}
            >
              <span style={iconStyle}>{typeIcon[n.type]}</span>
              <span style={{ flex: 1, fontSize: 13 }}>{n.message}</span>
            </div>
          ))}
        </div>
      )}
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
  maxWidth: 360,
};

const toastStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "12px 16px",
  borderRadius: 10,
  border: "1px solid",
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
  animation: "slideIn 0.2s ease",
  fontFamily: "var(--font, sans-serif)",
};

const typeStyle = {
  success: { background: "#dcfce7", borderColor: "#86efac", color: "#166534" },
  error: { background: "#fee2e2", borderColor: "#fca5a5", color: "#991b1b" },
  warning: { background: "#fef9c3", borderColor: "#fde047", color: "#854d0e" },
  info: { background: "#dbeafe", borderColor: "#93c5fd", color: "#1e40af" },
};

const iconStyle = { fontSize: 16, flexShrink: 0 };

const typeIcon = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",
};
